import { Router, Request, Response } from 'express';
import { getAsync, allAsync, runAsync } from '../db/connection.js';

const router = Router();

// Helper: normalize field status to lowercase
const normalizeField = (f: any) => f ? { ...f, status: f.status?.toLowerCase() ?? f.status } : f;
const normalizeFields = (arr: any[]) => arr.map(normalizeField);

// Get all fields
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    let query = 'SELECT * FROM fields';
    let params: any[] = [];

    if (userId) {
      query += ' WHERE userId = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY createdAt DESC';
    
    const fields = await allAsync(query, params);
    res.json(normalizeFields(fields));
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
    
    res.json({ ...normalizeField(field), devices });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch field' });
  }
});

// Create field
router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, name, location, area, cropType, status, image, zoneCode, userId } = req.body;
    const newId = id || `fld_${Date.now()}`;

    await runAsync(
      `INSERT INTO fields (id, name, location, area, cropType, status, image, zoneCode, userId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newId, name, location, area, cropType, status || 'active', image || null, zoneCode || null, userId || null]
    );

    const field = await getAsync('SELECT * FROM fields WHERE id = ?', [newId]);
    res.status(201).json(normalizeField(field));
  } catch (error) {
    res.status(500).json({ error: 'Failed to create field' });
  }
});

// Update field
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, location, area, cropType, status, image, zoneCode, userId } = req.body;
    await runAsync(
      `UPDATE fields SET name = ?, location = ?, area = ?, cropType = ?, status = ?, image = ?, zoneCode = ?, userId = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [name, location, area, cropType, status, image || null, zoneCode || null, userId || null, req.params.id]
    );

    const field = await getAsync('SELECT * FROM fields WHERE id = ?', [req.params.id]);
    res.json(normalizeField(field));
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
