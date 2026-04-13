/**
 * IoT Device Simulator
 * Simulates real IoT sensors sending readings to the Smart Farm Backend
 * 
 * Run: npx ts-node src/iot-simulator.ts
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Simulated devices (from database seed)
const SIMULATED_DEVICES = [
  {
    id: 'dev-001',
    name: 'Temperature Sensor 1',
    type: 'temperature',
    baseValue: 28.5,
    unit: '°C',
    variance: 2,
  },
  {
    id: 'dev-002',
    name: 'Humidity Sensor 1',
    type: 'humidity',
    baseValue: 72,
    unit: '%',
    variance: 8,
  },
  {
    id: 'dev-003',
    name: 'Soil Moisture 1',
    type: 'soil_moisture',
    baseValue: 45,
    unit: '%',
    variance: 10,
  },
  {
    id: 'dev-007',
    name: 'Light Sensor 1',
    type: 'light',
    baseValue: 550,
    unit: 'lux',
    variance: 80,
  },
  {
    id: 'dev-008',
    name: 'Temperature Sensor 3',
    type: 'temperature',
    baseValue: 31.4,
    unit: '°C',
    variance: 1.5,
  },
];

function generateSensorValue(baseValue: number, variance: number): number {
  // Generate value with gaussian noise
  const randomVariance = (Math.random() + Math.random() + Math.random() - 1.5) * variance;
  const value = baseValue + randomVariance;
  return Math.round(value * 10) / 10;
}

async function sendSensorReading(deviceId: string, value: number) {
  try {
    const response = await axios.post(`${API_BASE}/sensor-history`, {
      id: `reading_${deviceId}_${Date.now()}`,
      deviceId,
      value,
    });
    console.log(`✅ ${deviceId}: Value = ${value} ✓`);
    return response.data;
  } catch (error) {
    console.error(`❌ ${deviceId}: Failed to send reading`, error instanceof Error ? error.message : error);
  }
}

async function simulateDevices() {
  console.log('🌾 Smart Farm IoT Device Simulator');
  console.log(`📤 Sending sensor readings every 5 seconds...\n`);

  let iteration = 0;

  const interval = setInterval(async () => {
    iteration++;
    console.log(`\n📊 Iteration ${iteration} - ${new Date().toLocaleTimeString('vi-VN')}`);

    for (const device of SIMULATED_DEVICES) {
      const value = generateSensorValue(device.baseValue, device.variance);
      await sendSensorReading(device.id, value);
    }
  }, 5000);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down simulator...');
    clearInterval(interval);
    process.exit(0);
  });

  // Initial reading
  for (const device of SIMULATED_DEVICES) {
    const value = generateSensorValue(device.baseValue, device.variance);
    await sendSensorReading(device.id, value);
  }
}

// Start simulator
simulateDevices().catch((error) => {
  console.error('💥 Simulator error:', error);
  process.exit(1);
});
