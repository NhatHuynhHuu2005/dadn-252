import cron from 'node-cron';
import { allAsync, runAsync } from './db/connection.js';
import { publishDeviceControl } from './mqtt_client.js';

interface Schedule {
  id: string;
  fieldId: string;
  deviceId: string;
  name: string;
  action: string;
  cronExpression: string;
  isActive: boolean;
}

interface Device {
  id: string;
  name: string;
  status: string;
  fieldId: string;
}

const activeTasks = new Map<string, cron.ScheduledTask>();

/**
 * Khởi động scheduler - quét database mỗi phút để cập nhật lịch
 */
export function startScheduler() {
  console.log('[Scheduler] Starting schedule manager...');
  
  // Quét và cập nhật lịch mỗi phút
  cron.schedule('* * * * *', async () => {
    try {
      await syncSchedules();
    } catch (error) {
      console.error('[Scheduler] Error syncing schedules:', error);
    }
  });
  
  // Chạy ngay lần đầu
  syncSchedules();
  
  console.log('[Scheduler] Schedule manager started successfully');
}

/**
 * Đồng bộ lịch từ database
 */
async function syncSchedules() {
  try {
    const schedules = await allAsync<Schedule>(
      'SELECT * FROM schedules WHERE isActive = 1'
    );
    
    // Xóa các task không còn active
    for (const [scheduleId, task] of activeTasks.entries()) {
      const stillActive = schedules.find(s => s.id === scheduleId);
      if (!stillActive) {
        task.stop();
        activeTasks.delete(scheduleId);
        console.log(`[Scheduler] Stopped schedule: ${scheduleId}`);
      }
    }
    
    // Thêm hoặc cập nhật task
    for (const schedule of schedules) {
      if (!activeTasks.has(schedule.id)) {
        registerSchedule(schedule);
      }
    }
    
  } catch (error) {
    console.error('[Scheduler] Error in syncSchedules:', error);
  }
}

/**
 * Đăng ký một lịch mới
 */
function registerSchedule(schedule: Schedule) {
  try {
    // Validate cron expression
    if (!cron.validate(schedule.cronExpression)) {
      console.error(`[Scheduler] Invalid cron expression for ${schedule.id}: ${schedule.cronExpression}`);
      return;
    }
    
    const task = cron.schedule(schedule.cronExpression, async () => {
      await executeSchedule(schedule);
    });
    
    activeTasks.set(schedule.id, task);
    console.log(`[Scheduler] Registered schedule: ${schedule.name} (${schedule.cronExpression})`);
    
  } catch (error) {
    console.error(`[Scheduler] Error registering schedule ${schedule.id}:`, error);
  }
}

/**
 * Thực thi một lịch
 */
async function executeSchedule(schedule: Schedule) {
  console.log(`[Scheduler] Executing schedule: ${schedule.name}`);
  
  try {
    // 1. Kiểm tra thiết bị có tồn tại và online không
    const device = await allAsync<Device>(
      'SELECT * FROM devices WHERE id = ?',
      [schedule.deviceId]
    );
    
    if (!device || device.length === 0) {
      await logAction(schedule, 'fail', `Thiết bị không tồn tại`);
      console.error(`[Scheduler] Device not found: ${schedule.deviceId}`);
      return;
    }
    
    const deviceInfo = device[0];
    
    if (deviceInfo.status !== 'online') {
      await logAction(schedule, 'fail', `Thiết bị đang offline, không thể điều khiển`);
      console.warn(`[Scheduler] Device offline: ${deviceInfo.name} (${schedule.deviceId})`);
      return;
    }
    
    // 2. Gửi lệnh điều khiển qua MQTT
    const value = schedule.action.toLowerCase() === 'on' ? 1 : 0;
    publishDeviceControl(schedule.deviceId, value);
    
    // 3. Cập nhật lastValue trong database
    await runAsync(
      'UPDATE devices SET lastValue = ? WHERE id = ?',
      [value, schedule.deviceId]
    );
    
    // 4. Ghi log thành công
    await logAction(
      schedule,
      'success',
      `Hệ thống tự động ${schedule.action === 'on' ? 'bật' : 'tắt'} ${deviceInfo.name} theo lịch hẹn ${schedule.name}`
    );
    
    console.log(`[Scheduler] Successfully executed: ${schedule.name} - ${deviceInfo.name} -> ${schedule.action}`);
    
  } catch (error) {
    console.error(`[Scheduler] Error executing schedule ${schedule.id}:`, error);
    await logAction(schedule, 'fail', `Lỗi hệ thống: ${(error as Error).message}`);
  }
}

/**
 * Ghi log hành động
 */
async function logAction(schedule: Schedule, status: 'success' | 'fail', details: string) {
  try {
    const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await runAsync(
      `INSERT INTO action_logs (id, userId, action, target, targetId, details, fieldId, deviceId, triggeredBy, status, category, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE())`,
      [
        logId,
        'SYSTEM',
        schedule.action.toUpperCase() === 'ON' ? 'BẬT THIẾT BỊ' : 'TẮT THIẾT BỊ',
        'devices',
        schedule.deviceId,
        details,
        schedule.fieldId,
        schedule.deviceId,
        'schedule',
        status,
        'device'
      ]
    );
  } catch (error) {
    console.error('[Scheduler] Error logging action:', error);
  }
}

/**
 * Dừng tất cả scheduler
 */
export function stopScheduler() {
  console.log('[Scheduler] Stopping all schedules...');
  for (const [scheduleId, task] of activeTasks.entries()) {
    task.stop();
    console.log(`[Scheduler] Stopped: ${scheduleId}`);
  }
  activeTasks.clear();
  console.log('[Scheduler] All schedules stopped');
}
