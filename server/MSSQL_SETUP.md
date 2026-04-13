# MSSQL Setup Guide cho Smart Farm Dashboard

## 🔧 **Cài đặt MSSQL Server**

### **Windows Users - Download & Install:**
1. **MSSQL Server 2022 Express** (free): https://www.microsoft.com/en-us/sql-server/sql-server-downloads
2. **SQL Server Management Studio (SSMS)**: https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms

### **Docker Alternative (Nếu có Docker):**
```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123" `
  -p 1433:1433 --name smartfarm-mssql `
  -d mcr.microsoft.com/mssql/server:2022-latest
```

---

## 🚀 **Setup Backend với MSSQL**

### **1. Configure Connection (.env)**
Edit file `server/.env`:
```env
# MSSQL Configuration
MSSQL_SERVER=localhost          # hoặc IP address nếu remote
MSSQL_DATABASE=smartfarm_db
MSSQL_USER=sa                   # hoặc username khác
MSSQL_PASSWORD=                 # password của user
MSSQL_AUTH_TYPE=default         # hoặc 'ntlm' cho Windows Auth

PORT=5000
NODE_ENV=development
```

### **2. Create Database (Manual - SSMS)**
Hoặc chạy script này trong SSMS:
```sql
-- Tạo database
CREATE DATABASE smartfarm_db;
GO

-- Switch to database
USE smartfarm_db;
GO

-- Tạo login (nếu chưa có)
-- CREATE LOGIN smartfarm_user WITH PASSWORD = 'YourPassword123';
-- CREATE USER smartfarm_user FOR LOGIN smartfarm_user;
-- ALTER ROLE db_owner ADD MEMBER smartfarm_user;
```

### **3. Install Dependencies**
```bash
cd server
npm install
```

### **4. Run Migrations**
Tạo tables và triggers tự động:
```bash
npm run db:migrate
```

Hoặc chạy khi start server:
```bash
npm run dev
```

---

## 📊 **Kiểm Tra Database**

### **Cách 1: Dùng SSMS (SQL Server Management Studio)**
1. Open SSMS
2. Connect: `Server=localhost`, `Database=smartfarm_db`
3. View tables, data, triggers

### **Cách 2: Dùng Command Line**
```powershell
# Cần sqlcmd tool
sqlcmd -S localhost -d smartfarm_db -U sa

-- In sqlcmd:
SELECT * FROM users;
SELECT * FROM devices;
SELECT * FROM alerts;
GO
```

### **Cách 3: Dùng Node.js Script**
```typescript
const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'smartfarm_db',
  authentication: {
    type: 'default',
    options: {
      userName: 'sa',
      password: '',
    }
  },
  options: {
    trustServerCertificate: true,
  }
};

async function checkDb() {
  try {
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    
    const result = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
    `);
    
    console.log('Tables:', result.recordset.map(r => r.TABLE_NAME));
    await pool.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDb();
```

---

## ⚡ **Triggers Được Tạo Tự Động**

### **Trigger 1: Auto-update Device LastValue**
```sql
CREATE TRIGGER dbo.trg_update_device_on_sensor
ON sensor_history
AFTER INSERT
AS
BEGIN
  UPDATE devices
  SET lastValue = i.value, lastUpdate = GETDATE()
  FROM devices d
  INNER JOIN inserted i ON d.id = i.deviceId
END
```
**Tác dụng:** Tự động cập nhật `lastValue` của device khi có sensor reading mới

---

### **Trigger 3: Auto-create Alert on Abnormal Reading**
```sql
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
  WHERE i.value > 35  -- Tuỳ chỉnh ngưỡng ở đây
END
```
**Tác dụng:** Tự động tạo alert khi giá trị sensor vượt 35 độ

---

### **Bonus: Log Device Updates**
```sql
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
    ...,
    GETDATE()
  FROM devices d
  INNER JOIN inserted i ON d.id = i.id
END
```

---

## ✏️ **Tuỳ Chỉnh Ngưỡng Alert**

Để thay đổi ngưỡng từ 35 thành giá trị khác:

1. **Trong SSMS:**
```sql
USE smartfarm_db;
GO

ALTER TRIGGER dbo.trg_auto_alert_abnormal
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
  WHERE i.value > 40  -- Thay 40 thành số bạn muốn
END
```

2. **Hoặc sửa trong migration file:**
- Edit: `server/src/db/migrations/001-setup.ts`
- Thay `WHERE i.value > 35` thành `WHERE i.value > YOUR_VALUE`
- Chạy lại: `npm run db:migrate`

---

## 🔍 **Troubleshooting**

### **Error: "Cannot connect to MSSQL server"**
✅ **Solutions:**
- Kiểm tra MSSQL service đang chạy: `Get-Service MSSQLSERVER`
- Kiểm tra server name: Mở SQL Server Configuration Manager
- Kiểm tra port: Mặc định là 1433

### **Error: "Login failed for user 'sa'"**
✅ **Solutions:**
- Check password trong `.env`
- Reset SA password: Mở SSMS → Connect with Windows Auth → Change password

### **Error: "Database smartfarm_db does not exist"**
✅ **Solutions:**
- Tạo database thủ công: `CREATE DATABASE smartfarm_db;`
- Hoặc chạy migrations: `npm run db:migrate`

---

## 📝 **Sample Credentials**
```
Username: admin
Password: admin123
```

---

## 🚀 **Start Server**
```bash
cd server
npm run dev
```

Server sẽ:
1. Connect đến MSSQL
2. Tạo tables nếu chưa có
3. Tạo triggers
4. Seed sample data
5. Chạy trên http://localhost:5000

---

## 📖 **API Documentation**

### **Test Endpoints:**
```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get all devices
curl http://localhost:5000/api/devices

# Get device sensor history
curl 'http://localhost:5000/api/sensor-history/device/dev-001?limit=50'
```

---

**Bạn có câu hỏi gì không?** 😊
