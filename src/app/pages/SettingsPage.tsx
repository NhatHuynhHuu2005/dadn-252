import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { deviceApi, userApi, type Device } from '../api/client';
import { User, Shield, Bell, Save } from 'lucide-react';
import { toast } from 'sonner';
import { getRoleLabel } from '../hooks/useRole';

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // States cho Profile & Security
  const [profile, setProfile] = useState({ fullName: user?.fullName || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  
  const [devices, setDevices] = useState<Device[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [deviceData] = await Promise.all([
          deviceApi.getAll().catch(() => [])
        ]);
        setDevices(deviceData);
      } catch (err) {
        console.error('SettingsPage load error', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const tabs = [
    { id: 'profile', label: 'Hồ sơ', icon: User },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'security', label: 'Bảo mật', icon: Shield },
  ];

  // API Call: Lưu hồ sơ
  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      await userApi.update(user.id, { 
        username: user.username, fullName: profile.fullName, email: profile.email, role: user.role
      });
      toast.success('Đã lưu thông tin hồ sơ thành công!');
      const updatedUser = { ...user, fullName: profile.fullName, email: profile.email };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      toast.error('Lỗi khi lưu hồ sơ');
    }
  };

  // API Call: Đổi mật khẩu
  const handleSecuritySave = async () => {
    if (!user) return;
    if (passwords.new !== passwords.confirm) {
      toast.error('Mật khẩu xác nhận không khớp'); return;
    }
    if (!passwords.new) {
      toast.error('Vui lòng nhập mật khẩu mới'); return;
    }
    try {
      await userApi.update(user.id, { 
        username: user.username, fullName: user.fullName, email: user.email, role: user.role, password: passwords.new 
      });
      toast.success('Đã đổi mật khẩu thành công!');
      setPasswords({ old: '', new: '', confirm: '' });
    } catch (err) {
      toast.error('Lỗi khi đổi mật khẩu');
    }
  };



  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải cấu hình...</div>;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1>Cài đặt</h1>
        <p>Quản lý tài khoản và cấu hình hệ thống</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 flex lg:flex-col gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`sidebar-nav-item whitespace-nowrap ${activeTab === t.id ? '!bg-green-50 !text-green-700' : '!text-gray-600 hover:!bg-gray-50'}`}
              style={{ color: activeTab === t.id ? '#15803d' : '#555' }}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 farm-card-static p-6 min-h-[400px]">
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-lg">
              <h2 className="text-gray-800">Thông tin cá nhân</h2>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Họ tên</label>
                <input value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} className="form-input" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Email</label>
                <input value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className="form-input" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Vai trò</label>
                <input value={getRoleLabel(user?.role)} disabled className="form-input !bg-gray-100 !text-gray-500" />
              </div>
              <button onClick={handleSaveProfile} className="btn-primary">
                <Save className="w-4 h-4" /> Lưu thay đổi
              </button>
            </div>
          )}



          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-lg">
              <h2 className="text-gray-800">Cấu hình thông báo</h2>
              {['Email cảnh báo nghiêm trọng', 'Push notification', 'SMS khi mất kết nối', 'Báo cáo hằng ngày'].map(item => (
                <div key={item} className="flex items-center justify-between p-4 bg-[#f8faf8] rounded-xl border border-green-50">
                  <span className="text-sm text-gray-700">{item}</span>
                  <button className="w-10 h-6 rounded-full bg-green-500 flex items-center px-0.5">
                    <div className="w-5 h-5 bg-white rounded-full shadow translate-x-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 max-w-lg">
              <h2 className="text-gray-800">Bảo mật</h2>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Mật khẩu hiện tại (Bo trong neu khong can)</label>
                <input type="password" value={passwords.old} onChange={e => setPasswords(p => ({ ...p, old: e.target.value }))} className="form-input" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Mật khẩu mới</label>
                <input type="password" value={passwords.new} onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))} className="form-input" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Xác nhận mật khẩu mới</label>
                <input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} className="form-input" />
              </div>
              <button onClick={handleSecuritySave} className="btn-primary">
                <Shield className="w-4 h-4" /> Đổi mật khẩu
              </button>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
