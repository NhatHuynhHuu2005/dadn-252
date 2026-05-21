#include <Arduino.h>
#include "pump.h"
#include "global.h"
#include <time.h>

#define PUMP_PIN 26   

void pump_task(void *pvParameters) {

    pinMode(PUMP_PIN, OUTPUT);
    digitalWrite(PUMP_PIN, LOW);

    unsigned long lastDebugTime = 0; // Biến dùng để chống spam Serial monitor

    while (1) {

        int land_percent;
        int mode;
        bool manualPumpOn;
        unsigned long lastManualTime;
        int prevMode;

        // ===== READ GLOBAL =====
        if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
            land_percent = g_soilPercent;
            mode = g_pumpMode;
            manualPumpOn = g_manualPumpOn;
            lastManualTime = g_lastManualTime;
            prevMode = g_prevMode;
            xSemaphoreGive(dataMutex);
        }

        // ===== TIMEOUT MANUAL 5s (Sửa lại 5000ms theo yêu cầu) =====
        if (mode == MODE_MANUAL) {
            // Nếu quá 5 giây (5000ms) kể từ lần cuối nhận tín hiệu MQTT
            if (millis() - lastManualTime > 5000) {

                if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
                    g_pumpMode = prevMode; // Trả về mode trước đó
                    mode = g_pumpMode;     // Cập nhật lại biến mode cục bộ để xử lý ngay bên dưới
                    xSemaphoreGive(dataMutex);
                }

                Serial.println("Manual timeout 5s -> Trở lại mode cũ");
            }
        }

        // ===== AUTO =====
        bool auto_need_water = (land_percent < 50 || land_percent > 80);

        // ===== TIMER =====
        bool timer_active = false;
        struct tm timeinfo;

        if (getLocalTime(&timeinfo)) {
            int hour = timeinfo.tm_hour;
            int minute = timeinfo.tm_min;

            bool inMorning   = (hour == 7  && minute < 15);
            bool inAfternoon = (hour == 17 && minute < 15);

            timer_active = inMorning || inAfternoon;
        }

        // ===== MODE LOGIC (Quyền lực tuyệt đối) =====
        bool pump_on = false;
        String currentMode = "AUTO";

        if (mode == MODE_MANUAL) {
            // Khi ở chế độ Manual, bỏ qua hoàn toàn Auto và Timer
            pump_on = manualPumpOn;
            currentMode = "MANUAL";

        } else {
            // Khi không ở Manual, ưu tiên Timer trước, sau đó mới tới Auto
            if (timer_active) {
                pump_on = true;
                currentMode = "TIMER";
            } else {
                pump_on = auto_need_water;
                currentMode = "AUTO";
            }
        }

        // ===== OUTPUT (Thực thi ngay lập tức) =====
        digitalWrite(PUMP_PIN, pump_on ? HIGH : LOW);

        // ===== UPDATE GLOBAL =====
        if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
            g_pumpOn = pump_on;
            g_currentMode = currentMode;
            xSemaphoreGive(dataMutex);
        }

        // ===== DEBUG (In ra Serial mỗi 2 giây để không bị spam) =====
        if (millis() - lastDebugTime > 2000) {
            Serial.printf("MODE:%s | SOIL:%d%% | TIMER:%d | PUMP:%s\n",
                currentMode.c_str(),
                land_percent,
                timer_active,
                pump_on ? "ON" : "OFF"
            );
            lastDebugTime = millis();
        }

        // ===== DELAY NHỎ ĐỂ TĂNG TỐC ĐỘ PHẢN HỒI =====
        // Task lặp lại mỗi 50ms -> Bơm phản hồi gần như tức thì với MQTT
        vTaskDelay(50 / portTICK_PERIOD_MS);
    }
}