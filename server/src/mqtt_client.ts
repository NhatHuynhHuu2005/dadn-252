import mqtt from 'mqtt';
import { runAsync } from './db/connection.js';
import { broadcastSensorReading } from './ws-manager.js';

const client = mqtt.connect('mqtt://io.adafruit.com', {
  username: '===',
  password: '==='
});

// TODO: thay tên user trong feeds và deviceMap theo đúng tài khoản của bạn
const feeds = {
  temperature: 'Trn_nh1/feeds/temperature1',
  humidity: 'Trn_nh1/feeds/humidity1',
  soil: 'Trn_nh1/feeds/soil1',
  light: 'Trn_nh1/feeds/light1',
  button: 'Trn_nh1/feeds/button1'
};

const deviceMap: Record<string, string> = {
  [feeds.temperature]: 'dev-001',
  [feeds.humidity]: 'dev-002',
  [feeds.soil]: 'dev-003',
  [feeds.light]: 'dev-007',
  [feeds.button]: 'dev-012'
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
    // await runAsync(
    //   `UPDATE devices SET lastValue = ?, lastUpdate = CURRENT_TIMESTAMP WHERE id = ?`,
    //   [value, deviceId]
    // );
    await runAsync(
  `UPDATE devices SET lastValue = ?, status = 'online', lastUpdate = CURRENT_TIMESTAMP WHERE id = ?`,
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
// Hàm hỗ trợ gửi lệnh từ Backend lên Adafruit IO MQTT
export const publishDeviceControl = (deviceId: string, value: number) => {
  // Tìm ngược từ deviceId xem nó thuộc feed nào
  const topic = Object.keys(deviceMap).find(key => deviceMap[key] === deviceId);
  
  if (!topic) {
    console.error(`[MQTT ERROR] Không tìm thấy feed tương ứng với thiết bị: ${deviceId}`);
    return;
  }

  const payload = value.toString(); 
  
  client.publish(topic, payload, { qos: 1 }, (err) => {
    if (err) {
      console.error(`[MQTT ERROR] Gửi lệnh thất bại tới ${topic}:`, err);
    } else {
      console.log(`[MQTT SUCCESS] Đã gửi lệnh thành công tới ${topic} với giá trị: ${payload}`);
    }
  });
};