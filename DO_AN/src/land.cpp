#include <Arduino.h>
#include "land.h"
#include "global.h"

#define LAND_PIN 33   

void land_task(void *pvParameters) {

    pinMode(LAND_PIN, INPUT);

    while (1) {

        int land = analogRead(LAND_PIN);

        if (xSemaphoreTake(dataMutex, portMAX_DELAY)) {
            g_land = land;
            xSemaphoreGive(dataMutex);
        }

        Serial.print("Land: ");
        Serial.println(land);

        vTaskDelay(1998 / portTICK_PERIOD_MS);
    }
}