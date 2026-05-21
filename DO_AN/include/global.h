#ifndef GLOBAL_H
#define GLOBAL_H

#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/semphr.h"

// ===== Sensor data struct =====
typedef struct {
    float temperature;
    float humidity;
    int soilPercent;
    int light;
} SensorData;


// ===== Sensor data =====
extern float g_temperature;
extern float g_humidity;
extern int g_land;
extern int g_light;

// ===== Device state =====
extern bool g_pumpOn;
extern int g_soilPercent;
extern bool g_isDark;
extern const char* g_soilStatus;
extern const char* g_ledColor;

// ===== WiFi =====
extern const char* ssid;
extern const char* password;

// ===== Shared data =====
extern SensorData gSensorData;

// ===== Mutex =====
extern SemaphoreHandle_t dataMutex;
extern SemaphoreHandle_t xMutexLCD;
extern SemaphoreHandle_t xMutexSensor;
#define MODE_AUTO 0
#define MODE_MANUAL 1
extern String g_currentMode;
extern int g_pumpMode;       
extern bool g_manualPumpOn;  
// ===== MANUAL TIMEOUT =====
extern unsigned long g_lastManualTime;
extern int g_prevMode;
#endif