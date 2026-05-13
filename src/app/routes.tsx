import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { FieldsPage } from './pages/FieldsPage';
import { DevicesPage } from './pages/DevicesPage';
import { AlertsPage } from './pages/AlertsPage';
import { SchedulesPage } from './pages/SchedulesPage';
import { SettingsPage } from './pages/SettingsPage';
import { ThresholdSettingsPage } from './pages/ThresholdSettingsPage';
import { ActionLogsPage } from './pages/ActionLogsPage';
import { UserManagementPage } from './pages/UserManagementPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Role-based route protection
function RoleProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles: string[] 
}) {
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return <Navigate to="/login" replace />;
  
  const userData = JSON.parse(userStr);
  const userRole = userData.role?.toUpperCase() || 'FARMER';
  const upperAllowedRoles = allowedRoles.map(r => r.toUpperCase());

  if (!upperAllowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'analysis', element: <RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><AnalysisPage /></RoleProtectedRoute> },
      { path: 'fields', element: <RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'WORKER', 'FARMER']}><FieldsPage /></RoleProtectedRoute> },
      { path: 'devices', element: <RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'WORKER', 'FARMER']}><DevicesPage /></RoleProtectedRoute> },
      { path: 'alerts', element: <RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'WORKER', 'FARMER']}><AlertsPage /></RoleProtectedRoute> },
      { path: 'alert-thresholds', element: <RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'WORKER']}><ThresholdSettingsPage /></RoleProtectedRoute> },
      { path: 'schedules', element: <RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'WORKER']}><SchedulesPage /></RoleProtectedRoute> },
      { path: 'action-logs', element: <RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><ActionLogsPage /></RoleProtectedRoute> },
      { path: 'users', element: <RoleProtectedRoute allowedRoles={['ADMIN']}><UserManagementPage /></RoleProtectedRoute> },
      { path: 'settings', element: <RoleProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><SettingsPage /></RoleProtectedRoute> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);