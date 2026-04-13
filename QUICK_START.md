# 🚀 Quick Start - Backend Setup

## 1️⃣ Cài Dependencies

Backend dùng MSSQL, không còn dùng SQLite.

- express - Web framework
- mssql - Database driver
- cors - Cross-origin support
- dotenv - Environment variables

## 2️⃣ Database

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
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

## 5️⃣ Test API

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

## 📝 Notes

- Backend hiện chạy với MSSQL, không phải SQLite.
- Nếu `npm run dev` báo `Login failed for user 'sa'`, hãy kiểm tra mật khẩu SA và biến `MSSQL_PASSWORD` trong [server/.env](server/.env).
- Nếu login API trả `Invalid credentials`, hãy kiểm tra tài khoản demo đã được seed chưa.
