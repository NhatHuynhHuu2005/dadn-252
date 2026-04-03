import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { deviceApi, type Device } from '../api/client';
import { User, Shield, Bell, Sliders, Save } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ fullName: user?.fullName || '', email: user?.email || '' });
  const [rules, setRules] = useState([{
    id: 'tr1', deviceId: 'd1', parameter: 'temperature', minValue: 18, maxValue: 35, action: 'Bat quat thong gio', isActive: true
  }, {
    id: 'tr2', deviceId: 'd3', parameter: 'soil_moisture', minValue: 20, maxValue: 80, action: 'Bat may bom', isActive: true
  }, {
    id: 'tr3', deviceId: 'd6', parameter: 'ph', minValue: 5.5, maxValue: 7.5, action: 'Canh bao', isActive: true
  }]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        setLoading(true);
        const deviceData = await deviceApi.getAll();
        setDevices(deviceData);
      } catch (err) {
        console.error('SettingsPage load error', err);
        setError(err instanceof Error ? err.message : 'Failed to load devices');
      } finally {
        setLoading(false);
      }
    };
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

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1>Cai dat</h1>
        <p>Quan ly tai khoan va cau hinh he thong</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab nav */}
        <div className="lg:w-56 flex lg:flex-col gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`sidebar-nav-item whitespace-nowrap ${activeTab === t.id ? '!bg-green-50 !text-green-700' : '!text-gray-600 hover:!bg-gray-50'}`}
              style={{ color: activeTab === t.id ? '#15803d' : '#555' }}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 farm-card-static p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-lg">
              <h2 className="text-gray-800">Thong tin ca nhan</h2>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Ho ten</label>
                <input value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} className="form-input" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Email</label>
                <input value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className="form-input" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Vai tro</label>
                <input value={user?.role === 'admin' ? 'Quan tri vien' : 'Nong dan'} disabled className="form-input !bg-gray-100 !text-gray-500" />
              </div>
              <button onClick={handleSaveProfile} className="btn-primary">
                <Save className="w-4 h-4" /> Luu thay doi
              </button>
            </div>
          )}

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
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}