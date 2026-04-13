import { Router, Request, Response } from 'express';
import { getAsync, allAsync, runAsync } from '../db/connection.js';

const router = Router();

// Get all schedules
router.get('/', async (req: Request, res: Response) => {
  try {
    const schedules = await allAsync('SELECT * FROM schedules ORDER BY createdAt DESC');
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Get schedules by field
router.get('/field/:fieldId', async (req: Request, res: Response) => {
  try {
    const schedules = await allAsync('SELECT * FROM schedules WHERE fieldId = ? ORDER BY createdAt DESC', [req.params.fieldId]);
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Create schedule
router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, fieldId, deviceId, name, action, cronExpression, isActive } = req.body;
    
    // Tự sinh ID
    const newId = id || `sch_${Date.now()}`;

    await runAsync(
      `INSERT INTO schedules (id, fieldId, deviceId, name, action, cronExpression, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newId, fieldId, deviceId, name, action || 'on', cronExpression, isActive !== undefined ? (isActive ? 1 : 0) : 1]
    );

    const schedule = await getAsync('SELECT * FROM schedules WHERE id = ?', [newId]);
    res.status(201).json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// Update schedule
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, fieldId, deviceId, action, cronExpression, isActive } = req.body;

    await runAsync(
      `UPDATE schedules SET name = ?, fieldId = ?, deviceId = ?, action = ?, cronExpression = ?, isActive = ?
      WHERE id = ?`,
      [name, fieldId, deviceId, action, cronExpression, isActive ? 1 : 0, req.params.id]
    );

    const schedule = await getAsync('SELECT * FROM schedules WHERE id = ?', [req.params.id]);
    res.json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// Delete schedule
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await runAsync('DELETE FROM schedules WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

export default router;