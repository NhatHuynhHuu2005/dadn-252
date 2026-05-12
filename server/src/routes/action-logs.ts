import { Router, Request, Response } from 'express';
import { getAsync, allAsync, runAsync } from '../db/connection.js';

const router = Router();

<<<<<<< HEAD
// Get all action logs
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
=======
// Get all action logs with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 200, 2000);
    const { fieldId, deviceId, triggeredBy, status, from, to } = req.query;

    let where = 'WHERE 1=1';
    const params: any[] = [];

    if (fieldId && fieldId !== 'all') {
      where += ' AND al.fieldId = ?';
      params.push(fieldId);
    }
    if (deviceId && deviceId !== 'all') {
      where += ' AND al.deviceId = ?';
      params.push(deviceId);
    }
    if (triggeredBy && triggeredBy !== 'all') {
      where += ' AND al.triggeredBy = ?';
      params.push(triggeredBy);
    }
    if (status && status !== 'all') {
      where += ' AND al.status = ?';
      params.push(status);
    }
    if (from) {
      where += ' AND al.createdAt >= ?';
      params.push(from);
    }
    if (to) {
      where += ' AND al.createdAt <= ?';
      params.push(to + 'T23:59:59');
    }

>>>>>>> khanh
    const logs = await allAsync(
      `SELECT TOP (${limit}) al.*, u.username, u.fullName 
      FROM action_logs al
      LEFT JOIN users u ON al.userId = u.id
<<<<<<< HEAD
      ORDER BY al.timestamp DESC`,
      []
    );
    res.json(logs);
  } catch (error) {
=======
      ${where}
      ORDER BY al.createdAt DESC`,
      params
    );
    res.json(logs);
  } catch (error) {
    console.error('action-logs GET error:', error);
>>>>>>> khanh
    res.status(500).json({ error: 'Failed to fetch action logs' });
  }
});

// Get logs by user
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const logs = await allAsync(
      `SELECT TOP (${limit}) * FROM action_logs 
      WHERE userId = ?
<<<<<<< HEAD
      ORDER BY timestamp DESC`,
=======
      ORDER BY createdAt DESC`,
>>>>>>> khanh
      [req.params.userId]
    );
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Create action log
router.post('/', async (req: Request, res: Response) => {
  try {
<<<<<<< HEAD
    const { id, userId, action, target, targetId, details } = req.body;
    await runAsync(
      `INSERT INTO action_logs (id, userId, action, target, targetId, details)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [id, userId, action, target, targetId, JSON.stringify(details || {})]
    );

    const log = await getAsync('SELECT * FROM action_logs WHERE id = ?', [id]);
    res.status(201).json(log);
  } catch (error) {
=======
    const { id, userId, action, target, targetId, details, fieldId, deviceId, triggeredBy, status, category } = req.body;
    const newId = id || `log_${Date.now()}`;
    
    await runAsync(
      `INSERT INTO action_logs (id, userId, action, target, targetId, details, fieldId, deviceId, triggeredBy, status, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        userId,
        action,
        target,
        targetId,
        typeof details === 'object' ? JSON.stringify(details) : (details || ''),
        fieldId || null,
        deviceId || null,
        triggeredBy || 'manual',
        status || 'success',
        category || 'user',
      ]
    );

    const log = await getAsync('SELECT * FROM action_logs WHERE id = ?', [newId]);
    res.status(201).json(log);
  } catch (error) {
    console.error('action-logs POST error:', error);
>>>>>>> khanh
    res.status(500).json({ error: 'Failed to create log' });
  }
});

// Delete log
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await runAsync('DELETE FROM action_logs WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete log' });
  }
});

export default router;
