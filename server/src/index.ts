import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initDatabase, seedDatabase } from './db/mssql-init.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import usersRouter from './routes/users.js';
import fieldsRouter from './routes/fields.js';
import devicesRouter from './routes/devices.js';
import alertsRouter from './routes/alerts.js';
import schedulesRouter from './routes/schedules.js';
import actionLogsRouter from './routes/action-logs.js';
import sensorHistoryRouter from './routes/sensor-history.js';

dotenv.config();

import { setupWebSocketServer } from './ws-manager.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for WebSocket
const server = createServer(app);

// Setup WebSocket server
setupWebSocketServer(server);

// Initialize database
console.log('Initializing database...');
(async () => {
  try {
    await initDatabase();
    await seedDatabase();
    console.log('✅ Database ready');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
})();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', usersRouter);
app.use('/api/fields', fieldsRouter);
app.use('/api/devices', devicesRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/action-logs', actionLogsRouter);
app.use('/api/sensor-history', sensorHistoryRouter);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔌 WebSocket available at ws://localhost:${PORT}/ws`);
  console.log(`🗄️ Database: MSSQL`);
});
