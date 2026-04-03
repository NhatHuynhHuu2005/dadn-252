/**
 * API Client for Smart Farm Dashboard
 * Handles all communication with backend server
 */

const API_BASE = 'http://localhost:5000/api';

// Token management
export const getToken = (): string | null => {
  const user = localStorage.getItem('currentUser');
  if (!user) return null;
  try {
    return JSON.parse(user).token || null;
  } catch {
    return null;
  }
};

const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Error handler
class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'API Error', data);
  }

  return data;
}

// ==================== USERS ====================
export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'worker' | 'farmer';
  avatar?: string;
  createdAt: string;
  token?: string;
}

export const userApi = {
  async login(credentials: LoginRequest): Promise<User> {
    const user = await fetchApi<Partial<User>>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (!user.token) {
      user.token = `local-token-${Date.now()}`;
    }

    return user as User;
  },

  async getAll(): Promise<User[]> {
    return fetchApi<User[]>('/users');
  },

  async getById(id: string): Promise<User> {
    return fetchApi<User>(`/users/${id}`);
  },

  async create(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return fetchApi<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    return fetchApi<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    await fetchApi<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== FIELDS ====================
export interface Field {
  id: string;
  name: string;
  location: string;
  area: number;
  cropType: string;
  status: 'active' | 'inactive' | 'harvesting';
  userId: string;
  createdAt: string;
  image?: string;
  devices?: Device[];
}

function normalizeField(field: any): Field {
  return {
    ...field,
    status: (field.status || '').toString().toLowerCase(),
    area: Number(field.area),
    createdAt: field.createdAt || new Date().toISOString(),
  };
}

function normalizeDevice(device: any): Device {
  return {
    ...device,
    type: (device.type || '').toString().toLowerCase() as Device['type'],
    status: (device.status || '').toString().toLowerCase() as Device['status'],
    lastValue: device.lastValue !== undefined ? Number(device.lastValue) : undefined,
    createdAt: device.createdAt || new Date().toISOString(),
    lastUpdate: device.lastUpdate || undefined,
  };
}

export const fieldApi = {
  async getAll(): Promise<Field[]> {
    const fields = await fetchApi<Field[]>('/fields');
    return fields.map(normalizeField);
  },

  async getById(id: string): Promise<Field> {
    const field = await fetchApi<Field>(`/fields/${id}`);
    return normalizeField(field);
  },

  async create(data: Omit<Field, 'id' | 'createdAt'>): Promise<Field> {
    return fetchApi<Field>('/fields', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Field>): Promise<Field> {
    return fetchApi<Field>(`/fields/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    await fetchApi<void>(`/fields/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== DEVICES ====================
export interface Device {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'soil_moisture' | 'light' | 'ph' | 'pump' | 'valve' | 'fan';
  status: 'online' | 'offline' | 'error';
  fieldId: string;
  lastValue?: number;
  unit?: string;
  createdAt: string;
  lastUpdate?: string;
}

export const deviceApi = {
  async getAll(): Promise<Device[]> {
    const devices = await fetchApi<Device[]>('/devices');
    return devices.map(normalizeDevice);
  },

  async getById(id: string): Promise<Device> {
    const device = await fetchApi<Device>(`/devices/${id}`);
    return normalizeDevice(device);
  },

  async getByField(fieldId: string): Promise<Device[]> {
    const devices = await fetchApi<Device[]>(`/devices?fieldId=${fieldId}`);
    return devices.map(normalizeDevice);
  },

  async create(data: Omit<Device, 'id' | 'createdAt'>): Promise<Device> {
    const device = await fetchApi<Device>('/devices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return normalizeDevice(device);
  },

  async update(id: string, data: Partial<Device>): Promise<Device> {
    const device = await fetchApi<Device>(`/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return normalizeDevice(device);
  },

  async delete(id: string): Promise<void> {
    await fetchApi<void>(`/devices/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== SENSOR HISTORY ====================
export interface SensorLog {
  id: string;
  deviceId: string;
  value: number;
  unit: string;
  timestamp: string;
}

export const sensorApi = {
  async getHistory(deviceId: string, limit: number = 100): Promise<SensorLog[]> {
    return fetchApi<SensorLog[]>(`/sensor-history/${deviceId}?limit=${limit}`);
  },

  async getBatchHistory(
    deviceIds: string[],
    limit: number = 100
  ): Promise<Record<string, SensorLog[]>> {
    return fetchApi<Record<string, SensorLog[]>>('/sensor-history/batch', {
      method: 'POST',
      body: JSON.stringify({ deviceIds, limit }),
    });
  },

  async addReading(deviceId: string, value: number): Promise<SensorLog> {
    return fetchApi<SensorLog>('/sensor-history', {
      method: 'POST',
      body: JSON.stringify({ deviceId, value }),
    });
  },
};

// ==================== ALERTS ====================
export interface Alert {
  id: string;
  deviceId: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const alertApi = {
  async getAll(): Promise<Alert[]> {
    return fetchApi<Alert[]>('/alerts');
  },

  async getUnread(): Promise<Alert[]> {
    return fetchApi<Alert[]>('/alerts/unread');
  },

  async getByDevice(deviceId: string): Promise<Alert[]> {
    return fetchApi<Alert[]>(`/alerts/device/${deviceId}`);
  },

  async create(data: Omit<Alert, 'id' | 'createdAt'>): Promise<Alert> {
    return fetchApi<Alert>('/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async markAsRead(id: string): Promise<Alert> {
    return fetchApi<Alert>(`/alerts/${id}/read`, {
      method: 'PUT',
    });
  },
};

// ==================== SCHEDULES ====================
export interface Schedule {
  id: string;
  name: string;
  deviceId?: string;
  fieldId?: string;
  action: 'on' | 'off' | string;
  cronExpression: string;
  isActive: boolean;
  createdAt: string;
}

export const scheduleApi = {
  async getAll(): Promise<Schedule[]> {
    return fetchApi<Schedule[]>('/schedules');
  },

  async getById(id: string): Promise<Schedule> {
    return fetchApi<Schedule>(`/schedules/${id}`);
  },

  async getByField(fieldId: string): Promise<Schedule[]> {
    return fetchApi<Schedule[]>(`/schedules?fieldId=${fieldId}`);
  },

  async create(data: Omit<Schedule, 'id' | 'createdAt'>): Promise<Schedule> {
    return fetchApi<Schedule>('/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Schedule>): Promise<Schedule> {
    return fetchApi<Schedule>(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    await fetchApi<void>(`/schedules/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== ACTION LOGS ====================
export interface ActionLog {
  id: string;
  userId: string;
  action: string;
  target: string;
  details: string;
  category: 'user' | 'device';
  createdAt: string;
  user?: User;
}

export const actionLogApi = {
  async getAll(limit: number = 100): Promise<ActionLog[]> {
    return fetchApi<ActionLog[]>(`/action-logs?limit=${limit}`);
  },

  async getByUser(userId: string): Promise<ActionLog[]> {
    return fetchApi<ActionLog[]>(`/action-logs/user/${userId}`);
  },

  async create(data: Omit<ActionLog, 'id' | 'createdAt'>): Promise<ActionLog> {
    return fetchApi<ActionLog>('/action-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ==================== WEBSOCKET FOR REAL-TIME DATA ====================
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  constructor(private deviceId?: string) {}

  connect(onConnect?: () => void, onError?: (error: Event) => void): void {
    const wsUrl = `ws://localhost:5000/ws${this.deviceId ? `?deviceId=${this.deviceId}` : ''}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      console.log('✅ WebSocket connected');
      onConnect?.();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Dispatch to specific event listeners
        if (data.type) {
          this.emit(data.type, data);
        }

        // Always emit 'message' event
        this.emit('message', data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError?.(error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect(onConnect, onError);
    };
  }

  private attemptReconnect(
    onConnect?: () => void,
    onError?: (error: Event) => void
  ): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      setTimeout(() => this.connect(onConnect, onError), this.reconnectDelay);
    } else {
      console.error('WebSocket reconnection failed after max attempts');
    }
  }

  send(type: string, data: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  on(eventType: string, callback: (data: unknown) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)?.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  private emit(eventType: string, data: unknown): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// ==================== REACT HOOKS ====================
import { useEffect, useState, useRef } from 'react';

/**
 * Hook for real-time WebSocket data
 * Subscribes to sensor readings and sensors for a specific device
 */
export function useWebSocketData(deviceId?: string) {
  const [data, setData] = useState<Record<string, any>>({});
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    if (!deviceId) return;

    wsRef.current = new WebSocketClient(deviceId);

    wsRef.current.connect(
      () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
      },
      (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      }
    );

    wsRef.current.on('sensor_reading', (message: any) => {
      if (message.deviceId === deviceId) {
        setData((prev) => ({
          ...prev,
          lastReading: message.data,
          lastUpdate: message.timestamp,
        }));
      }
    });

    return () => {
      wsRef.current?.disconnect();
    };
  }, [deviceId]);

  return { data, isConnected };
}

/**
 * Hook for listening to all sensor readings (no device filter)
 */
export function useWebSocketBroadcast() {
  const [readings, setReadings] = useState<Array<{ deviceId: string; value: number; timestamp: string }>>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    wsRef.current = new WebSocketClient();

    wsRef.current.connect(
      () => {
        console.log('✅ WebSocket broadcast connected');
        setIsConnected(true);
      },
      (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      }
    );

    wsRef.current.on('sensor_reading', (message: any) => {
      if (message.data) {
        setReadings((prev) => {
          const updated = [
            ...prev,
            {
              deviceId: message.data.deviceId,
              value: message.data.value,
              timestamp: message.timestamp,
            },
          ];
          // Keep only last 100 readings
          return updated.slice(-100);
        });
      }
    });

    return () => {
      wsRef.current?.disconnect();
    };
  }, []);

  return { readings, isConnected };
}

export default {
  userApi,
  fieldApi,
  deviceApi,
  sensorApi,
  alertApi,
  scheduleApi,
  actionLogApi,
  WebSocketClient,
};
