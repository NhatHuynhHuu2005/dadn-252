import mqtt from 'mqtt';
import { runAsync } from './db/connection.js';
import { broadcastSensorReading } from './ws-manager.js';

const client = mqtt.connect('mqtt://io.adafruit.com', {
  username: 'user',
  password: 'password'
});

// TODO: thay tên user trong feeds và deviceMap theo đúng tài khoản của bạn
const feeds = {
  temperature: 'user/feeds/temperature',
  humidity: 'user/feeds/humidity',
  soil: 'user/feeds/soil',
  light: 'user/feeds/light'
};

const deviceMap: Record<string, string> = {
  [feeds.temperature]: 'dev-001',
  [feeds.humidity]: 'dev-002',
  [feeds.soil]: 'dev-003',
  [feeds.light]: 'dev-007'
};

client.on('connect', () => {
  console.log('MQTT connected');

  Object.values(feeds).forEach(feed => {
    client.subscribe(feed);
  });
});

client.on('message', async (topic, message) => {
  console.log(`[MQTT DEBUG] Received message on topic: ${topic}, value: ${message.toString()}`);
  const value = parseFloat(message.toString());
  const deviceId = deviceMap[topic];

  if (!deviceId) {
    console.log(`[MQTT DEBUG] Topic ${topic} not found in deviceMap`);
    return;
  }

  const createdAt = new Date().toISOString();

  try {
    // insert history
    await runAsync(
      `INSERT INTO sensor_history (id, deviceId, value, createdAt)
       VALUES (?, ?, ?, ?)`,
      [`reading_${Date.now()}`, deviceId, value, createdAt]
    );

    // update device
    await runAsync(
      `UPDATE devices SET lastValue = ?, lastUpdate = CURRENT_TIMESTAMP WHERE id = ?`,
      [value, deviceId]
    );

    console.log(`Saved ${deviceId}: ${value}`);

    // 🔥 THÊM ĐOẠN NÀY (QUAN TRỌNG NHẤT)
    broadcastSensorReading(deviceId, {
      deviceId,
      value,
      createdAt
    });

  } catch (err) {
    console.error('MQTT save error:', err);
  }
});