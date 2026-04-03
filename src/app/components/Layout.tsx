import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Map, Cpu, Bell, CalendarClock, Settings, LogOut, Menu, X, Leaf, User, ChevronDown, Activity, Users, BarChart3
} from 'lucide-react';
import { useState } from 'react';

const allNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager', 'worker', 'farmer'] },
  { to: '/analysis', icon: BarChart3, label: 'Phan tich', roles: ['admin', 'manager'] },
  { to: '/fields', icon: Map, label: 'Canh dong', roles: ['admin', 'manager', 'farmer'] },
  { to: '/devices', icon: Cpu, label: 'Thiet bi', roles: ['admin', 'manager', 'worker', 'farmer'] },
  { to: '/alerts', icon: Bell, label: 'Canh bao', roles: ['admin', 'manager', 'worker', 'farmer'] },
  { to: '/schedules', icon: CalendarClock, label: 'Lich hen', roles: ['admin', 'manager', 'worker'] },
  { to: '/action-logs', icon: Activity, label: 'Nhat ky', roles: ['admin', 'manager'] },
  { to: '/users', icon: Users, label: 'Nguoi dung', roles: ['admin'] },
  { to: '/settings', icon: Settings, label: 'Cai dat', roles: ['admin', 'manager'] },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter nav items based on user role
  const navItems = allNavItems.filter(item => 
    item.roles.includes(user?.role || 'farmer')
  );

  return (
    <div className="flex h-screen bg-[#f5f7f5]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-gradient-to-b from-[#0f2b0f] to-[#1a3a1a] text-white flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="w-11 h-11 bg-gradient-to-br from-[#4ade80] to-[#22c55e] rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20" style={{ animation: 'float 4s ease-in-out infinite' }}>
            <Leaf className="w-6 h-6 text-[#0f2b0f]" />
          </div>
          <div>
            <h2 className="text-[#4ade80] tracking-tight">Smart Farm</h2>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">IoT Dashboard</p>
          </div>
        </div>

        <div className="h-px bg-white/10 mx-4" />

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4">
          <div className="h-px bg-white/10 mb-4" />
          <button onClick={handleLogout} className="sidebar-nav-item w-full hover:!bg-red-500/10 hover:!text-red-400">
            <LogOut className="w-[18px] h-[18px]" />
            <span>Dang xuat</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Glassmorphism Header */}
        <header className="glass-header px-4 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
          <button className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
          </button>

          <div className="hidden lg:block">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Chao mung tro lai</p>
            <p className="text-gray-800">{user?.fullName}</p>
          </div>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="user-pill"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-[#4ade80] to-[#22c55e] rounded-full flex items-center justify-center shadow-sm">
                <User className="w-4 h-4 text-[#0f2b0f]" />
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm text-gray-800">{user?.fullName}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{user?.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 z-20 dropdown-menu">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-800">{user?.fullName}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <button onClick={handleLogout} className="dropdown-item danger w-full">
                      <LogOut className="w-4 h-4" /> Dang xuat
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
