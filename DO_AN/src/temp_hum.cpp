#include "temp_hum.h"
#include <Wire.h>
#include "LiquidCrystal_I2C.h"
#include "global.h"
#include "DHT20.h"
DHT20 dht20;
LiquidCrystal_I2C lcd(0x21, 16, 2);

void temp_hum_task(void *pvParameters) {

    Wire.begin(21, 22);
    Serial.begin(115200);
    Wire.setClock(100000);

    vTaskDelay(2000 / portTICK_PERIOD_MS);

    dht20.begin();
    lcd.begin();
    lcd.backlight();

    SensorData data;

    while (1) {

        // ===== Đọc DHT20 =====
        if (xSemaphoreTake(xMutexSensor, portMAX_DELAY)) {

            if (dht20.read() != 0) {
                xSemaphoreGive(xMutexSensor);
                Serial.println("DHT20 read error");
                vTaskDelay(500 / portTICK_PERIOD_MS);
                continue;
            }

            data.temperature = dht20.getTemperature();
            data.humidity = dht20.getHumidity();

            xSemaphoreGive(xMutexSensor);
        }

        // ===== Lọc lỗi =====
        if (isnan(data.temperature) || isnan(data.humidity) ||
            data.temperature < -10 || data.temperature > 80) {
            Serial.println("Invalid DHT data!");
            continue;
        }

        float temp, hum;
        int soilRaw, light;
        int soilPercent;

        // ===== Ghi + đọc global =====
        if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
            g_temperature = data.temperature;
            g_humidity = data.humidity;
          //  g_soilPercent = soilPercent;  
            temp = g_temperature;
            hum = g_humidity;
            soilRaw = g_land;
            light = g_light;

            xSemaphoreGive(dataMutex);
        }

        // ===== Convert soil → % =====
        soilPercent = (int) round((4095.0 - soilRaw) * 100.0 / 4095.0);

        soilPercent = constrain(soilPercent, 0, 100);
        if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
             g_soilPercent = soilPercent;   
                xSemaphoreGive(dataMutex);
            }
        // ===== HIỂN THỊ LCD =====
        if (xSemaphoreTake(xMutexLCD, portMAX_DELAY)) {

            lcd.clear();

            // Dòng 1
            lcd.setCursor(0, 0);
            lcd.print("T:");
            lcd.print(temp, 1);
            lcd.print((char)223);
            lcd.print(" ");

            lcd.print("H:");
            lcd.print(hum, 1);
            lcd.print("%");

            // Dòng 2
            lcd.setCursor(0, 1);
            lcd.print("S:");
            lcd.print(soilPercent);
            lcd.print("%");

            lcd.print(" L:");
            lcd.print(light);

            xSemaphoreGive(xMutexLCD);
        }

        vTaskDelay(2000 / portTICK_PERIOD_MS);
    }
}