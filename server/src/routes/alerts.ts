import { Router, Request, Response } from 'express';
import { getAsync, allAsync, runAsync } from '../db/connection.js';

const router = Router();

// Get all alerts
router.get('/', async (req: Request, res: Response) => {
  try {
    const alerts = await allAsync('SELECT * FROM alerts ORDER BY createdAt DESC');
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get unread alerts count
router.get('/unread/count', async (req: Request, res: Response) => {
  try {
    const result = await getAsync('SELECT COUNT(*) as count FROM alerts WHERE isRead = 0');
    res.json({ count: result.count || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Get alerts by device
router.get('/device/:deviceId', async (req: Request, res: Response) => {
  try {
    const alerts = await allAsync('SELECT * FROM alerts WHERE deviceId = ? ORDER BY createdAt DESC', [req.params.deviceId]);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Create alert
router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, deviceId, message, type } = req.body;
    await runAsync(
      `INSERT INTO alerts (id, deviceId, message, type, isRead)
      VALUES (?, ?, ?, ?, 0)`,
      [id, deviceId, message, type || 'warning']
    );

    const alert = await getAsync('SELECT * FROM alerts WHERE id = ?', [id]);
    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Mark alert as read
router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    await runAsync('UPDATE alerts SET isRead = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
    const alert = await getAsync('SELECT * FROM alerts WHERE id = ?', [req.params.id]);
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// Mark all alerts as read
router.put('/read/all', async (req: Request, res: Response) => {
  try {
    await runAsync('UPDATE alerts SET isRead = 1, updatedAt = CURRENT_TIMESTAMP WHERE isRead = 0');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update alerts' });
  }
});

// Delete alert
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await runAsync('DELETE FROM alerts WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

export default router;
