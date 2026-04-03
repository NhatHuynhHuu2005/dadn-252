import { Router, Request, Response } from 'express';
import { getAsync, allAsync, runAsync } from '../db/connection.js';

const router = Router();

// Get all users
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await allAsync('SELECT id, username, fullName, email, role, createdAt FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await getAsync('SELECT id, username, fullName, email, role FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await getAsync('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password: _pass, ...userWithoutPassword } = user;
    const token = `token_${user.id}_${Date.now()}`;

    res.json({
      ...userWithoutPassword,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Create user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, username, password, fullName, email, role } = req.body;
    await runAsync(
      `INSERT INTO users (id, username, password, fullName, email, role)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [id, username, password, fullName, email, role]
    );

    res.status(201).json({ id, username, fullName, email, role });
  } catch (error: any) {
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { fullName, email, role } = req.body;
    await runAsync(
      `UPDATE users SET fullName = ?, email = ?, role = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [fullName, email, role, req.params.id]
    );

    const user = await getAsync('SELECT id, username, fullName, email, role FROM users WHERE id = ?', [req.params.id]);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await runAsync('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
