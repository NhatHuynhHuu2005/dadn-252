import { getPool } from './mssql-connection.js';
import { runMigration } from './migrations/001-setup.js';

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

    // Seed users
    await pool.request().query(`
      INSERT INTO users (id, username, password, fullName, email, role)
      VALUES 
        ('usr-001', 'admin', 'admin123', 'Admin User', 'admin@smartfarm.com', 'ADMIN'),
        ('usr-002', 'manager', 'manager123', 'Manager User', 'manager@smartfarm.com', 'MANAGER'),
        ('usr-003', 'worker', 'worker123', 'Worker User', 'worker@smartfarm.com', 'WORKER'),
        ('usr-004', 'farmer', 'farmer123', 'Farmer User', 'farmer@smartfarm.com', 'FARMER')
    `);
    console.log('✅ Users seeded (admin, manager, worker, farmer)');

    // Seed fields
    await pool.request().query(`
      INSERT INTO fields (id, name, location, area, cropType, status)
      VALUES 
        ('fld-001', 'North Field', 'Ha Noi', 50.5, 'Rice', 'ACTIVE'),
        ('fld-002', 'South Field', 'Ho Chi Minh', 75.0, 'Corn', 'ACTIVE'),
        ('fld-003', 'East Field', 'Da Nang', 30.0, 'Vegetables', 'ACTIVE')
    `);
    console.log('✅ Fields seeded');

    // Seed devices
    await pool.request().query(`
      INSERT INTO devices (id, name, fieldId, type, status, unit)
      VALUES 
        ('dev-001', 'Temperature Sensor 1', 'fld-001', 'TEMPERATURE', 'ACTIVE', '°C'),
        ('dev-002', 'Humidity Sensor 1', 'fld-001', 'HUMIDITY', 'ACTIVE', '%'),
        ('dev-003', 'Soil Moisture 1', 'fld-001', 'SOIL_MOISTURE', 'ACTIVE', '%'),
        ('dev-004', 'Temperature Sensor 2', 'fld-002', 'TEMPERATURE', 'ACTIVE', '°C'),
        ('dev-005', 'Humidity Sensor 2', 'fld-002', 'HUMIDITY', 'ACTIVE', '%'),
        ('dev-006', 'Rain Gauge', 'fld-002', 'RAINFALL', 'ACTIVE', 'mm'),
        ('dev-007', 'Light Sensor 1', 'fld-003', 'LIGHT', 'ACTIVE', 'lux'),
        ('dev-008', 'Temperature Sensor 3', 'fld-003', 'TEMPERATURE', 'ACTIVE', '°C'),
        ('dev-009', 'Wind Speed', 'fld-003', 'WIND_SPEED', 'ACTIVE', 'm/s'),
        ('dev-010', 'pH Sensor', 'fld-001', 'PH', 'ACTIVE', 'pH'),
        ('dev-011', 'EC Sensor', 'fld-002', 'ELECTRICAL_CONDUCTIVITY', 'ACTIVE', 'mS/cm'),
        ('dev-012', 'Irrigation Control', 'fld-003', 'CONTROL', 'ACTIVE', 'relay')
    `);
    console.log('✅ Devices seeded');

    // Seed alerts
    await pool.request().query(`
      INSERT INTO alerts (id, deviceId, message, type, isRead)
      VALUES 
        ('alr-001', 'dev-001', 'Temperature exceeds 35°C', 'WARNING', 0),
        ('alr-002', 'dev-002', 'Low humidity detected', 'INFO', 1)
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
