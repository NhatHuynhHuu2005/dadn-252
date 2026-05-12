# 🚀 Quick Start - Backend Setup

## 1️⃣ Cài Dependencies

<<<<<<< HEAD
Backend đã cài packages thành công! ✅

- express - Web framework
- sqlite3 - Database
=======
Backend dùng MSSQL, không còn dùng SQLite.

- express - Web framework
- mssql - Database driver
>>>>>>> khanh
- cors - Cross-origin support
- dotenv - Environment variables

## 2️⃣ Database

<<<<<<< HEAD
Database đã khởi tạo tại: `server/smartfarm.db`

### Sample Data:
| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | admin |
| farmer | farmer123 | farmer |

### 3 Canh Đông:
- Canh dong 1 (Lua) - 2.5 hectares
- Canh dong 2 (Ca chua) - 1.8 hectares
- Canh dong 3 (Rau xanh) - 3.2 hectares

### 12 Thiết Bị Sensor:
- Temperature, Humidity, Soil Moisture, Light, pH sensors

## 3️⃣ Chạy Server

```bash
cd server
=======
Backend cần kết nối vào MSSQL Server, database tên là `smartfarm_db`.

Tài khoản demo được seed từ migration:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN |
| manager | manager123 | MANAGER |
| worker | worker123 | WORKER |
| farmer | farmer123 | FARMER |

## 3️⃣ Cấu hình MSSQL

Xem hướng dẫn đầy đủ trong [server/MSSQL_SETUP.md](server/MSSQL_SETUP.md).

Lưu ý quan trọng:
- `MSSQL_PASSWORD` trong [server/.env](server/.env) phải trùng với mật khẩu SA của SQL Server hoặc container Docker.
- Nếu bạn chạy SQL Server bằng Docker, hãy dùng đúng mật khẩu khi tạo container.

## 4️⃣ Chạy Server

```bash
cd server
npm install
>>>>>>> khanh
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

<<<<<<< HEAD
## 4️⃣ Test API
=======
## 5️⃣ Test API
>>>>>>> khanh

### Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

<<<<<<< HEAD
## 📚 Next Steps

1. **Hoàn thành các API routes** (fields, devices, alerts, schedules, etc.)
2. **Thêm WebSocket** cho real-time updates
3. **Kết nối Frontend** với Backend API
4. **Thêm Authentication** (JWT tokens)
5. **Mock edge device** gửi dữ liệu sensor

## 📝 Notes

- Hiện tại chỉ có `/api/users` endpoints
- Các routes khác (fields, devices, etc.) cần được hoàn thành
- Database đã có sample data để test
- CORS đã bật để frontend có thể gọi
=======
## 📝 Notes

- Backend hiện chạy với MSSQL, không phải SQLite.
- Nếu `npm run dev` báo `Login failed for user 'sa'`, hãy kiểm tra mật khẩu SA và biến `MSSQL_PASSWORD` trong [server/.env](server/.env).
- Nếu login API trả `Invalid credentials`, hãy kiểm tra tài khoản demo đã được seed chưa.
>>>>>>> khanh
