import { Router, Request, Response } from 'express';
import { getAsync, allAsync, runAsync } from '../db/connection.js';

const router = Router();

// Get all action logs
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const logs = await allAsync(
      `SELECT TOP (${limit}) al.*, u.username, u.fullName 
      FROM action_logs al
      LEFT JOIN users u ON al.userId = u.id
      ORDER BY al.timestamp DESC`,
      []
    );
    res.json(logs);
  } catch (error) {
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
      ORDER BY timestamp DESC`,
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
    const { id, userId, action, target, targetId, details } = req.body;
    await runAsync(
      `INSERT INTO action_logs (id, userId, action, target, targetId, details)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [id, userId, action, target, targetId, JSON.stringify(details || {})]
    );

    const log = await getAsync('SELECT * FROM action_logs WHERE id = ?', [id]);
    res.status(201).json(log);
  } catch (error) {
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
