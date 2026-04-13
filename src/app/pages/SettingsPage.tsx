import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { deviceApi, userApi, thresholdApi, type Device, type ThresholdRule } from '../api/client';
import { User, Shield, Bell, Sliders, Save, Plus, Trash2, X } from 'lucide-react';
import { CustomSelect } from '../components/CustomSelect';
import { toast } from 'sonner';

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // States cho Profile & Security
  const [profile, setProfile] = useState({ fullName: user?.fullName || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  
  // States cho Thresholds & Devices
  const [rules, setRules] = useState<ThresholdRule[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  
  // States Modal Thêm Ngưỡng
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleForm, setRuleForm] = useState({ deviceId: '', parameter: 'temperature', minValue: 0, maxValue: 100, action: '' });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [deviceData, rulesData] = await Promise.all([
          deviceApi.getAll().catch(() => []),
          thresholdApi.getAll().catch(() => [])
        ]);
        setDevices(deviceData);
        setRules(rulesData);
        if (deviceData.length > 0) {
          setRuleForm(prev => ({ ...prev, deviceId: deviceData[0].id }));
        }
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
    { id: 'thresholds', label: 'Ngưỡng cảnh báo', icon: Sliders },
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

  // Threshold: Tạo mới
  const handleAddRule = async () => {
    try {
      const newRule = await thresholdApi.create(ruleForm as any);
      setRules(prev => [newRule, ...prev]);
      setShowRuleModal(false);
      toast.success('Đã thêm quy tắc ngưỡng mới!');
    } catch (error) {
      toast.error('Lỗi khi thêm quy tắc');
    }
  };

  // Threshold: Bật / Tắt
  const toggleRule = async (id: string) => {
    const rule = rules.find(r => r.id === id);
    if (!rule) return;
    try {
      const newStatus = !rule.isActive;
      await thresholdApi.update(id, { isActive: newStatus });
      setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: newStatus } : r));
      toast.success(newStatus ? 'Đã bật quy tắc' : 'Đã tắt quy tắc');
    } catch (err) {
      toast.error('Lỗi khi thay đổi trạng thái');
    }
  };

  // Threshold: Xóa
  const handleDeleteRule = async (id: string) => {
    try {
      await thresholdApi.delete(id);
      setRules(prev => prev.filter(r => r.id !== id));
      toast.success('Đã xóa quy tắc');
    } catch (error) {
      toast.error('Lỗi khi xóa');
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
                <input value={user?.role === 'ADMIN' ? 'Quan tri vien' : user?.role || 'Nong dan'} disabled className="form-input !bg-gray-100 !text-gray-500" />
              </div>
              <button onClick={handleSaveProfile} className="btn-primary">
                <Save className="w-4 h-4" /> Lưu thay đổi
              </button>
            </div>
          )}

          {activeTab === 'thresholds' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-gray-800">Ngưỡng cảnh báo</h2>
                  <p className="text-sm text-gray-500">Cấu hình các ngưỡng cảm biến để hệ thống tự động tạo cảnh báo.</p>
                </div>
                <button onClick={() => setShowRuleModal(true)} className="btn-primary">
                  <Plus className="w-4 h-4" /> Thêm quy tắc
                </button>
              </div>
              
              {rules.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center text-sm text-gray-500">
                  Chưa có quy tắc ngưỡng nào được thiết lập trong CSDL.
                </div>
              ) : (
                rules.map(r => {
                  const device = devices.find(d => d.id === r.deviceId);
                  return (
                    <div key={r.id} className="flex items-center gap-4 p-4 bg-[#f8faf8] rounded-xl border border-green-50">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{device?.name || 'Thiết bị không xác định'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Chỉ số: <span className="font-semibold uppercase">{r.parameter}</span> | 
                          Ngưỡng an toàn: <span className="font-semibold text-green-600">{r.minValue} - {r.maxValue}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">Hành động khi vượt ngưỡng: {r.action}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleRule(r.id)} 
                          className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${r.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${r.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                        <button onClick={() => handleDeleteRule(r.id)} className="action-btn delete w-8 h-8" title="Xóa quy tắc">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
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

      {/* Modal Thêm Ngưỡng */}
      {showRuleModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h2>Thêm ngưỡng cảnh báo</h2>
              <button onClick={() => setShowRuleModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Thiết bị</label>
                <CustomSelect
                  value={ruleForm.deviceId}
                  onChange={v => setRuleForm(p => ({ ...p, deviceId: v }))}
                  options={devices.map(d => ({ value: d.id, label: d.name }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Tên thông số (VD: temperature, humidity)</label>
                <input value={ruleForm.parameter} onChange={e => setRuleForm(p => ({ ...p, parameter: e.target.value }))} className="form-input" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Min (Tối thiểu)</label>
                  <input type="number" value={ruleForm.minValue} onChange={e => setRuleForm(p => ({ ...p, minValue: Number(e.target.value) }))} className="form-input" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Max (Tối đa)</label>
                  <input type="number" value={ruleForm.maxValue} onChange={e => setRuleForm(p => ({ ...p, maxValue: Number(e.target.value) }))} className="form-input" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Hành động tự động (VD: Bật quạt)</label>
                <input value={ruleForm.action} onChange={e => setRuleForm(p => ({ ...p, action: e.target.value }))} className="form-input" />
              </div>
            </div>
            <div className="flex gap-3 mt-7">
              <button onClick={() => setShowRuleModal(false)} className="btn-ghost flex-1 justify-center">Hủy</button>
              <button onClick={handleAddRule} className="btn-primary flex-1 justify-center">Lưu quy tắc</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
