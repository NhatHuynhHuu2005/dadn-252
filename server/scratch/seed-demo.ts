import { getPool } from '../src/db/mssql-connection.js';

async function seedDemoData() {
  try {
    const pool = await getPool();
    console.log('🌱 Seeding beautiful demo data...');

    // 0. Ensure SYSTEM user exists
    await pool.request().query(`
      IF NOT EXISTS (SELECT 1 FROM users WHERE id = 'SYSTEM')
      INSERT INTO users (id, username, password, fullName, email, role)
      VALUES ('SYSTEM', 'system', 'system', 'Hệ thống (Tự động)', 'system@localhost', 'ADMIN')
    `);
    
    // 1. Update existing fields with zoneCodes
    await pool.request().query(`
      UPDATE fields SET zoneCode = N'Khu A', name = N'Vùng trồng Lúa', location = N'Lô 1 - Cánh đồng Đông' WHERE id = 'fld-001';
      UPDATE fields SET zoneCode = N'Khu B', name = N'Vùng trồng Bắp', location = N'Lô 4 - Cánh đồng Tây' WHERE id = 'fld-002';
      UPDATE fields SET zoneCode = N'Khu C', name = N'Khu nhà màng', location = N'Nhà kính số 2' WHERE id = 'fld-003';
    `);
    console.log('✅ Fields updated with zoneCode');

    // 2. Add some more devices (Actuators) to the fields
    await pool.request().query(`
      DELETE FROM devices WHERE id IN ('dev-101', 'dev-102', 'dev-103', 'dev-104', 'dev-105');
      INSERT INTO devices (id, name, fieldId, type, status, unit)
      VALUES 
        ('dev-101', N'Máy bơm nước A', 'fld-001', 'PUMP', 'ACTIVE', ''),
        ('dev-102', N'Van tưới tự động', 'fld-001', 'VALVE', 'ACTIVE', ''),
        ('dev-103', N'Quạt hút nhà màng', 'fld-003', 'FAN', 'OFFLINE', ''),
        ('dev-104', N'Đèn quang hợp', 'fld-003', 'LIGHT_CONTROL', 'ACTIVE', ''),
        ('dev-105', N'Máy bơm bón phân', 'fld-002', 'PUMP', 'ERROR', '')
    `);
    console.log('✅ Actuators added');

    // 3. Add some Schedules
    await pool.request().query(`
      DELETE FROM schedules WHERE id LIKE 'sch-%';
      INSERT INTO schedules (id, fieldId, deviceId, name, action, cronExpression, isActive)
      VALUES
        ('sch-001', 'fld-001', 'dev-101', N'Tưới sáng sớm', 'on', '0 6 * * *', 1),
        ('sch-002', 'fld-001', 'dev-101', N'Tắt máy bơm', 'off', '0 7 * * *', 1),
        ('sch-003', 'fld-003', 'dev-104', N'Bật đèn ban đêm', 'on', '0 18 * * *', 1),
        ('sch-004', 'fld-002', 'dev-105', N'Bón phân định kỳ', 'on', '0 8 * * 1', 0)
    `);
    console.log('✅ Schedules added');

    // 4. Add some Action Logs
    await pool.request().query(`
      DELETE FROM action_logs;
      INSERT INTO action_logs (id, userId, action, target, targetId, details, fieldId, deviceId, triggeredBy, status, category)
      VALUES
        ('log-001', 'usr-002', N'Bật máy bơm', N'Thiết bị', N'Máy bơm nước A', N'Bật thủ công từ ứng dụng', 'fld-001', 'dev-101', 'manual', 'success', 'user'),
        ('log-002', 'usr-003', N'Tắt van tưới', N'Thiết bị', N'Van tưới tự động', N'Tắt thủ công', 'fld-001', 'dev-102', 'manual', 'success', 'user'),
        ('log-003', 'usr-001', N'Cập nhật lịch', N'Lịch hẹn', N'Tưới sáng sớm', N'Đổi giờ tưới', 'fld-001', 'dev-101', 'manual', 'success', 'user'),
        ('log-004', 'SYSTEM', N'Thực thi lịch hẹn', N'Thiết bị', N'Đèn quang hợp', N'Tự động bật theo lịch (0 18 * * *)', 'fld-003', 'dev-104', 'schedule', 'success', 'device'),
        ('log-005', 'SYSTEM', N'Thực thi theo ngưỡng', N'Thiết bị', N'Quạt hút nhà màng', N'Nhiệt độ vượt 35 độ', 'fld-003', 'dev-103', 'threshold', 'fail', 'device'),
        ('log-006', 'usr-002', N'Cập nhật thiết bị', N'Thiết bị', N'Máy bơm bón phân', N'Báo lỗi thiết bị', 'fld-002', 'dev-105', 'manual', 'success', 'user'),
        ('log-007', 'SYSTEM', N'Thực thi lịch hẹn', N'Thiết bị', N'Máy bơm nước A', N'Tự động bật theo lịch (0 6 * * *)', 'fld-001', 'dev-101', 'schedule', 'success', 'device')
    `);
    console.log('✅ Action logs added');

    // 5. Add some Sensor History (for the last 24 hours)
    await pool.request().query(`DELETE FROM sensor_history;`);
    for (let i = 0; i < 20; i++) {
      const temp = 25 + Math.random() * 10;
      const hum = 60 + Math.random() * 20;
      // Subtract hours
      const dateString = new Date(Date.now() - (20 - i) * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);
      
      await pool.request().query(`
        INSERT INTO sensor_history (id, deviceId, value, createdAt)
        VALUES ('hist-temp-${i}', 'dev-001', ${temp.toFixed(2)}, '${dateString}'),
               ('hist-hum-${i}', 'dev-002', ${hum.toFixed(2)}, '${dateString}')
      `);
    }
    console.log('✅ Sensor history added');

    console.log('✨ Demo data seeded beautifully!');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi seed data:', err);
    process.exit(1);
  }
}

seedDemoData();
