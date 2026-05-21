# Hướng dẫn Scheduler Tự động

## Tính năng mới đã thêm

### 1. **Scheduler tự động chạy lịch**
- Hệ thống tự động quét database mỗi phút để cập nhật lịch
- Thực thi lịch theo đúng cron expression
- Tự động bật/tắt thiết bị theo lịch đã đặt

### 2. **Kiểm tra trạng thái thiết bị**
- Trước khi điều khiển, hệ thống kiểm tra:
  - ✅ Thiết bị có tồn tại không
  - ✅ Thiết bị có đang online không
- Nếu thiết bị offline → Ghi log thất bại, KHÔNG điều khiển

### 3. **Ghi log tự động**
- **Thành công**: Ghi log với status = 'success'
- **Thất bại**: Ghi log với status = 'fail' và lý do:
  - "Thiết bị không tồn tại"
  - "Thiết bị đang offline, không thể điều khiển"
  - "Lỗi hệ thống: ..."

## Cách kiểm tra

### Bước 1: Restart server
```bash
cd server
npm run dev
```

Bạn sẽ thấy log:
```
✅ Database ready
[Scheduler] Starting schedule manager...
[Scheduler] Registered schedule: Tưới nước sáng sớm Cánh đồng Lúa Bắc (0 6 * * *)
✅ Scheduler started
⏰ Scheduler: Active
```

### Bước 2: Tạo lịch test
1. Vào trang **Lịch hẹn**
2. Bấm **"Thêm lịch mới"**
3. Điền thông tin:
   - Tên: "Test lịch tự động"
   - Cánh đồng: Chọn bất kỳ
   - Thiết bị: Chọn thiết bị **ONLINE**
   - Hành động: "on" hoặc "off"
   - Cron: `*/2 * * * *` (chạy mỗi 2 phút)
4. Bấm **Lưu**

### Bước 3: Kiểm tra log server
Sau 2 phút, bạn sẽ thấy log trong terminal:
```
[Scheduler] Executing schedule: Test lịch tự động
[Scheduler] Successfully executed: Test lịch tự động - Máy bơm tưới 1 -> on
```

### Bước 4: Kiểm tra trong giao diện
1. Vào trang **Nhật ký hoạt động**
2. Bạn sẽ thấy log mới:
   - Hành động: "BẬT THIẾT BỊ" hoặc "TẮT THIẾT BỊ"
   - Kích hoạt bởi: "Lịch tự động" (badge màu vàng)
   - Trạng thái: "Thành công" hoặc "Thất bại"

## Test trường hợp thiết bị offline

### Cách 1: Thay đổi trạng thái trong database
```sql
UPDATE devices SET status = 'offline' WHERE id = 'dev-004';
```

### Cách 2: Thay đổi qua giao diện (nếu có)
1. Vào trang **Thiết bị**
2. Tìm thiết bị muốn test
3. Đổi trạng thái thành "Offline"

### Kết quả mong đợi
Khi lịch chạy với thiết bị offline:
- ❌ Thiết bị KHÔNG được điều khiển
- ✅ Log ghi nhận: "Thiết bị đang offline, không thể điều khiển"
- ✅ Status = 'fail'

## Cách biết thiết bị đang offline

### 1. Trong trang Thiết bị
- Chấm tròn **đỏ** = Offline
- Chấm tròn **xanh** = Online

### 2. Trong trang Dashboard
- Thiết bị offline hiển thị badge "Offline" màu đỏ

### 3. Trong database
```sql
SELECT id, name, status FROM devices WHERE status = 'offline';
```

### 4. Trong log
Khi scheduler thất bại, log sẽ có:
- `status = 'fail'`
- `details` chứa lý do: "Thiết bị đang offline..."

## Cron Expression Examples

| Cron | Mô tả |
|------|-------|
| `*/2 * * * *` | Mỗi 2 phút |
| `0 6 * * *` | 6:00 sáng mỗi ngày |
| `30 18 * * *` | 6:30 chiều mỗi ngày |
| `0 */4 * * *` | Mỗi 4 giờ |
| `0 8 * * 1-5` | 8:00 sáng thứ 2-6 |

## Troubleshooting

### Lịch không chạy
1. Kiểm tra server có log `[Scheduler] Starting schedule manager...` không
2. Kiểm tra lịch có `isActive = true` không
3. Kiểm tra cron expression có hợp lệ không

### Thiết bị không bật/tắt
1. Kiểm tra thiết bị có online không
2. Kiểm tra MQTT connection
3. Xem log trong terminal có lỗi gì không

### Log không hiển thị
1. Kiểm tra database có bảng `action_logs` không
2. Refresh trang Nhật ký hoạt động
3. Kiểm tra filter có đang lọc log không

## Lưu ý quan trọng

⚠️ **Scheduler chỉ chạy khi server đang chạy**
- Nếu tắt server, lịch sẽ không được thực thi
- Khi restart server, scheduler sẽ tự động load lại tất cả lịch active

⚠️ **Thiết bị offline sẽ KHÔNG được điều khiển**
- Đây là tính năng an toàn
- Tránh gửi lệnh đến thiết bị không kết nối

⚠️ **Cron expression phải hợp lệ**
- Sử dụng [crontab.guru](https://crontab.guru/) để test
- Format: `phút giờ ngày tháng thứ`
