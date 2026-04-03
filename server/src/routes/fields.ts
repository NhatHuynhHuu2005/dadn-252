import { Router, Request, Response } from 'express';
import { getAsync, allAsync, runAsync } from '../db/connection.js';

const router = Router();

// Get all fields
router.get('/', async (req: Request, res: Response) => {
  try {
    const fields = await allAsync('SELECT * FROM fields ORDER BY createdAt DESC');
    res.json(fields);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fields' });
  }
});

// Get field by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const field = await getAsync('SELECT * FROM fields WHERE id = ?', [req.params.id]);
    if (!field) return res.status(404).json({ error: 'Field not found' });
    
    // Get devices for this field
    const devices = await allAsync('SELECT * FROM devices WHERE fieldId = ?', [req.params.id]);
    
    res.json({ ...field, devices });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch field' });
  }
});

// Create field
router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, name, location, area, cropType, status } = req.body;
    await runAsync(
      `INSERT INTO fields (id, name, location, area, cropType, status)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, location, area, cropType, status || 'active']
    );

    const field = await getAsync('SELECT * FROM fields WHERE id = ?', [id]);
    res.status(201).json(field);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create field' });
  }
});

// Update field
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, location, area, cropType, status } = req.body;
    await runAsync(
      `UPDATE fields SET name = ?, location = ?, area = ?, cropType = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [name, location, area, cropType, status, req.params.id]
    );

    const field = await getAsync('SELECT * FROM fields WHERE id = ?', [req.params.id]);
    res.json(field);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update field' });
  }
});

// Delete field
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    // Delete related devices first
    await runAsync('DELETE FROM devices WHERE fieldId = ?', [req.params.id]);
    await runAsync('DELETE FROM fields WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete field' });
  }
});

export default router;
