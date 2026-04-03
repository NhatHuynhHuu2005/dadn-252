import { Router, Request, Response } from 'express';
import { getAsync, allAsync, runAsync } from '../db/connection.js';

const router = Router();

// Get all schedules
router.get('/', async (req: Request, res: Response) => {
  try {
    const schedules = await allAsync('SELECT * FROM schedules ORDER BY nextRun ASC');
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Get schedules by field
router.get('/field/:fieldId', async (req: Request, res: Response) => {
  try {
    const schedules = await allAsync('SELECT * FROM schedules WHERE fieldId = ? ORDER BY nextRun ASC', [req.params.fieldId]);
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Get schedule by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const schedule = await getAsync('SELECT * FROM schedules WHERE id = ?', [req.params.id]);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Create schedule
router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, fieldId, name, description, type, recurrence, nextRun } = req.body;
    await runAsync(
      `INSERT INTO schedules (id, fieldId, name, description, type, recurrence, nextRun, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [id, fieldId, name, description, type, recurrence, nextRun]
    );

    const schedule = await getAsync('SELECT * FROM schedules WHERE id = ?', [id]);
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// Update schedule
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, description, type, recurrence, nextRun, isActive } = req.body;
    await runAsync(
      `UPDATE schedules SET name = ?, description = ?, type = ?, recurrence = ?, nextRun = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [name, description, type, recurrence, nextRun, isActive ? 1 : 0, req.params.id]
    );

    const schedule = await getAsync('SELECT * FROM schedules WHERE id = ?', [req.params.id]);
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// Delete schedule
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await runAsync('DELETE FROM schedules WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

export default router;
