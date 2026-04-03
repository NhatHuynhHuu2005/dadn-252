/**
 * Type definitions for Smart Farm Dashboard
 * 
 * All data is fetched from the backend API (MSSQL database)
 * These interfaces define the shape of data returned by the API
 */

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'manager' | 'worker' | 'farmer';
  avatar?: string;
  createdAt: string;
}

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
}

export interface Device {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'soil_moisture' | 'light' | 'ph' | 'pump' | 'valve' | 'fan';
  status: 'online' | 'offline' | 'error';
  fieldId: string;
  lastValue?: number;
  unit?: string;
  createdAt: string;
}

export interface SensorLog {
  id: string;
  deviceId: string;
  value: number;
  unit: string;
  timestamp: string;
}

export interface Alert {
  id: string;
  deviceId: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Schedule {
  id: string;
  name: string;
  deviceId: string;
  action: 'on' | 'off';
  cronExpression: string;
  isActive: boolean;
  createdAt: string;
}

export interface ThresholdRule {
  id: string;
  deviceId: string;
  parameter: string;
  minValue: number;
  maxValue: number;
  action: string;
  isActive: boolean;
}

export interface ActionLog {
  id: string;
  userId: string;
  action: string;
  target: string;
  details: string;
  category: 'user' | 'device';
  createdAt: string;
}