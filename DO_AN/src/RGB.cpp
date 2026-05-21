#include <Arduino.h>
#include <Adafruit_NeoPixel.h>
#include "global.h"
#include "light.h"

#define NEO_PIN 32
#define LED_COUNT 4

Adafruit_NeoPixel pixels(LED_COUNT, NEO_PIN, NEO_GRB + NEO_KHZ800);

void RGB_task(void *pvParameters) {
    pixels.begin();
    pixels.clear();
    pixels.show();

    while (1) {
        int land_raw;
        int light_raw;

        if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
            land_raw = g_land;
            light_raw = g_light;
            xSemaphoreGive(dataMutex);
        }

        int land_percent = map(land_raw, 4095, 0, 0, 100);

        bool soil_warning = (land_percent < 50 || land_percent > 80);
        bool is_dark = (light_raw < 2000);

        uint32_t color;
        const char* ledColor;
        const char* soilStatus;

        if (land_percent < 50) {
            soilStatus = "Dry";
        } else if (land_percent > 80) {
            soilStatus = "Wet";
        } else {
            soilStatus = "Good";
        }

        if (soil_warning && is_dark) {
            color = pixels.Color(0, 255, 0);
            ledColor = "GREEN";
            Serial.println("LED: GREEN (both)");
        }
        else if (soil_warning) {
            color = pixels.Color(255, 0, 0);
            ledColor = "RED";
            Serial.println("LED: RED (soil)");
        }
        else if (is_dark) {
            color = pixels.Color(255, 150, 0);
            ledColor = "YELLOW";
            Serial.println("LED: YELLOW (dark)");
        }
        else {
            color = pixels.Color(0, 0, 0);
            ledColor = "OFF";
            Serial.println("LED: OFF");
        }

        for (int i = 0; i < LED_COUNT; i++) {
            pixels.setPixelColor(i, color);
        }
        pixels.show();

        if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
            g_soilPercent = land_percent;
            g_isDark = is_dark;
            g_soilStatus = soilStatus;
            g_ledColor = ledColor;
            xSemaphoreGive(dataMutex);
        }

        vTaskDelay(2000 / portTICK_PERIOD_MS);
    }
}