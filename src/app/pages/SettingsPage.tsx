import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
<<<<<<< HEAD
import { deviceApi, type Device } from '../api/client';
import { User, Shield, Bell, Sliders, Save } from 'lucide-react';
import { toast } from 'sonner';
=======
import { deviceApi, userApi, type Device } from '../api/client';
import { User, Shield, Bell, Save } from 'lucide-react';
import { toast } from 'sonner';
import { getRoleLabel } from '../hooks/useRole';
>>>>>>> khanh

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
<<<<<<< HEAD
  const [profile, setProfile] = useState({ fullName: user?.fullName || '', email: user?.email || '' });
  const [rules, setRules] = useState([{
    id: 'tr1', deviceId: 'd1', parameter: 'temperature', minValue: 18, maxValue: 35, action: 'Bat quat thong gio', isActive: true
  }, {
    id: 'tr2', deviceId: 'd3', parameter: 'soil_moisture', minValue: 20, maxValue: 80, action: 'Bat may bom', isActive: true
  }, {
    id: 'tr3', deviceId: 'd6', parameter: 'ph', minValue: 5.5, maxValue: 7.5, action: 'Canh bao', isActive: true
  }]);
  const [devices, setDevices] = useState<Device[]>([]);
=======
  
  // States cho Profile & Security
  const [profile, setProfile] = useState({ fullName: user?.fullName || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  
  const [devices, setDevices] = useState<Device[]>([]);
  
>>>>>>> khanh
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
<<<<<<< HEAD
    const loadDevices = async () => {
      try {
        setLoading(true);
        const deviceData = await deviceApi.getAll();
        setDevices(deviceData);
      } catch (err) {
        console.error('SettingsPage load error', err);
        setError(err instanceof Error ? err.message : 'Failed to load devices');
=======
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
>>>>>>> khanh
      } finally {
        setLoading(false);
      }
    };
<<<<<<< HEAD
    loadDevices();
  }, []);

  const tabs = [
    { id: 'profile', label: 'Ho so', icon: User },
    { id: 'thresholds', label: 'Nguong canh bao', icon: Sliders },
    { id: 'notifications', label: 'Thong bao', icon: Bell },
    { id: 'security', label: 'Bao mat', icon: Shield },
  ];

  const handleSaveProfile = () => toast.success('Da luu thong tin ho so!');
  const toggleRule = (id: string) => setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
=======
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
>>>>>>> khanh

  return (
    <div className="space-y-6">
      <div className="page-header">
<<<<<<< HEAD
        <h1>Cai dat</h1>
        <p>Quan ly tai khoan va cau hinh he thong</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab nav */}
=======
        <h1>Cài đặt</h1>
        <p>Quản lý tài khoản và cấu hình hệ thống</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
>>>>>>> khanh
        <div className="lg:w-56 flex lg:flex-col gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`sidebar-nav-item whitespace-nowrap ${activeTab === t.id ? '!bg-green-50 !text-green-700' : '!text-gray-600 hover:!bg-gray-50'}`}
              style={{ color: activeTab === t.id ? '#15803d' : '#555' }}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

<<<<<<< HEAD
        {/* Tab content */}
        <div className="flex-1 farm-card-static p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-lg">
              <h2 className="text-gray-800">Thong tin ca nhan</h2>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Ho ten</label>
=======
        <div className="flex-1 farm-card-static p-6 min-h-[400px]">
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-lg">
              <h2 className="text-gray-800">Thông tin cá nhân</h2>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Họ tên</label>
>>>>>>> khanh
                <input value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} className="form-input" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Email</label>
                <input value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className="form-input" />
              </div>
              <div>
<<<<<<< HEAD
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Vai tro</label>
                <input value={user?.role === 'admin' ? 'Quan tri vien' : 'Nong dan'} disabled className="form-input !bg-gray-100 !text-gray-500" />
              </div>
              <button onClick={handleSaveProfile} className="btn-primary">
                <Save className="w-4 h-4" /> Luu thay doi
=======
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Vai trò</label>
                <input value={getRoleLabel(user?.role)} disabled className="form-input !bg-gray-100 !text-gray-500" />
              </div>
              <button onClick={handleSaveProfile} className="btn-primary">
                <Save className="w-4 h-4" /> Lưu thay đổi
>>>>>>> khanh
              </button>
            </div>
          )}

<<<<<<< HEAD
          {activeTab === 'thresholds' && (
            <div className="space-y-4">
              <h2 className="text-gray-800">Nguong canh bao</h2>
              <p className="text-sm text-gray-500">Cau hinh nguong de tu dong tao canh bao</p>
              {rules.map(r => {
                const device = devices.find(d => d.id === r.deviceId);
                return (
                  <div key={r.id} className="flex items-center gap-4 p-4 bg-[#f8faf8] rounded-xl border border-green-50">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{device?.name}</p>
                      <p className="text-xs text-gray-500">{r.parameter}: {r.minValue} - {r.maxValue} → {r.action}</p>
                    </div>
                    <button onClick={() => toggleRule(r.id)} className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${r.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${r.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-lg">
              <h2 className="text-gray-800">Cau hinh thong bao</h2>
              {['Email canh bao nghiem trong', 'Push notification', 'SMS khi mat ket noi', 'Bao cao hang ngay'].map(item => (
=======


          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-lg">
              <h2 className="text-gray-800">Cấu hình thông báo</h2>
              {['Email cảnh báo nghiêm trọng', 'Push notification', 'SMS khi mất kết nối', 'Báo cáo hằng ngày'].map(item => (
>>>>>>> khanh
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
<<<<<<< HEAD
              <h2 className="text-gray-800">Bao mat</h2>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Mat khau hien tai</label>
                <input type="password" className="form-input" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Mat khau moi</label>
                <input type="password" className="form-input" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Xac nhan mat khau moi</label>
                <input type="password" className="form-input" />
              </div>
              <button onClick={() => toast.success('Da doi mat khau!')} className="btn-primary">
                <Shield className="w-4 h-4" /> Doi mat khau
=======
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
>>>>>>> khanh
              </button>
            </div>
          )}
        </div>
      </div>
<<<<<<< HEAD
    </div>
  );
}
=======


    </div>
  );
}
>>>>>>> khanh
