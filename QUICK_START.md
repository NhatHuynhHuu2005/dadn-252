# 🚀 Quick Start - Backend Setup

## 1️⃣ Cài Dependencies

Backend đã cài packages thành công! ✅

- express - Web framework
- sqlite3 - Database
- cors - Cross-origin support
- dotenv - Environment variables

## 2️⃣ Database

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
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

## 4️⃣ Test API

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
