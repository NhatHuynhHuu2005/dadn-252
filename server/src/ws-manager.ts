import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const clients = new Set<WebSocket>();
const deviceSubscriptions = new Map<string, Set<WebSocket>>();

let wss: WebSocketServer | null = null;

export function setupWebSocketServer(server: HttpServer): WebSocketServer {
  if (wss) {
    return wss;
  }

  wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('🔌 WebSocket client connected');

    const url = new URL(req.url || '', 'http://localhost');
    const deviceId = url.searchParams.get('deviceId');

    clients.add(ws);

    if (deviceId) {
      if (!deviceSubscriptions.has(deviceId)) {
        deviceSubscriptions.set(deviceId, new Set());
      }
      deviceSubscriptions.get(deviceId)?.add(ws);
      console.log(`Client subscribed to device ${deviceId}`);
    }

    ws.on('close', () => {
      clients.delete(ws);
      deviceSubscriptions.forEach((set) => set.delete(ws));
      console.log('🔌 WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error', error);
    });

    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to Smart Farm WebSocket',
      timestamp: new Date().toISOString(),
    }));
  });

  return wss;
}

export function broadcastSensorReading(deviceId: string, data: unknown): void {
  const packet = JSON.stringify({
    type: 'sensor_reading',
    deviceId,
    data,
    timestamp: new Date().toISOString(),
  });

  const subs = deviceSubscriptions.get(deviceId);
  if (subs) {
    subs.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(packet);
      }
    });
  }

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(packet);
    }
  });
}
