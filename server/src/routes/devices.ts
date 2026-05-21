import { Router, Request, Response } from 'express';
import { getAsync, allAsync, runAsync } from '../db/connection.js';
import { publishDeviceControl } from '../mqtt_client.js';
const router = Router();

// Helper: normalize device type to lowercase
const normalizeDevice = (d: any) => d ? { ...d, type: d.type?.toLowerCase() ?? d.type } : d;
const normalizeDevices = (arr: any[]) => arr.map(normalizeDevice);

// Get all devices
router.get('/', async (req: Request, res: Response) => {
  try {
    const devices = await allAsync('SELECT * FROM devices ORDER BY createdAt DESC');
    res.json(normalizeDevices(devices));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Get device by ID with history
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const device = await getAsync('SELECT * FROM devices WHERE id = ?', [req.params.id]);
    if (!device) return res.status(404).json({ error: 'Device not found' });

    // Get sensor history (last 100 records)
    const history = await allAsync(
      `SELECT TOP (100) * FROM sensor_history WHERE deviceId = ?
      ORDER BY timestamp DESC`,
      [req.params.id]
    );

    res.json({ ...normalizeDevice(device), history: history.reverse() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

// Create device
// Create device
router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, name, fieldId, type, status, unit } = req.body;
    
    const newId = id || `dev_${Date.now()}`;

    await runAsync(
      `INSERT INTO devices (id, name, fieldId, type, status, unit)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [newId, name, fieldId, type, status || 'online', unit]
    );

    const device = await getAsync('SELECT * FROM devices WHERE id = ?', [newId]);
    res.status(201).json(normalizeDevice(device));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create device' });
  }
});

// Update device  
// Update device  
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, status, lastValue, fieldId } = req.body;
    const deviceId = req.params.id;

    const currentDevice = await getAsync('SELECT * FROM devices WHERE id = ?', [deviceId]);
    if (!currentDevice) return res.status(404).json({ error: 'Device not found' });

    const newName = name !== undefined ? name : currentDevice.name;
    const newStatus = status !== undefined ? status : currentDevice.status;
    const newLastValue = lastValue !== undefined ? lastValue : currentDevice.lastValue;
    const newFieldId = fieldId !== undefined ? fieldId : currentDevice.fieldId;

    await runAsync(
      `UPDATE devices SET name = ?, status = ?, lastValue = ?, fieldId = ?, lastUpdate = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [newName, newStatus, newLastValue, newFieldId, deviceId]
    );

    if (lastValue !== undefined && lastValue !== null) {
      console.log(`[UI Control] Nhận lệnh từ giao diện, cập nhật ${deviceId} thành: ${lastValue}`);
      // Đồng bộ trực tiếp dữ liệu sang Adafruit IO MQTT Broker
      publishDeviceControl(deviceId, Number(lastValue));
    }

    const device = await getAsync('SELECT * FROM devices WHERE id = ?', [deviceId]);
    res.json(normalizeDevice(device));
  } catch (error) {
    console.error("Lỗi update device:", error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

// Delete device
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await runAsync('DELETE FROM sensor_history WHERE deviceId = ?', [req.params.id]);
    await runAsync('DELETE FROM devices WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

export default router;
