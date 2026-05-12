import { useAuth } from '../context/AuthContext';

/**
 * Role hierarchy: admin > manager > farmer
 * 
 * admin:   full access to everything including user management
 * manager: full access to dashboard features (devices, fields, schedules, thresholds, reports)
 *          but CANNOT manage users
 * farmer:  can only toggle devices ON/OFF and manage schedules (create/delete)
 */
export function useRole() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() as 'admin' | 'manager' | 'farmer' | undefined;

  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isFarmer = role === 'farmer';

  return {
    role,
    isAdmin,
    isManager,
    isFarmer,

    // === PERMISSION CHECKS ===

    /** admin + manager */
    canManageFields: isAdmin || isManager,

    /** admin + manager: add/edit/delete devices */
    canManageDevices: isAdmin || isManager,

    /** admin + manager + farmer: toggle ON/OFF actuators */
    canToggleActuator: isAdmin || isManager || isFarmer,

    /** admin + manager: set thresholds */
    canManageThresholds: isAdmin || isManager,

    /** admin + manager + farmer: create/delete schedules */
    canManageSchedules: isAdmin || isManager || isFarmer,

    /** admin + manager: export reports */
    canExportReports: isAdmin || isManager,

    /** admin only: manage users */
    canManageUsers: isAdmin,

    /** admin + manager: add/delete alerts  */
    canManageAlerts: isAdmin || isManager,
  };
}

/** Utility: get display label for a role string */
export function getRoleLabel(role?: string | null): string {
  switch ((role || '').toLowerCase()) {
    case 'admin': return 'Quản trị viên';
    case 'manager': return 'Quản lý';
    case 'farmer': return 'Nông dân';
    default: return role || 'Không xác định';
  }
}

/** Utility: get badge config for a role string */
export function getRoleBadgeConfig(role?: string | null): { cls: string; label: string } {
  switch ((role || '').toLowerCase()) {
    case 'admin': return { cls: 'bg-purple-100 text-purple-700 border border-purple-200', label: 'Quản trị viên' };
    case 'manager': return { cls: 'bg-orange-100 text-orange-700 border border-orange-200', label: 'Quản lý' };
    case 'farmer': return { cls: 'bg-green-100 text-green-700 border border-green-200', label: 'Nông dân' };
    default: return { cls: 'bg-gray-100 text-gray-600', label: role || 'Không xác định' };
  }
}
