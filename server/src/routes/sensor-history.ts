import { Router, Request, Response } from 'express';
import { getAsync, allAsync, runAsync } from '../db/connection.js';
import { broadcastSensorReading } from '../ws-manager.js';

const router = Router();

// Get sensor history for a device
router.get('/:deviceId', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const history = await allAsync(
      `SELECT TOP (${limit}) * FROM sensor_history
      WHERE deviceId = ?
      ORDER BY timestamp DESC`,
      [req.params.deviceId]
    );
    
    res.json(history.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sensor history' });
  }
});

// Get sensor history for multiple devices
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { deviceIds, limit = 100 } = req.body;
    const result: Record<string, any[]> = {};
    
    for (const deviceId of deviceIds) {
      const history = await allAsync(
        `SELECT TOP (${Math.min(limit, 1000)}) * FROM sensor_history
        WHERE deviceId = ?
        ORDER BY timestamp DESC`,
        [deviceId]
      );
      
      result[deviceId] = history.reverse();
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sensor history' });
  }
});

// Add sensor reading
router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, deviceId, value } = req.body;
    const timestamp = new Date().toISOString();
    
    await runAsync(
      `INSERT INTO sensor_history (id, deviceId, value, timestamp)
      VALUES (?, ?, ?, ?)`,
      [id || `reading_${Date.now()}`, deviceId, value, timestamp]
    );

    // Update device lastValue
    await runAsync(
      'UPDATE devices SET lastValue = ?, lastUpdate = CURRENT_TIMESTAMP WHERE id = ?',
      [value, deviceId]
    );

    const reading = await getAsync('SELECT TOP (1) * FROM sensor_history WHERE deviceId = ? ORDER BY timestamp DESC', [deviceId]);
    
    // Broadcast to WebSocket clients
    if (reading) {
      broadcastSensorReading(deviceId, reading);
    }
    
    res.status(201).json(reading);
  } catch (error) {
    console.error('Failed to add sensor reading:', error);
    res.status(500).json({ error: 'Failed to add sensor reading' });
  }
});

export default router;
