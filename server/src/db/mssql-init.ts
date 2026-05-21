import { getPool } from './mssql-connection.js';
import { runMigration } from './migrations/001-setup.js';
import { runMigration002 } from './migrations/002-add-zone-and-log-fields.js';
import { runMigration003 } from './migrations/003-add-user-to-fields.js';
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';
dotenv.config()

export async function initDatabase() {
  try {
    console.log('🔗 Connecting to MSSQL...');
    const pool = await getPool();
    
    // Test connection
    const result = await pool.request().query('SELECT GETDATE() as currentTime');
    console.log(`✅ Database connection verified at ${result.recordset[0].currentTime}`);

    // Run migrations
    console.log('\n📦 Running migrations...');
    await runMigration();
    await runMigration002();
    await runMigration003();

    // Ensure devices.fieldId is nullable
    try {
      await pool.request().query(`
        DECLARE @ConstraintName NVARCHAR(255)
        SELECT @ConstraintName = name
        FROM sys.foreign_keys
        WHERE parent_object_id = OBJECT_ID('devices')
          AND referenced_object_id = OBJECT_ID('fields')

        IF @ConstraintName IS NOT NULL
        BEGIN
            EXEC('ALTER TABLE devices DROP CONSTRAINT ' + @ConstraintName)
        END

        ALTER TABLE devices ALTER COLUMN fieldId NVARCHAR(50) NULL

        IF @ConstraintName IS NOT NULL
        BEGIN
            EXEC('ALTER TABLE devices ADD CONSTRAINT ' + @ConstraintName + ' FOREIGN KEY (fieldId) REFERENCES fields(id) ON DELETE CASCADE')
        END
      `);
      console.log('✅ Altered devices table: fieldId is now NULLABLE');
    } catch (err) {
      console.error('Failed to alter devices table fieldId:', err);
    }

    return pool;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

export async function seedDatabase() {
  try {
    const pool = await getPool();

    // Check if data already exists
    const result = await pool.request().query('SELECT COUNT(*) as count FROM users');
    if (result.recordset[0].count > 0) {
      console.log('📊 Database already has data, skipping seed');
      return;
    }

    console.log('\n🌱 Seeding sample data...');

    // ==================== USERS ====================
    await pool.request().query(`
      INSERT INTO users (id, username, password, fullName, email, role) VALUES 
        ('SYSTEM', 'system', 'system123', N'Hệ thống', 'system@smartfarm.com', 'ADMIN'),
        ('usr-001', 'admin',    'admin123',   N'Admin User',       'admin@smartfarm.com',     'ADMIN'),
        ('usr-002', 'managerA', 'manager123', N'Nguyễn Văn An',   'manager.a@smartfarm.com', 'MANAGER'),
        ('usr-003', 'managerB', 'manager123', N'Trần Thị Bình',   'manager.b@smartfarm.com', 'MANAGER'),
        ('usr-004', 'farmerC',  'farmer123',  N'Lê Văn Cường',    'farmer.c@smartfarm.com',  'FARMER'),
        ('usr-005', 'farmerD',  'farmer123',  N'Phạm Thị Dung',   'farmer.d@smartfarm.com',  'FARMER'),
        ('usr-006', 'farmerE',  'farmer123',  N'Hoàng Văn Em',    'farmer.e@smartfarm.com',  'FARMER'),
        ('usr-007', 'farmerF',  'farmer123',  N'Ngô Thị Phượng',  'farmer.f@smartfarm.com',  'FARMER')
    `);
    console.log('✅ Users seeded (admin, system, 2 managers, 4 farmers)');

    // ==================== FIELDS ====================
    await pool.request().query(`
      INSERT INTO fields (id, name, location, area, cropType, status, zoneCode, userId) VALUES
        ('fld-001', N'Cánh đồng Lúa Bắc', N'Thái Bình', 50.5, 'Rice',       'ACTIVE', 'ZN-A1', 'usr-002'),
        ('fld-002', N'Vườn Ngô Nam',       N'Long An',   75.0, 'Corn',       'ACTIVE', 'ZN-A2', 'usr-002'),
        ('fld-003', N'Khu Rau Sạch Đông',  N'Đà Nẵng',  30.0, 'Vegetables', 'ACTIVE', 'ZN-B1', 'usr-003')
    `);
    console.log('✅ Fields seeded');

    // ==================== DEVICES ====================
    await pool.request().query(`
      INSERT INTO devices (id, name, fieldId, type, status, unit) VALUES
        ('dev-001', N'Cảm biến nhiệt độ 1',  'fld-001', 'TEMPERATURE',             'online', '°C'),
        ('dev-002', N'Cảm biến độ ẩm 1',     'fld-001', 'HUMIDITY',                'online', '%'),
        ('dev-003', N'Độ ẩm đất 1',           'fld-001', 'SOIL_MOISTURE',           'online', '%'),
        ('dev-004', N'Máy bơm tưới 1',        'fld-001', 'PUMP',                    'online', ''),
        ('dev-005', N'Cảm biến nhiệt độ 2',  'fld-002', 'TEMPERATURE',             'online', '°C'),
        ('dev-006', N'Cảm biến độ ẩm 2',     'fld-002', 'HUMIDITY',                'online', '%'),
        ('dev-007', N'Đo lượng mưa',          'fld-002', 'RAINFALL',                'online', 'mm'),
        ('dev-008', N'Quạt thông gió',        'fld-002', 'FAN',                     'online', ''),
        ('dev-009', N'Cảm biến ánh sáng',     'fld-003', 'LIGHT',                   'online', 'lux'),
        ('dev-010', N'Cảm biến nhiệt độ 3',  'fld-003', 'TEMPERATURE',             'online', '°C'),
        ('dev-011', N'Cảm biến tốc độ gió',  'fld-003', 'WIND_SPEED',              'online', 'm/s'),
        ('dev-012', N'Cảm biến pH đất',      'fld-001', 'PH',                      'online', 'pH'),
        ('dev-013', N'Cảm biến EC',          'fld-002', 'ELECTRICAL_CONDUCTIVITY',  'online', 'mS/cm'),
        ('dev-014', N'Van tưới tự động',     'fld-003', 'VALVE',                   'online', '')
    `);
    console.log('✅ Devices seeded');

    // ==================== ALERTS ====================
    await pool.request().query(`
      INSERT INTO alerts (id, deviceId, message, type, isRead, createdAt) VALUES
        ('alr-001', 'dev-001', N'Nhiệt độ vượt ngưỡng 35°C tại Cánh đồng Lúa Bắc (Hiện tại: 36.5°C)', 'warning',  0, DATEADD(minute, -15, GETDATE())),
        ('alr-002', 'dev-002', N'Độ ẩm thấp hơn ngưỡng tối thiểu tại Cánh đồng Lúa Bắc (Hiện tại: 38%)', 'info', 1, DATEADD(hour, -2, GETDATE())),
        ('alr-003', 'dev-010', N'Nhiệt độ tăng cao bất thường tại Khu Rau Sạch Đông (Hiện tại: 39.8°C)', 'critical', 0, DATEADD(hour, -4, GETDATE())),
        ('alr-004', 'dev-003', N'Độ ẩm đất giảm nhanh dưới 55% tại Cánh đồng Lúa Bắc', 'warning', 1, DATEADD(day, -1, GETDATE())),
        ('alr-005', 'dev-005', N'Cảm biến nhiệt độ 2 phát hiện nhiệt độ quá thấp (15°C) tại Vườn Ngô Nam', 'warning', 0, DATEADD(day, -1, DATEADD(hour, -5, GETDATE()))),
        ('alr-006', 'dev-012', N'Độ pH đất ở mức axit cao (5.2 pH) tại Cánh đồng Lúa Bắc', 'critical', 0, DATEADD(day, -2, GETDATE())),
        ('alr-007', 'dev-006', N'Độ ẩm không khí tăng cao bất thường (>90%) tại Vườn Ngô Nam', 'info', 1, DATEADD(day, -2, DATEADD(hour, -8, GETDATE()))),
        ('alr-008', 'dev-011', N'Cảnh báo: Tốc độ gió vượt quá ngưỡng an toàn (15 m/s) tại Khu Rau Sạch Đông', 'warning', 0, DATEADD(day, -3, GETDATE())),
        ('alr-009', 'dev-009', N'Cảm biến ánh sáng bị bụi bẩn che khuất (0 lux giữa trưa) tại Khu Rau Sạch Đông', 'info', 1, DATEADD(day, -4, GETDATE())),
        ('alr-010', 'dev-013', N'Độ dẫn điện EC đo được tăng đột biến tại Vườn Ngô Nam', 'critical', 0, DATEADD(day, -5, GETDATE())),
        ('alr-011', 'dev-001', N'Nhiệt độ hạ nhiệt bình thường dưới 30°C tại Cánh đồng Lúa Bắc', 'info', 1, DATEADD(minute, -5, GETDATE())),
        ('alr-012', 'dev-004', N'Lỗi kết nối bộ điều khiển máy bơm 1 tại Cánh đồng Lúa Bắc', 'critical', 0, DATEADD(minute, -30, GETDATE()))
    `);
    console.log('✅ Alerts seeded');

    // ==================== SCHEDULES ====================
    await pool.request().query(`
      INSERT INTO schedules (id, fieldId, deviceId, name, action, cronExpression, isActive, createdAt) VALUES
        ('sch-001', 'fld-001', 'dev-004', N'Tưới nước sáng sớm Cánh đồng Lúa Bắc', 'on', '0 6 * * *', 1, DATEADD(day, -10, GETDATE())),
        ('sch-002', 'fld-001', 'dev-004', N'Tắt bơm nước sáng Cánh đồng Lúa Bắc', 'off', '30 6 * * *', 1, DATEADD(day, -10, GETDATE())),
        ('sch-003', 'fld-002', 'dev-008', N'Thông gió làm mát trưa Vườn Ngô Nam', 'on', '0 12 * * *', 1, DATEADD(day, -10, GETDATE())),
        ('sch-004', 'fld-002', 'dev-008', N'Tắt thông gió chiều Vườn Ngô Nam', 'off', '0 14 * * *', 1, DATEADD(day, -10, GETDATE())),
        ('sch-005', 'fld-003', 'dev-014', N'Tưới nước chiều Khu Rau Sạch Đông', 'on', '0 17 * * *', 0, DATEADD(day, -10, GETDATE())),
        ('sch-006', 'fld-003', 'dev-014', N'Tắt tưới nước chiều Khu Rau Sạch Đông', 'off', '15 17 * * *', 0, DATEADD(day, -10, GETDATE()))
    `);
    console.log('✅ Schedules seeded');

    // ==================== ACTION LOGS ====================
    await pool.request().query(`
      INSERT INTO action_logs (id, userId, action, target, targetId, details, fieldId, deviceId, triggeredBy, status, category, createdAt) VALUES
        ('log-001', 'usr-002', N'BẬT THIẾT BỊ', 'devices', 'dev-004', N'Người dùng Nguyễn Văn An bật máy bơm nước tưới qua giao diện Web', 'fld-001', 'dev-004', 'manual', 'success', 'user', DATEADD(minute, -45, GETDATE())),
        ('log-002', 'SYSTEM', N'BẬT THIẾT BỊ', 'devices', 'dev-004', N'Hệ thống tự động kích hoạt máy bơm nước theo lịch hẹn sch-001', 'fld-001', 'dev-004', 'schedule', 'success', 'device', DATEADD(hour, -16, GETDATE())),
        ('log-003', 'SYSTEM', N'TẮT THIẾT BỊ', 'devices', 'dev-004', N'Hệ thống tự động ngắt máy bơm nước theo lịch hẹn sch-002', 'fld-001', 'dev-004', 'schedule', 'success', 'device', DATEADD(hour, -15, DATEADD(minute, -30, GETDATE()))),
        ('log-004', 'SYSTEM', N'BẬT THIẾT BỊ', 'devices', 'dev-008', N'Nhiệt độ đo được quá cao (36.2°C) vượt ngưỡng an toàn (35°C), kích hoạt quạt thông gió tự động', 'fld-002', 'dev-008', 'threshold', 'success', 'device', DATEADD(hour, -3, GETDATE())),
        ('log-005', 'usr-003', N'TẮT THIẾT BỊ', 'devices', 'dev-014', N'Người dùng Trần Thị Bình tắt van tưới nước tự động khẩn cấp', 'fld-003', 'dev-014', 'manual', 'success', 'user', DATEADD(hour, -8, GETDATE())),
        ('log-006', 'usr-002', N'CẬP NHẬT CÁNH ĐỒNG', 'fields', 'fld-001', N'Cập nhật diện tích trồng trọt từ 48.0 ha lên 50.5 ha', 'fld-001', NULL, 'manual', 'success', 'user', DATEADD(day, -1, GETDATE())),
        ('log-007', 'usr-001', N'TẠO NGƯỜI DÙNG mới', 'users', 'usr-007', N'Tạo tài khoản Farmer mới tên Ngô Thị Phượng', NULL, NULL, 'manual', 'success', 'user', DATEADD(day, -2, GETDATE())),
        ('log-008', 'SYSTEM', N'CẢNH BÁO TỰ ĐỘNG', 'alerts', 'alr-003', N'Kích hoạt cảnh báo ĐỎ: Cảm biến đo được nhiệt độ cực đoan 39.8°C tại Khu Rau Sạch Đông', 'fld-003', 'dev-010', 'threshold', 'success', 'device', DATEADD(hour, -4, GETDATE())),
        ('log-009', 'usr-004', N'BẬT THIẾT BỊ', 'devices', 'dev-004', N'Nông dân Lê Văn Cường bật bơm thủ công để xả lũ cho ruộng lúa', 'fld-001', 'dev-004', 'manual', 'success', 'user', DATEADD(day, -1, DATEADD(hour, -6, GETDATE()))),
        ('log-010', 'SYSTEM', N'BẬT THIẾT BỊ', 'devices', 'dev-008', N'Hệ thống bật quạt thông gió 2 theo lịch hẹn sch-003', 'fld-002', 'dev-008', 'schedule', 'success', 'device', DATEADD(day, -1, DATEADD(hour, -10, GETDATE()))),
        ('log-011', 'SYSTEM', N'TẮT THIẾT BỊ', 'devices', 'dev-008', N'Hệ thống tắt quạt thông gió 2 theo lịch hẹn sch-004', 'fld-002', 'dev-008', 'schedule', 'success', 'device', DATEADD(day, -1, DATEADD(hour, -8, GETDATE()))),
        ('log-012', 'usr-002', N'BẬT THIẾT BỊ', 'devices', 'dev-004', N'Yêu cầu bật máy bơm thất bại: Thiết bị mất kết nối mạng điều khiển', 'fld-001', 'dev-004', 'manual', 'fail', 'user', DATEADD(minute, -28, GETDATE())),
        ('log-013', 'SYSTEM', N'BẬT THIẾT BỊ', 'devices', 'dev-004', N'Độ ẩm đất xuống dưới ngưỡng tối thiểu (58% < 60%), kích hoạt tưới tự động ruộng lúa', 'fld-001', 'dev-004', 'threshold', 'success', 'device', DATEADD(day, -2, DATEADD(hour, -4, GETDATE()))),
        ('log-014', 'SYSTEM', N'TẮT THIẾT BỊ', 'devices', 'dev-004', N'Độ ẩm đất đạt ngưỡng tối đa (78% >= 75%), tắt tưới tự động ruộng lúa', 'fld-001', 'dev-004', 'threshold', 'success', 'device', DATEADD(day, -2, DATEADD(hour, -3, GETDATE()))),
        ('log-015', 'usr-003', N'THAY ĐỔI CẤU HÌNH', 'thresholds', 'tr-003', N'Trần Thị Bình thay đổi ngưỡng độ ẩm đất của fld-001 từ 50-70% thành 60-80%', 'fld-001', 'dev-003', 'manual', 'success', 'user', DATEADD(day, -3, GETDATE())),
        ('log-016', 'usr-005', N'BẬT THIẾT BỊ', 'devices', 'dev-008', N'Nông dân Phạm Thị Dung bật quạt thông gió thủ công để giảm ngột ngạt cho ngô', 'fld-002', 'dev-008', 'manual', 'success', 'user', DATEADD(day, -3, DATEADD(hour, -2, GETDATE()))),
        ('log-017', 'usr-001', N'XÓA THIẾT BỊ', 'devices', 'dev-old', N'Admin xóa thiết bị cảm biến hỏng cũ ra khỏi hệ thống', NULL, NULL, 'manual', 'success', 'user', DATEADD(day, -4, GETDATE())),
        ('log-018', 'SYSTEM', N'KHỞI ĐỘNG HỆ THỐNG', 'server', 'SYSTEM', N'Khởi động lại IoT Gateway kết nối Adafruit IO thành công', NULL, NULL, 'SYSTEM', 'success', 'device', DATEADD(day, -5, GETDATE())),
        ('log-019', 'SYSTEM', N'MẤT KẾT NỐI', 'devices', 'dev-004', N'Cảnh báo mất kết nối mạng cảm biến với máy bơm 1 tại Cánh đồng Lúa Bắc', 'fld-001', 'dev-004', 'SYSTEM', 'success', 'device', DATEADD(minute, -30, GETDATE())),
        ('log-020', 'usr-002', N'SỬA LỊCH TRÌNH', 'schedules', 'sch-005', N'Tạm dừng lịch tưới chiều khu rau sạch Đông do thời tiết mưa lớn', 'fld-003', 'dev-014', 'manual', 'success', 'user', DATEADD(day, -1, DATEADD(hour, -2, GETDATE())))
    `);
    console.log('✅ Action logs seeded');

    // ==================== THRESHOLD RULES ====================
    await pool.request().query(`
      INSERT INTO threshold_rules (id, deviceId, parameter, minValue, maxValue, action, isActive) VALUES
        ('tr-001', 'dev-001', 'temperature', 20.0, 35.0, N'Bật quạt thông gió làm mát cánh đồng', 1),
        ('tr-002', 'dev-002', 'humidity', 40.0, 85.0, N'Mở van phun sương tăng ẩm', 1),
        ('tr-003', 'dev-003', 'soil_moisture', 60.0, 80.0, N'Bật máy bơm tưới nước tự động', 1),
        ('tr-004', 'dev-005', 'temperature', 18.0, 33.0, N'Kích hoạt hệ thống sưởi ấm hoặc tháo nước điều hòa nhiệt độ', 1),
        ('tr-005', 'dev-006', 'humidity', 50.0, 80.0, N'Bật quạt đối lưu không khí giảm ẩm tránh nấm bệnh', 1),
        ('tr-006', 'dev-010', 'temperature', 15.0, 30.0, N'Kéo lưới che nắng tự động giảm bức xạ mặt trời', 1)
    `);
    console.log('✅ Threshold rules seeded');

    // ==================== SENSOR HISTORY ====================
    await pool.request().query(`
      INSERT INTO sensor_history (id, deviceId, value, createdAt) VALUES
        ('sh-001', 'dev-001', 28.5, DATEADD(hour, -11, GETDATE())),
        ('sh-002', 'dev-001', 29.2, DATEADD(hour, -10, GETDATE())),
        ('sh-003', 'dev-001', 30.1, DATEADD(hour, -9, GETDATE())),
        ('sh-004', 'dev-001', 31.4, DATEADD(hour, -8, GETDATE())),
        ('sh-005', 'dev-001', 32.8, DATEADD(hour, -7, GETDATE())),
        ('sh-006', 'dev-001', 34.2, DATEADD(hour, -6, GETDATE())),
        ('sh-007', 'dev-001', 35.5, DATEADD(hour, -5, GETDATE())),
        ('sh-008', 'dev-001', 36.5, DATEADD(hour, -4, GETDATE())),
        ('sh-009', 'dev-001', 33.1, DATEADD(hour, -3, GETDATE())),
        ('sh-010', 'dev-001', 31.0, DATEADD(hour, -2, GETDATE())),
        ('sh-011', 'dev-001', 29.8, DATEADD(hour, -1, GETDATE())),
        ('sh-012', 'dev-001', 28.7, DATEADD(minute, -10, GETDATE())),
        
        ('sh-013', 'dev-002', 72.0, DATEADD(hour, -11, GETDATE())),
        ('sh-014', 'dev-002', 70.5, DATEADD(hour, -10, GETDATE())),
        ('sh-015', 'dev-002', 68.0, DATEADD(hour, -9, GETDATE())),
        ('sh-016', 'dev-002', 65.4, DATEADD(hour, -8, GETDATE())),
        ('sh-017', 'dev-002', 62.1, DATEADD(hour, -7, GETDATE())),
        ('sh-018', 'dev-002', 58.0, DATEADD(hour, -6, GETDATE())),
        ('sh-019', 'dev-002', 52.3, DATEADD(hour, -5, GETDATE())),
        ('sh-020', 'dev-002', 45.0, DATEADD(hour, -4, GETDATE())),
        ('sh-021', 'dev-002', 55.4, DATEADD(hour, -3, GETDATE())),
        ('sh-022', 'dev-002', 63.8, DATEADD(hour, -2, GETDATE())),
        ('sh-023', 'dev-002', 68.2, DATEADD(hour, -1, GETDATE())),
        ('sh-024', 'dev-002', 71.5, DATEADD(minute, -10, GETDATE())),
        
        ('sh-025', 'dev-003', 75.0, DATEADD(hour, -11, GETDATE())),
        ('sh-026', 'dev-003', 74.2, DATEADD(hour, -10, GETDATE())),
        ('sh-027', 'dev-003', 73.1, DATEADD(hour, -9, GETDATE())),
        ('sh-028', 'dev-003', 71.8, DATEADD(hour, -8, GETDATE())),
        ('sh-029', 'dev-003', 69.5, DATEADD(hour, -7, GETDATE())),
        ('sh-030', 'dev-003', 67.2, DATEADD(hour, -6, GETDATE())),
        ('sh-031', 'dev-003', 64.0, DATEADD(hour, -5, GETDATE())),
        ('sh-032', 'dev-003', 58.5, DATEADD(hour, -4, GETDATE())),
        ('sh-033', 'dev-003', 68.0, DATEADD(hour, -3, GETDATE())),
        ('sh-034', 'dev-003', 72.4, DATEADD(hour, -2, GETDATE())),
        ('sh-035', 'dev-003', 74.0, DATEADD(hour, -1, GETDATE())),
        ('sh-036', 'dev-003', 75.2, DATEADD(minute, -10, GETDATE()))
    `);
    console.log('✅ Sensor history seeded');

    console.log('\n✨ Database seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Main initialization
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  initDatabase()
    .then(() => seedDatabase())
    .then(() => {
      console.log('\n✅ Database ready for use!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Initialization error:', error);
      process.exit(1);
    });
}
