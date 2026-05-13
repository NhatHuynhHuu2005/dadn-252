-- ============================================================
-- SCRIPT RESET DỮ LIỆU NGƯỜI DÙNG & DỮ LIỆU MẪU
-- Chạy script này trong SSMS hoặc Azure Data Studio
-- để reset về cấu trúc 3 vai trò: Admin, Manager, Farmer
-- ============================================================

-- 1. Đảm bảo schema đúng (thêm cột userId nếu chưa có)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'fields' AND COLUMN_NAME = 'userId')
BEGIN
    ALTER TABLE fields ADD userId VARCHAR(50);
END

-- 2. Xóa dữ liệu cũ (theo thứ tự FK)
IF OBJECT_ID('alerts', 'U') IS NOT NULL DELETE FROM alerts;
IF OBJECT_ID('action_logs', 'U') IS NOT NULL DELETE FROM action_logs;
IF OBJECT_ID('threshold_rules', 'U') IS NOT NULL DELETE FROM threshold_rules;
IF OBJECT_ID('schedules', 'U') IS NOT NULL DELETE FROM schedules;
IF OBJECT_ID('sensor_logs', 'U') IS NOT NULL DELETE FROM sensor_logs;
IF OBJECT_ID('devices', 'U') IS NOT NULL DELETE FROM devices;
IF OBJECT_ID('fields', 'U') IS NOT NULL DELETE FROM fields;
IF OBJECT_ID('users', 'U') IS NOT NULL DELETE FROM users;

-- 2. Seed lại Users (3 vai trò: Admin, Manager A, Manager B, Farmer C, D, E, F)
INSERT INTO users (id, username, password, fullName, email, role) VALUES 
  ('usr-001', 'admin',    'admin123',   N'Admin User',       'admin@smartfarm.com',     'ADMIN'),
  ('usr-002', 'managerA', 'manager123', N'Nguyễn Văn An',   'manager.a@smartfarm.com', 'MANAGER'),
  ('usr-003', 'managerB', 'manager123', N'Trần Thị Bình',   'manager.b@smartfarm.com', 'MANAGER'),
  ('usr-004', 'farmerC',  'farmer123',  N'Lê Văn Cường',    'farmer.c@smartfarm.com',  'FARMER'),
  ('usr-005', 'farmerD',  'farmer123',  N'Phạm Thị Dung',   'farmer.d@smartfarm.com',  'FARMER'),
  ('usr-006', 'farmerE',  'farmer123',  N'Hoàng Văn Em',    'farmer.e@smartfarm.com',  'FARMER'),
  ('usr-007', 'farmerF',  'farmer123',  N'Ngô Thị Phượng',  'farmer.f@smartfarm.com',  'FARMER');

-- 3. Seed Fields
--    Manager A (usr-002) phụ trách fld-001 & fld-002
--    Manager B (usr-003) phụ trách fld-003
INSERT INTO fields (id, name, location, area, cropType, status, zoneCode, userId) VALUES
  ('fld-001', N'Cánh đồng Lúa Bắc', N'Thái Bình', 50.5, 'Rice',       'ACTIVE', 'ZN-A1', 'usr-002'),
  ('fld-002', N'Vườn Ngô Nam',       N'Long An',   75.0, 'Corn',       'ACTIVE', 'ZN-A2', 'usr-002'),
  ('fld-003', N'Khu Rau Sạch Đông',  N'Đà Nẵng',  30.0, 'Vegetables', 'ACTIVE', 'ZN-B1', 'usr-003');

-- 4. Seed Devices
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
  ('dev-014', N'Van tưới tự động',     'fld-003', 'VALVE',                   'online', '');

-- 5. Seed Alerts mẫu
INSERT INTO alerts (id, deviceId, message, type, isRead) VALUES
  ('alr-001', 'dev-001', N'Nhiệt độ vượt ngưỡng 35°C tại Cánh đồng Lúa Bắc', 'warning',  0),
  ('alr-002', 'dev-002', N'Độ ẩm thấp hơn ngưỡng tối thiểu tại Cánh đồng Lúa Bắc', 'info', 1),
  ('alr-003', 'dev-010', N'Nhiệt độ tăng cao bất thường tại Khu Rau Sạch Đông', 'critical', 0);

PRINT 'Reset completed! Users: admin, managerA, managerB, farmerC, farmerD, farmerE, farmerF';
