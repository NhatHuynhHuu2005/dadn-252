#include "global.h"

// ===== Sensor data =====
float g_temperature = 0;
float g_humidity = 0;
int g_land = 0;
int g_light = 0;

// ===== Device state =====
bool g_pumpOn = false;
int g_soilPercent = 0;
bool g_isDark = false;
const char* g_soilStatus = "Good";
const char* g_ledColor = "OFF";

// ===== WiFi =====
const char* ssid = "Nh1";
const char* password = "04050607@";

// ===== Shared data =====
SensorData gSensorData = {0, 0,0,0};

// ===== Mutex =====
SemaphoreHandle_t dataMutex;
SemaphoreHandle_t xMutexLCD;
SemaphoreHandle_t xMutexSensor;

int g_pumpMode = MODE_AUTO;
bool g_manualPumpOn = false;
String g_currentMode = "AUTO";
// ===== MANUAL TIMEOUT =====
unsigned long g_lastManualTime = 0;
int g_prevMode = MODE_AUTO;