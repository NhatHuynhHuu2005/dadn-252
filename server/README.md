# Smart Farm Dashboard Backend

Node.js + Express + SQLite API server cho Smart Farm Dashboard

## Setup

### 1. Cài dependencies
```bash
npm install
```

### 2. Khởi tạo database
```bash
npm run db:init
```

### 3. Chạy server
```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:5000`

## API Endpoints

### Users
- `GET /api/users` - Lấy tất cả users
- `POST /api/users/login` - Đăng nhập
- `POST /api/users` - Tạo user
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user

### Fields (Canh đông)
- `GET /api/fields` - Lấy tất cả canh đông
- `GET /api/fields/:id` - Lấy chi tiết canh đông
- `POST /api/fields` - Tạo canh đông
- `PUT /api/fields/:id` - Cập nhật canh đông
- `DELETE /api/fields/:id` - Xóa canh đông

### Devices (Thiết bị)
- `GET /api/devices` - Lấy tất cả thiết bị
- `GET /api/devices/:id` - Lấy chi tiết thiết bị + history
- `POST /api/devices` - Tạo thiết bị
- `PUT /api/devices/:id` - Cập nhật thiết bị
- `DELETE /api/devices/:id` - Xóa thiết bị

### Alerts (Canh báo)
- `GET /api/alerts` - Lấy tất cả canh báo
- `GET /api/alerts/unread/count` - Lấy số canh báo chưa đọc
- `GET /api/alerts/device/:deviceId` - Lấy canh báo của device
- `POST /api/alerts` - Tạo canh báo
- `PUT /api/alerts/:id/read` - Đánh dấu đã đọc
- `DELETE /api/alerts/:id` - Xóa canh báo

### Schedules (Lịch hẹn)
- `GET /api/schedules` - Lấy tất cả schedules
- `GET /api/schedules/field/:fieldId` - Lấy schedules của field
- `POST /api/schedules` - Tạo schedule
- `PUT /api/schedules/:id` - Cập nhật schedule
- `DELETE /api/schedules/:id` - Xóa schedule

### Action Logs (Nhật ký)
- `GET /api/action-logs` - Lấy tất cả logs
- `GET /api/action-logs/user/:userId` - Lấy logs của user
- `POST /api/action-logs` - Tạo log

### Sensor History
- `GET /api/sensor-history/device/:deviceId` - Lấy lịch sử sensor
- `POST /api/sensor-history/batch` - Lấy lịch sử của nhiều devices
- `POST /api/sensor-history` - Thêm sensor reading

## Environment Variables

```env
PORT=5000
NODE_ENV=development
DB_PATH=./smartfarm.db
```

## Database Schema

- **users** - Thông tin tài khoản
- **fields** - Thông tin canh đông
- **devices** - Thông tin thiết bị
- **sensor_history** - Lịch sử dữ liệu sensor
- **alerts** - Thông báo cảnh báo
- **action_logs** - Nhật ký hoạt động
- **schedules** - Lịch hẹn tự động

## Build

```bash
npm run build
npm start
```
