import sql from 'mssql';
import { getPool } from '../mssql-connection.js';

export async function runMigration() {
  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await getPool();

    console.log('📝 Creating database tables...');

    // Create users table
    // Roles: ADMIN, MANAGER, WORKER, FARMER
    await pool.request().query(`
      IF NOT EXISTS(SELECT * FROM sys.tables WHERE name='users')
      CREATE TABLE users (
        id NVARCHAR(50) PRIMARY KEY,
        username NVARCHAR(50) UNIQUE NOT NULL,
        password NVARCHAR(255) NOT NULL,
        fullName NVARCHAR(100),
        email NVARCHAR(100),
        role NVARCHAR(20) DEFAULT 'FARMER',
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE(),
        CONSTRAINT chk_role CHECK (role IN ('ADMIN', 'MANAGER', 'WORKER', 'FARMER'))
      )
    `);
    console.log('✅ users table ready (roles: ADMIN, MANAGER, WORKER, FARMER)');

    // Create fields table
    await pool.request().query(`
      IF NOT EXISTS(SELECT * FROM sys.tables WHERE name='fields')
      CREATE TABLE fields (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        location NVARCHAR(255),
        area FLOAT,
        cropType NVARCHAR(50),
        status NVARCHAR(20) DEFAULT 'ACTIVE',
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE()
      )
    `);
    console.log('✅ fields table ready');

    // Create devices table
    await pool.request().query(`
      IF NOT EXISTS(SELECT * FROM sys.tables WHERE name='devices')
      CREATE TABLE devices (
        id NVARCHAR(50) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        fieldId NVARCHAR(50) NOT NULL,
        type NVARCHAR(50),
        status NVARCHAR(20) DEFAULT 'ACTIVE',
        lastValue FLOAT,
        unit NVARCHAR(20),
        lastUpdate DATETIME,
        createdAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (fieldId) REFERENCES fields(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ devices table ready');

    // Create sensor_history table
    await pool.request().query(`
      IF NOT EXISTS(SELECT * FROM sys.tables WHERE name='sensor_history')
      CREATE TABLE sensor_history (
        id NVARCHAR(50) PRIMARY KEY,
        deviceId NVARCHAR(50) NOT NULL,
        value FLOAT NOT NULL,
        timestamp DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ sensor_history table ready');

    // Create alerts table
    await pool.request().query(`
      IF NOT EXISTS(SELECT * FROM sys.tables WHERE name='alerts')
      CREATE TABLE alerts (
        id NVARCHAR(50) PRIMARY KEY,
        deviceId NVARCHAR(50) NOT NULL,
        message NVARCHAR(500),
        type NVARCHAR(20) DEFAULT 'INFO',
        isRead BIT DEFAULT 0,
        timestamp DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ alerts table ready');

    // Create schedules table
    await pool.request().query(`
      IF NOT EXISTS(SELECT * FROM sys.tables WHERE name='schedules')
      CREATE TABLE schedules (
        id NVARCHAR(50) PRIMARY KEY,
        fieldId NVARCHAR(50) NOT NULL,
        name NVARCHAR(100),
        type NVARCHAR(50),
        recurrence NVARCHAR(50),
        nextRun DATETIME,
        createdAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (fieldId) REFERENCES fields(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ schedules table ready');

    // Create action_logs table
    await pool.request().query(`
      IF NOT EXISTS(SELECT * FROM sys.tables WHERE name='action_logs')
      CREATE TABLE action_logs (
        id NVARCHAR(50) PRIMARY KEY,
        userId NVARCHAR(50),
        action NVARCHAR(50),
        target NVARCHAR(50),
        targetId NVARCHAR(50),
        details NVARCHAR(MAX),
        timestamp DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ action_logs table ready');

    console.log('\n🔧 Creating indexes...');

    await pool.request().query(`
      IF NOT EXISTS(SELECT * FROM sys.indexes WHERE name='idx_device_field')
      CREATE INDEX idx_device_field ON devices(fieldId)
    `);

    await pool.request().query(`
      IF NOT EXISTS(SELECT * FROM sys.indexes WHERE name='idx_sensor_device')
      CREATE INDEX idx_sensor_device ON sensor_history(deviceId)
    `);

    await pool.request().query(`
      IF NOT EXISTS(SELECT * FROM sys.indexes WHERE name='idx_alert_device')
      CREATE INDEX idx_alert_device ON alerts(deviceId)
    `);

    await pool.request().query(`
      IF NOT EXISTS(SELECT * FROM sys.indexes WHERE name='idx_schedule_field')
      CREATE INDEX idx_schedule_field ON schedules(fieldId)
    `);

    console.log('✅ Indexes created');

    console.log('\n⚡ Creating triggers...');

    // ==========================================
    // TRIGGER 1: Auto-update device lastValue
    // ==========================================
    // Bước 1: Xóa nếu đã tồn tại
    await pool.request().query(`
      IF OBJECT_ID('dbo.trg_update_device_on_sensor', 'TR') IS NOT NULL
        DROP TRIGGER dbo.trg_update_device_on_sensor;
    `);
    
    // Bước 2: Tạo mới (Lúc này CREATE TRIGGER đã là câu lệnh đầu tiên)
    await pool.request().query(`
      CREATE TRIGGER dbo.trg_update_device_on_sensor
      ON sensor_history
      AFTER INSERT
      AS
      BEGIN
        UPDATE devices
        SET 
          lastValue = i.value,
          lastUpdate = GETDATE()
        FROM devices d
        INNER JOIN inserted i ON d.id = i.deviceId
      END
    `);
    console.log('✅ Trigger 1: Auto-update device on sensor insert');

    // ==========================================
    // TRIGGER 3: Auto-create alert
    // ==========================================
    await pool.request().query(`
      IF OBJECT_ID('dbo.trg_auto_alert_abnormal', 'TR') IS NOT NULL
        DROP TRIGGER dbo.trg_auto_alert_abnormal;
    `);
      
    await pool.request().query(`
      CREATE TRIGGER dbo.trg_auto_alert_abnormal
      ON sensor_history
      AFTER INSERT
      AS
      BEGIN
        INSERT INTO alerts (id, deviceId, message, type, isRead, timestamp)
        SELECT 
          NEWID(),
          i.deviceId,
          'Cảnh báo: Giá trị cảm biến ' + CAST(i.value AS NVARCHAR(20)) + ' vượt ngưỡng!',
          'WARNING',
          0,
          GETDATE()
        FROM inserted i
        WHERE i.value > 35
      END
    `);
    console.log('✅ Trigger 3: Auto-create alert on abnormal reading (>35)');

    // ==========================================
    // Bonus Trigger: Log device updates
    // ==========================================
    await pool.request().query(`
      IF OBJECT_ID('dbo.trg_log_device_update', 'TR') IS NOT NULL
        DROP TRIGGER dbo.trg_log_device_update;
    `);
      
    await pool.request().query(`
      CREATE TRIGGER dbo.trg_log_device_update
      ON devices
      AFTER UPDATE
      AS
      BEGIN
        INSERT INTO action_logs (id, userId, action, target, targetId, details, timestamp)
        SELECT 
          NEWID(),
          'SYSTEM',
          'UPDATE',
          'devices',
          d.id,
          '{ "oldStatus": "' + ISNULL(d.status, 'NULL') + '", "newStatus": "' + ISNULL(i.status, 'NULL') + '", "oldLastValue": ' + CAST(ISNULL(d.lastValue, 0) AS NVARCHAR(20)) + ', "newLastValue": ' + CAST(ISNULL(i.lastValue, 0) AS NVARCHAR(20)) + ' }',
          GETDATE()
        FROM devices d
        INNER JOIN inserted i ON d.id = i.id
        WHERE d.status <> i.status OR d.lastValue <> i.lastValue
      END
    `);
    console.log('✅ Bonus Trigger: Log device updates to action_logs');

    console.log('\n✅ ✅ ✅ All migrations completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
    .then(() => {
      console.log('\n✨ Database is ready!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}
