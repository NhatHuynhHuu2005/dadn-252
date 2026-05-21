#include <WiFi.h>
#include "Adafruit_MQTT.h"
#include "Adafruit_MQTT_Client.h"
#include "global.h"

#define WIFI_SSID "your_wifi"
#define WIFI_PASS "pass_wifi"

#define AIO_SERVER      "io.adafruit.com"
#define AIO_SERVERPORT  1883

#define AIO_USERNAME    "User"
#define AIO_KEY         "Key_MQTT"

WiFiClient client;

Adafruit_MQTT_Client mqtt(
  &client,
  AIO_SERVER,
  AIO_SERVERPORT,
  AIO_USERNAME,
  AIO_KEY
);

// ===== FEED =====
Adafruit_MQTT_Publish tempFeed(&mqtt, AIO_USERNAME "/feeds/temperature1");
Adafruit_MQTT_Publish humFeed(&mqtt, AIO_USERNAME "/feeds/humidity1");
Adafruit_MQTT_Publish soilFeed(&mqtt, AIO_USERNAME "/feeds/soil1");
Adafruit_MQTT_Publish lightFeed(&mqtt, AIO_USERNAME "/feeds/light1");

Adafruit_MQTT_Subscribe buttonFeed(&mqtt, AIO_USERNAME "/feeds/button1");
Adafruit_MQTT_Publish buttonFeedPub(&mqtt, AIO_USERNAME "/feeds/button1");

// ===== STATE =====
unsigned long lastSend = 0;
int8_t lastPublishedPumpState = -1; 
unsigned long ignoreSyncUntil = 0; // BIẾN MỚI: Khóa đồng bộ ngược

// ===== WIFI =====
void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

// ===== MQTT =====
void MQTT_connect() {
  if (mqtt.connected()) return;
  while (mqtt.connect() != 0) {
    mqtt.disconnect();
    delay(2000);
  }
}

// ===== TASK =====
void send_task(void *pvParameters) {

  Serial.begin(115200);
  mqtt.subscribe(&buttonFeed);

  while (1) {

    connectWiFi();
    MQTT_connect();
    mqtt.processPackets(10);
    mqtt.ping();

    bool currentPumpOn = false;
    if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
      currentPumpOn = g_pumpOn;
      xSemaphoreGive(dataMutex);
    }

    // ================================================================
    // CẬP NHẬT TRẠNG THÁI LÊN NÚT NHẤN ADAFRUIT (ĐỒNG BỘ AUTO/TIMER)
    // CHỈ CHẠY KHI ĐÃ HẾT THỜI GIAN KHÓA ĐỒNG BỘ (Tránh dội ngược)
    // ================================================================
    if (millis() > ignoreSyncUntil) {
      if (currentPumpOn != lastPublishedPumpState) {
        if (currentPumpOn) {
          buttonFeedPub.publish("1"); 
        } else {
          buttonFeedPub.publish("0"); 
        }
        lastPublishedPumpState = currentPumpOn; 
        Serial.printf("Đã đồng bộ trạng thái bơm lên Adafruit: %s\n", currentPumpOn ? "ON" : "OFF");
      }
    }

    // ================================================================
    // NHẬN LỆNH TỪ NÚT NHẤN (BUTTON)
    // ================================================================
    Adafruit_MQTT_Subscribe *subscription;
    while ((subscription = mqtt.readSubscription(50))) {

      if (subscription == &buttonFeed) {

        String value = (char *)buttonFeed.lastread;
        value.trim();

        bool incomingCmd = (value == "1" || value == "ON");

        if (incomingCmd != currentPumpOn) {
          
          if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
            if (g_pumpMode != MODE_MANUAL) {
              g_prevMode = g_pumpMode;
            }
            g_pumpMode = MODE_MANUAL;
            g_manualPumpOn = incomingCmd;
            g_lastManualTime = millis();
            xSemaphoreGive(dataMutex);
          }
          
          lastPublishedPumpState = incomingCmd; 

          // KHÓA ĐỒNG BỘ LÊN WEB TRONG 1.5 GIÂY (Cho pump_task thời gian để chạy kịp)
          ignoreSyncUntil = millis() + 1500; 
          
          Serial.println("Nhận lệnh từ Web -> Chuyển sang MANUAL");
        }
      }
    }

    // ===== SEND SENSOR =====
    if (millis() - lastSend > 8000) {

      float temp, hum;
      int light, soil;

      if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
        temp  = g_temperature;
        hum   = g_humidity;
        light = g_light;
        soil  = g_soilPercent;
        xSemaphoreGive(dataMutex);
      }

      tempFeed.publish(temp);
      humFeed.publish(hum);
      soilFeed.publish(soil);
      lightFeed.publish(light);

      lastSend = millis();
    }

    vTaskDelay(10 / portTICK_PERIOD_MS);
  }
}















// #include <Arduino.h>
// #include <WiFi.h>
// #include <HTTPClient.h>
// #include "global.h"
// #include "send_task.h"

// // ⚠️ sửa IP đúng máy bạn + thêm đúng endpoint
// const char* serverUrl = "http://10.163.210.147:5000/api/sensor-history";

// // Định nghĩa deviceId cho từng cảm biến (theo database)
// const char* deviceIdTemp = "dev-001";   // Nhiệt độ
// const char* deviceIdHum = "dev-002";    // Độ ẩm không khí
// const char* deviceIdLand = "dev-003";   // Độ ẩm đất
// const char* deviceIdLight = "dev-007";  // Ánh sáng

// void sendSensorData(const char* deviceId, String value) {
//     HTTPClient http;
//     http.begin(serverUrl);
//     http.addHeader("Content-Type", "application/json");
    
//     // Tạo JSON đúng format backend yêu cầu
//      String json = "{";
//     json += "\"deviceId\":\"" + String(deviceId) + "\",";
//     json += "\"value\":" + value;
//     json += "}";
    
//     Serial.print("Sending: ");
//     Serial.println(json);
    
//     int httpResponseCode = http.POST(json);
//     Serial.print("HTTP Response: ");
//     Serial.println(httpResponseCode);
    
//     http.end();
// }

// void send_task(void *pvParameters) {

//     // ===== WiFi connect =====
//     WiFi.begin(ssid, password);
//     while (WiFi.status() != WL_CONNECTED) {
//         delay(500);
//         Serial.print(".");
//     }
//     Serial.println("\nWiFi connected");

//     while (1) {
//         int land, light;
//         float temp, hum;
        
//         // ===== lấy dữ liệu từ các task =====
//         if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
//             temp = g_temperature;
//             hum = g_humidity;
//             land = g_soilPercent;
//             light = g_light;
//             xSemaphoreGive(dataMutex);
//         }

//         // ===== gửi từng cảm biến =====
//         sendSensorData(deviceIdTemp, String(temp));
//         delay(10);
        
//         sendSensorData(deviceIdHum, String(hum));
//         delay(10);
        
//         sendSensorData(deviceIdLand, String(land));
//         delay(10);
        
//         sendSensorData(deviceIdLight, String(light));
//         delay(10);

    
//         vTaskDelay(2000 / portTICK_PERIOD_MS);
//     }
// } 