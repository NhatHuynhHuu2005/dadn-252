import { getPool } from './mssql-connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function resetDatabase() {
  try {
    console.log('🔄 Đang kết nối database để reset...');
    const pool = await getPool();
    
    // Đọc file SQL đã tạo
    // Bước 1: Đảm bảo Schema đúng (thêm cột userId vào fields)
    console.log('🏗️  Đang cập nhật schema (thêm cột userId)...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'fields' AND COLUMN_NAME = 'userId')
      BEGIN
          ALTER TABLE fields ADD userId VARCHAR(50);
      END
    `);

    // Bước 2: Đọc file SQL đã tạo (bỏ qua phần IF NOT EXISTS đầu file vì đã chạy ở trên)
    const sqlPath = path.join(__dirname, '../../reset-seed.sql');
    let sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('⏳ Đang thực thi script SQL reset dữ liệu...');
    await pool.request().query(sql);
    
    console.log('\n✅ RESET DATABASE THÀNH CÔNG!');
    console.log('--------------------------------------------------');
    console.log('Tài khoản mới:');
    console.log('- Admin: admin / admin123');
    console.log('- Manager A: managerA / manager123 (Quản lý Cánh đồng Lúa Bắc & Vườn Ngô Nam)');
    console.log('- Manager B: managerB / manager123 (Quản lý Khu Rau Sạch Đông)');
    console.log('- Farmers: farmerC, farmerD, farmerE, farmerF / farmer123');
    console.log('--------------------------------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi reset database:', error);
    process.exit(1);
  }
}

resetDatabase();
