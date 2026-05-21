// File: routes/thresholds.ts
import { Router, Request, Response } from 'express';
import { getAsync, allAsync, runAsync } from '../db/connection.js';

const router = Router();

// Get all threshold rules
router.get('/', async (req: Request, res: Response) => {
  try {
    const rules = await allAsync('SELECT * FROM threshold_rules ORDER BY createdAt DESC');
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch threshold rules' });
  }
});

// Update a threshold rule
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { isActive, minValue, maxValue, parameter, action } = req.body;
    
    const currentRule = await getAsync('SELECT * FROM threshold_rules WHERE id = ?', [req.params.id]);
    if (!currentRule) return res.status(404).json({ error: 'Threshold rule not found' });
    
    const newIsActive = isActive !== undefined ? (isActive ? 1 : 0) : currentRule.isActive;
    const newMinValue = minValue !== undefined ? minValue : currentRule.minValue;
    const newMaxValue = maxValue !== undefined ? maxValue : currentRule.maxValue;
    const newParameter = parameter !== undefined ? parameter : currentRule.parameter;
    const newAction = action !== undefined ? action : currentRule.action;

    await runAsync(
      `UPDATE threshold_rules SET isActive = ?, minValue = ?, maxValue = ?, parameter = ?, action = ? WHERE id = ?`,
      [newIsActive, newMinValue, newMaxValue, newParameter, newAction, req.params.id]
    );
    const rule = await getAsync('SELECT * FROM threshold_rules WHERE id = ?', [req.params.id]);
    res.json(rule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update threshold rule' });
  }
});

// Create a new threshold rule
router.post('/', async (req: Request, res: Response) => {
    try {
      const { deviceId, parameter, minValue, maxValue, action } = req.body;
      const newId = `tr_${Date.now()}`;
      
      await runAsync(
        `INSERT INTO threshold_rules (id, deviceId, parameter, minValue, maxValue, action, isActive)
        VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [newId, deviceId, parameter, minValue, maxValue, action]
      );
  
      const rule = await getAsync('SELECT * FROM threshold_rules WHERE id = ?', [newId]);
      res.status(201).json(rule);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create threshold rule' });
    }
  });
  
  // Delete a threshold rule
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      await runAsync('DELETE FROM threshold_rules WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete threshold rule' });
    }
  });
export default router;