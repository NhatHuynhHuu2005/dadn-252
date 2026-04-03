# Role-Based Access Control (RBAC) Documentation

## 📋 Overview

This document maps the Use Case Diagram (UCD) to the implemented role-based access control system. There are **4 roles** in Smart Farm Dashboard:

| Role | Color | Description | Use Case |
|------|-------|-------------|----------|
| **ADMIN** | Purple | System Administrator | Manage users, permissions, system settings |
| **MANAGER** | Orange | Farm Manager | View dashboard, fields, devices, schedules, logs, analytics |
| **WORKER** | Blue | Farm Worker | Manage devices, view schedules, alerts |
| **FARMER** | Green | Farm Owner | View dashboard, fields, devices, alerts (read-only) |

---

## 🔐 Login Credentials (For Testing)

```
┌──────────────┬───────────────┬─────────────────────┐
│ Username     │ Password      │ Role                │
├──────────────┼───────────────┼─────────────────────┤
│ admin        │ admin123      │ ADMIN               │
│ manager      │ manager123    │ MANAGER             │
│ worker       │ worker123     │ WORKER              │
│ farmer       │ farmer123     │ FARMER              │
└──────────────┴───────────────┴─────────────────────┘
```

---

## 📍 UC Diagram → Implementation Mapping

### **1. ADMIN Role**
**UC Diagram Actor:** Admin (system admin)

**Accessible Pages:**
- ✅ Dashboard (View)
- ✅ Analysis/Phân tích (View reports)
- ✅ Fields/Canh dong (Create, Read, Update, Delete)
- ✅ Devices/Thiet bi (Add, Delete, View)
- ✅ Alerts/Canh bao (View, Manage)
- ✅ Schedules/Lich hen (Create, Update, Delete) - N/A for admin
- ✅ Action Logs/Nhat ky (View, Filter)
- ✅ User Management/Nguoi dung (Create, Update, Delete user accounts)
- ✅ Settings/Cai dat (Configure system)

**Use Cases Covered:**
- Manage Users and Permissions (Create, Update, Delete, View Details)
- View Dashboard
- Manage Logs

---

### **2. MANAGER Role**
**UC Diagram Actor:** Manager (field/farm manager)

**Accessible Pages:**
- ✅ Dashboard (View)
- ✅ Analysis/Phân tích (View reports, Export reports)
- ✅ Fields/Canh dong (Create, Read, Update, Delete)
- ✅ Devices/Thiet bi (Add, Delete, View device details)
- ✅ Alerts/Canh bao (View, Manage)
- ✅ Schedules/Lich hen (Create, Update, Delete automatic schedules)
- ✅ Action Logs/Nhat ky (View, Filter & Search)
- ❌ User Management/Nguoi dung (No access)
- ✅ Settings/Cai dat (Limited access)

**Use Cases Covered:**
- View Dashboard
- Export Report
- Manage Fields (Create, Update, Delete, View Detail)
- Manage Devices (Add, Delete, View Detail)
- Manage Threads/Thresholds (Create, Update, Delete, View Detail)
- Manage Automatic Schedules (Create, Update, Delete, View Detail)
- Manage Log (View Action Log, Filter/Search, View Sensor Log)

---

### **3. WORKER Role**
**UC Diagram Actor:** Worker (field worker/technician)

**Accessible Pages:**
- ✅ Dashboard (View - simplified)
- ❌ Analysis/Phân tích (No access)
- ❌ Fields/Canh dong (No access)
- ✅ Devices/Thiet bi (View, Limited control)
- ✅ Alerts/Canh bao (View alerts)
- ✅ Schedules/Lich hen (Create, Update, Delete work schedules)
- ❌ Action Logs/Nhat ky (No access)
- ❌ User Management/Nguoi dung (No access)
- ❌ Settings/Cai dat (No access)

**Use Cases Covered:**
- View Dashboard (simplified)
- Manage Devices (limited - view & control)
- Manage Thresholds (Create, Update, Delete threshold rules)
- Manage Schedules (work schedules only)

---

### **4. FARMER Role**
**UC Diagram Actor:** Farmer (farm owner/read-only user)

**Accessible Pages:**
- ✅ Dashboard (View)
- ❌ Analysis/Phân tích (No access)
- ✅ Fields/Canh dong (View only - read-only)
- ✅ Devices/Thiet bi (View only - read-only)
- ✅ Alerts/Canh bao (View alerts)
- ❌ Schedules/Lich hen (No access)
- ❌ Action Logs/Nhat ky (No access)
- ❌ User Management/Nguoi dung (No access)
- ❌ Settings/Cai dat (No access)

**Use Cases Covered:**
- View Dashboard
- View Field Details (read-only)
- View Device Details (read-only)
- View Alerts

---

## 🏗️ Technical Implementation

