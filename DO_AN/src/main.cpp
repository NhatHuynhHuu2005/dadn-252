#include <Arduino.h>
#include "global.h"
#include "temp_hum.h"
#include "land.h"
#include "light.h"
#include <WiFi.h>
#include <time.h>
#include "pump.h"
#include "RGB.h"
#include "send_task.h"

void setup() {
    Serial.begin(115200);
    dataMutex = xSemaphoreCreateMutex();
    xMutexLCD = xSemaphoreCreateMutex();
    xMutexSensor = xSemaphoreCreateMutex();

    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected");

    configTime(7 * 3600, 0, "pool.ntp.org");

    xTaskCreate(temp_hum_task, "TempHum", 4096, NULL, 1, NULL);
    xTaskCreate(land_task,     "Soil",    2048, NULL, 1, NULL);
    xTaskCreate(light_task,    "Light",   2048, NULL, 1, NULL);
    xTaskCreate(pump_task,     "Pump",    4096, NULL, 1, NULL);
    xTaskCreate(RGB_task,      "RGB",     4096, NULL, 1, NULL);
    xTaskCreate(send_task,     "Send",    4096, NULL, 1, NULL);
}

void loop() {
}