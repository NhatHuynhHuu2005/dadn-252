import { getPool } from './mssql-connection.js';
import { runMigration } from './migrations/001-setup.js';
import { runMigration002 } from './migrations/002-add-zone-and-log-fields.js';
import { runMigration003 } from './migrations/003-add-user-to-fields.js';
import dotenv from 'dotenv'
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
    // Cấu trúc: admin (1) + manager A quản lý fld-001 & fld-002 + manager B quản lý fld-003
    //           farmer C, D chăm sóc fld-001 & fld-002 + farmer E, F chăm sóc fld-003
    await pool.request().query(`
      INSERT INTO users (id, username, password, fullName, email, role)
      VALUES 
        ('usr-001', 'admin',     'admin123',     'Admin User',      'admin@smartfarm.com',     'ADMIN'),
        ('usr-002', 'managerA',  'manager123',   'Nguyễn Văn An',   'manager.a@smartfarm.com', 'MANAGER'),
        ('usr-003', 'managerB',  'manager123',   'Trần Thị Bình',   'manager.b@smartfarm.com', 'MANAGER'),
        ('usr-004', 'farmerC',   'farmer123',    'Lê Văn Cường',    'farmer.c@smartfarm.com',  'FARMER'),
        ('usr-005', 'farmerD',   'farmer123',    'Phạm Thị Dung',   'farmer.d@smartfarm.com',  'FARMER'),
        ('usr-006', 'farmerE',   'farmer123',    'Hoàng Văn Em',    'farmer.e@smartfarm.com',  'FARMER'),
        ('usr-007', 'farmerF',   'farmer123',    'Ngô Thị Phượng',  'farmer.f@smartfarm.com',  'FARMER')
    `);
    console.log('✅ Users seeded (admin, 2 managers, 4 farmers)');

    // ==================== FIELDS ====================
    // fld-001, fld-002: Manager A phụ trách — Nông dân C, D chăm sóc
    // fld-003:          Manager B phụ trách — Nông dân E, F chăm sóc
    await pool.request().query(`
      INSERT INTO fields (id, name, location, area, cropType, status, zoneCode, userId)
      VALUES 
        ('fld-001', 'Cánh đồng Lúa Bắc', 'Thái Bình', 50.5, 'Rice',       'ACTIVE', 'ZN-A1', 'usr-002'),
        ('fld-002', 'Vườn Ngô Nam',       'Long An',   75.0, 'Corn',       'ACTIVE', 'ZN-A2', 'usr-002'),
        ('fld-003', 'Khu Rau Sạch Đông',  'Đà Nẵng',  30.0, 'Vegetables', 'ACTIVE', 'ZN-B1', 'usr-003')
    `);
    console.log('✅ Fields seeded');

    // ==================== DEVICES ====================
    await pool.request().query(`
      INSERT INTO devices (id, name, fieldId, type, status, unit)
      VALUES 
        ('dev-001', 'Cảm biến nhiệt độ 1',  'fld-001', 'TEMPERATURE',            'online', '°C'),
        ('dev-002', 'Cảm biến độ ẩm 1',     'fld-001', 'HUMIDITY',               'online', '%'),
        ('dev-003', 'Độ ẩm đất 1',           'fld-001', 'SOIL_MOISTURE',          'online', '%'),
        ('dev-004', 'Máy bơm tưới 1',        'fld-001', 'PUMP',                   'online', ''),
        ('dev-005', 'Cảm biến nhiệt độ 2',  'fld-002', 'TEMPERATURE',            'online', '°C'),
        ('dev-006', 'Cảm biến độ ẩm 2',     'fld-002', 'HUMIDITY',               'online', '%'),
        ('dev-007', 'Đo lượng mưa',          'fld-002', 'RAINFALL',               'online', 'mm'),
        ('dev-008', 'Quạt thông gió',        'fld-002', 'FAN',                    'online', ''),
        ('dev-009', 'Cảm biến ánh sáng',     'fld-003', 'LIGHT',                  'online', 'lux'),
        ('dev-010', 'Cảm biến nhiệt độ 3',  'fld-003', 'TEMPERATURE',            'online', '°C'),
        ('dev-011', 'Cảm biến tốc độ gió',  'fld-003', 'WIND_SPEED',             'online', 'm/s'),
        ('dev-012', 'Cảm biến pH đất',      'fld-001', 'PH',                     'online', 'pH'),
        ('dev-013', 'Cảm biến EC',          'fld-002', 'ELECTRICAL_CONDUCTIVITY', 'online', 'mS/cm'),
        ('dev-014', 'Van tưới tự động',     'fld-003', 'VALVE',                  'online', '')
    `);
    console.log('✅ Devices seeded');

    // ==================== ALERTS ====================
    await pool.request().query(`
      INSERT INTO alerts (id, deviceId, message, type, isRead)
      VALUES 
        ('alr-001', 'dev-001', N'Nhiệt độ vượt ngưỡng 35°C tại Cánh đồng Lúa Bắc', 'warning', 0),
        ('alr-002', 'dev-002', N'Độ ẩm thấp hơn ngưỡng tối thiểu', 'info', 1),
        ('alr-003', 'dev-010', N'Nhiệt độ tăng cao bất thường tại Khu Rau Sạch Đông', 'critical', 0)
    `);
    console.log('✅ Alerts seeded');

    console.log('\n✨ Database seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Main initialization
if (import.meta.url === `file://${process.argv[1]}`) {
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