### **Database Schema**
```sql
CREATE TABLE users (
  id NVARCHAR(50) PRIMARY KEY,
  username NVARCHAR(50) UNIQUE NOT NULL,
  password NVARCHAR(255) NOT NULL,
  fullName NVARCHAR(100),
  email NVARCHAR(100),
  role NVARCHAR(20) DEFAULT 'FARMER',
  createdAt DATETIME DEFAULT GETDATE(),
  updatedAt DATETIME DEFAULT GETDATE(),
  CONSTRAINT chk_role CHECK (role IN ('ADMIN', 'MANAGER', 'WORKER', 'FARMER'))
);
```

### **Frontend Type Definition**
```typescript
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
```

### **Route Protection**
```typescript
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
```

### **Conditional Navigation**
```typescript
const allNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', 
    roles: ['admin', 'manager', 'worker', 'farmer'] },
  { to: '/analysis', icon: BarChart3, label: 'Phan tich', 
    roles: ['admin', 'manager'] },
  { to: '/users', icon: Users, label: 'Nguoi dung', 
    roles: ['admin'] },
  // ... more items
];

// In Layout component:
const navItems = allNavItems.filter(item => 
  item.roles.includes(user?.role || 'farmer')
);
```

---

## 📊 Permission Matrix

| Feature | ADMIN | MANAGER | WORKER | FARMER |
|---------|:-----:|:-------:|:------:|:------:|
| **Dashboard** | ✅ | ✅ | ✅ | ✅ |
| **Analysis/Report** | ✅ | ✅ | ❌ | ❌ |
| **Fields - Create** | ✅ | ✅ | ❌ | ❌ |
| **Fields - Read** | ✅ | ✅ | ❌ | ✅ RO |
| **Fields - Update** | ✅ | ✅ | ❌ | ❌ |
| **Fields - Delete** | ✅ | ✅ | ❌ | ❌ |
| **Devices - Create** | ✅ | ✅ | ❌ | ❌ |
| **Devices - Read** | ✅ | ✅ | ✅ | ✅ RO |
| **Devices - Update** | ✅ | ✅ | ✅ | ❌ |
| **Devices - Delete** | ✅ | ✅ | ❌ | ❌ |
| **Alerts** | ✅ | ✅ | ✅ | ✅ |
| **Schedules** | ❌ | ✅ | ✅ | ❌ |
| **Thresholds** | ❌ | ✅ | ✅ | ❌ |
| **Logs** | ✅ | ✅ | ❌ | ❌ |
| **Users Mgmt** | ✅ | ❌ | ❌ | ❌ |
| **Settings** | ✅ | ✅ | ❌ | ❌ |

*RO = Read-Only*

---

## 🔄 UC Diagram Alignment

### ✅ Covered Use Cases:
1. ✅ View Dashboard - All roles
2. ✅ Export Report - Admin, Manager
3. ✅ Manage Fields - Admin, Manager (Create, Update, Delete, View Detail)
4. ✅ Manage Devices - Admin, Manager, Worker (Add, Delete, View Detail)
5. ✅ Manage Thresholds - Admin (via DB), Manager, Worker
6. ✅ Manage Automatic Schedules - Manager, Worker
7. ✅ Manage Log - Admin, Manager (View, Filter/Search)
8. ✅ Manage Users and Permissions - Admin (Create, Update, Delete, View Detail)

### 🚀 Future Enhancements:
- [ ] Field-level access control (assign fields to managers/workers)
- [ ] Device-level access control
- [ ] Custom permission matrix
- [ ] Audit log for role changes
- [ ] Role expiration/validity period

---

## 🧪 Testing Checklist

### Admin User (admin/admin123)
- [ ] Can access all pages
- [ ] Can create/edit/delete users
- [ ] Can access system settings
- [ ] Can view logs

### Manager User (manager/manager123)
- [ ] Can access Dashboard, Analysis, Fields, Devices, Alerts, Schedules, Logs, Settings
- [ ] Cannot access User Management
- [ ] Cannot see Worker-only features

### Worker User (worker/worker123)
- [ ] Can access Dashboard, Devices, Alerts, Schedules
- [ ] Cannot access Analysis, Fields, Logs, Settings
- [ ] Cannot manage users

### Farmer User (farmer/farmer123)
- [ ] Can access Dashboard, Fields (read-only), Devices (read-only), Alerts
- [ ] Cannot access other pages
- [ ] All data in read-only mode

---

## 📝 Notes

- **Default Role:** When creating new users, default role is `FARMER`
- **Admin-Only:** User Management page has additional guard: `if (currentUser?.role !== 'admin') { redirect }`
- **Database Constraint:** Role value is validated at DB level with CHECK constraint
- **localStorage:** User role is stored in localStorage after login for client-side checks

