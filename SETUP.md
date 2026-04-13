# Smart Farm Dashboard - Full Setup Guide

Hướng dẫn chạy cả Frontend và Backend

## 📋 Yêu cầu
- Node.js 16+
- npm hoặc yarn

## 🚀 Setup & Chạy

### 1️⃣ Backend Setup (Terminal 1)

```bash
cd server
npm install
npm run db:init
npm run dev
```

Backend sẽ chạy tại: `http://localhost:5000`

### 2️⃣ Frontend Setup (Terminal 2)

```bash
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173` (hoặc port khác)

## 📚 API Documentation

Backend API documentation: `server/README.md`

### Các endpoint chính:
- `GET /api/fields` - Lấy danh sách canh đông
- `GET /api/devices` - Lấy danh sách thiết bị
- `GET /api/alerts` - Lấy danh sách canh báo
- `POST /api/users/login` - Đăng nhập
- Xem chi tiết tại `server/README.md`

## 🗄️ Database

- **Loại**: SQLite3
- **Vị trí**: `server/smartfarm.db`
- **Khởi tạo**: Tự động khi chạy `npm run db:init`

### Test Data
Database sẽ tự động có sample data:
- Users: admin (admin123), farmer (farmer123)
- Fields: 3 canh đông mẫu
- Devices: 12 thiết bị mẫu
- Alerts: 2 canh báo mẫu

## 🔄 Frontend → Backend Integration

Frontend chích hiện đang dùng mock data từ `src/app/data/mock-data.ts`.

Để sử dụng backend thực:
1. Tạo API client từ `src/app/api/` hoặc `src/app/services/`
2. Cập nhật các page components để gọi API thay vì mock data
3. Thêm env variable: `VITE_API_URL=http://localhost:5000/api`

## 🛠️ Production Build

### Backend
```bash
cd server
npm run build
npm start
```

### Frontend
```bash
npm run build
npm run preview
```

## 📝 Notes

- Authentication: Hiện tại là mock (mock password trong database)
- Sensor Data: Thêm dữ liệu qua `POST /api/sensor-history`
- Real-time: Chưa có WebSocket, có thể thêm sau
