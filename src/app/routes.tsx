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
import { ActionLogsPage } from './pages/ActionLogsPage';
import { UserManagementPage } from './pages/UserManagementPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem('smartfarm_user');
  if (!user) return <Navigate to="/login" replace />;
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
  const user = localStorage.getItem('smartfarm_user');
  if (!user) return <Navigate to="/login" replace />;
  
  const userData = JSON.parse(user);
  if (!allowedRoles.includes(userData.role)) {
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
      { path: 'analysis', element: <RoleProtectedRoute allowedRoles={['admin', 'manager']}><AnalysisPage /></RoleProtectedRoute> },
      { path: 'fields', element: <RoleProtectedRoute allowedRoles={['admin', 'manager', 'farmer']}><FieldsPage /></RoleProtectedRoute> },
      { path: 'devices', element: <DevicesPage /> },
      { path: 'alerts', element: <AlertsPage /> },
      { path: 'schedules', element: <RoleProtectedRoute allowedRoles={['admin', 'manager', 'worker']}><SchedulesPage /></RoleProtectedRoute> },
      { path: 'action-logs', element: <RoleProtectedRoute allowedRoles={['admin', 'manager']}><ActionLogsPage /></RoleProtectedRoute> },
      { path: 'users', element: <RoleProtectedRoute allowedRoles={['admin']}><UserManagementPage /></RoleProtectedRoute> },
      { path: 'settings', element: <RoleProtectedRoute allowedRoles={['admin', 'manager']}><SettingsPage /></RoleProtectedRoute> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
