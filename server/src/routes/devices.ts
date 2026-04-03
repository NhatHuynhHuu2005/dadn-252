import { Router, Request, Response } from 'express';
import { getAsync, allAsync, runAsync } from '../db/connection.js';

const router = Router();

// Get all devices
router.get('/', async (req: Request, res: Response) => {
  try {
    const devices = await allAsync('SELECT * FROM devices ORDER BY createdAt DESC');
    res.json(devices);
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

    res.json({ ...device, history: history.reverse() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

// Create device
router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, name, fieldId, type, status, unit } = req.body;
    await runAsync(
      `INSERT INTO devices (id, name, fieldId, type, status, unit)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, fieldId, type, status || 'online', unit]
    );

    const device = await getAsync('SELECT * FROM devices WHERE id = ?', [id]);
    res.status(201).json(device);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create device' });
  }
});

// Update device  
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, status, lastValue } = req.body;
    await runAsync(
      `UPDATE devices SET name = ?, status = ?, lastValue = ?, lastUpdate = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [name, status, lastValue, req.params.id]
    );

    const device = await getAsync('SELECT * FROM devices WHERE id = ?', [req.params.id]);
    res.json(device);
  } catch (error) {
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
