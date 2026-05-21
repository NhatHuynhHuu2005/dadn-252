#include <Arduino.h>
#include "light.h"
#include "global.h"

#define LIGHT_PIN 34

void light_task(void *pvParameters) {

    pinMode(LIGHT_PIN, INPUT);

    while (1) {

        int light = analogRead(LIGHT_PIN);

        if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
            g_light = light;
            xSemaphoreGive(dataMutex);
        }

        Serial.print("Light: ");
        Serial.println(light);

        vTaskDelay(1998 / portTICK_PERIOD_MS);
    }
}