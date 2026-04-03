import db, { runAsync, getAsync, allAsync } from './connection.js';

export async function initDatabase() {
  const queries = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Fields table
    `CREATE TABLE IF NOT EXISTS fields (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      area REAL NOT NULL,
      cropType TEXT NOT NULL,
      status TEXT NOT NULL,
      lastUpdate DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Devices table
    `CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      fieldId TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      lastValue REAL,
      unit TEXT,
      installDate DATETIME,
      lastUpdate DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (fieldId) REFERENCES fields(id)
    )`,

    // Sensor history table
    `CREATE TABLE IF NOT EXISTS sensor_history (
      id TEXT PRIMARY KEY,
      deviceId TEXT NOT NULL,
      value REAL NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (deviceId) REFERENCES devices(id)
    )`,

    // Create index for sensor history
    `CREATE INDEX IF NOT EXISTS idx_sensor_history_device 
    ON sensor_history(deviceId, timestamp)`,

    // Alerts table
    `CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      deviceId TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      isRead INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (deviceId) REFERENCES devices(id)
    )`,

    // Action logs table
    `CREATE TABLE IF NOT EXISTS action_logs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      action TEXT NOT NULL,
      target TEXT,
      targetId TEXT,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`,

    // Schedules table
    `CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      fieldId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      recurrence TEXT,
      nextRun DATETIME,
      isActive INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (fieldId) REFERENCES fields(id)
    )`
  ];

  for (const query of queries) {
    await runAsync(query);
  }

  console.log('Database initialized successfully');
}

// Seed sample data if tables are empty
export async function seedDatabase() {
  const userCount = await getAsync('SELECT COUNT(*) as count FROM users');
  if (userCount.count > 0) {
    console.log('Database already has data, skipping seed');
    return;
  }

  // Insert sample users
  await runAsync(
    `INSERT INTO users (id, username, password, fullName, email, role)
    VALUES (?, ?, ?, ?, ?, ?)`,
    ['user-1', 'admin', 'admin123', 'Admin User', 'admin@smartfarm.com', 'admin']
  );

  await runAsync(
    `INSERT INTO users (id, username, password, fullName, email, role)
    VALUES (?, ?, ?, ?, ?, ?)`,
    ['user-2', 'farmer', 'farmer123', 'Nong Dan', 'farmer@smartfarm.com', 'farmer']
  );

  // Insert sample fields
  const fields = [
    ['field-1', 'Canh dong 1', 'Huyen Nam Dinh, Ha Noi', 2.5, 'Lua', 'active'],
    ['field-2', 'Canh dong 2', 'Thanh Tri, Ha Noi', 1.8, 'Ca chua', 'active'],
    ['field-3', 'Canh dong 3', 'Dong Anh, Ha Noi', 3.2, 'Rau xanh', 'active']
  ];

  for (const field of fields) {
    await runAsync(
      `INSERT INTO fields (id, name, location, area, cropType, status)
      VALUES (?, ?, ?, ?, ?, ?)`,
      field
    );
  }

  // Insert sample devices
  const devices = [
    ['device-1', 'Cam bien nhiet do 1', 'field-1', 'temperature', 'online', 28.5, '°C'],
    ['device-2', 'Cam bien do am 1', 'field-1', 'humidity', 'online', 72, '%'],
    ['device-3', 'Cam bien do am dat 1', 'field-1', 'soil_moisture', 'online', 65, '%'],
    ['device-4', 'Cam bien anh sang 1', 'field-1', 'light', 'online', 850, 'lux'],
    ['device-5', 'Cam bien pH dat 1', 'field-1', 'ph', 'online', 6.2, 'pH'],
    ['device-6', 'Cam bien nhiet do 2', 'field-2', 'temperature', 'online', 26.3, '°C'],
    ['device-7', 'Cam bien do am 2', 'field-2', 'humidity', 'online', 68, '%'],
    ['device-8', 'Cam bien do am dat 2', 'field-2', 'soil_moisture', 'online', 58, '%'],
    ['device-9', 'Cam bien anh sang 2', 'field-2', 'light', 'online', 1100, 'lux'],
    ['device-10', 'Cam bien nhiet do 3', 'field-3', 'temperature', 'online', 24.1, '°C'],
    ['device-11', 'Cam bien do am 3', 'field-3', 'humidity', 'online', 75, '%'],
    ['device-12', 'Cam bien do am dat 3', 'field-3', 'soil_moisture', 'offline', null, '%']
  ];

  for (const device of devices) {
    await runAsync(
      `INSERT INTO devices (id, name, fieldId, type, status, lastValue, unit)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      device
    );
  }

  // Insert sample alerts
  await runAsync(
    `INSERT INTO alerts (id, deviceId, message, type, isRead)
    VALUES (?, ?, ?, ?, ?)`,
    ['alert-1', 'device-3', 'Do am dat thap, can tuoi nuoc', 'warning', 0]
  );

  await runAsync(
    `INSERT INTO alerts (id, deviceId, message, type, isRead)
    VALUES (?, ?, ?, ?, ?)`,
    ['alert-2', 'device-12', 'Thiet bi mat ket noi', 'critical', 0]
  );

  console.log('Database seeded with sample data');
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      await initDatabase();
      await seedDatabase();
      process.exit(0);
    } catch (error) {
      console.error('Database initialization failed:', error);
      process.exit(1);
    }
  })();
}
