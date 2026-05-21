import { useEffect, useState } from 'react';
import { deviceApi, thresholdApi, type Device, type ThresholdRule } from '../api/client';
import { CustomSelect } from '../components/CustomSelect';
import { Sliders, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export function ThresholdSettingsPage() {
  const { user } = useAuth();
  const isReadOnly = user?.role?.toUpperCase() === 'WORKER';
  const [rules, setRules] = useState<ThresholdRule[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    deviceId: '',
    parameter: 'temperature',
    minValue: 0,
    maxValue: 100,
    action: '',
  });
  const [loading, setLoading] = useState(true);
  const [customAction, setCustomAction] = useState(false);

  // Danh sách hành động được định nghĩa sẵn
  const predefinedActions = [
    'Bật thiết bị',
    'Tắt thiết bị',
    'Bật quạt',
    'Tắt quạt',
    'Bật máy bơm',
    'Tắt máy bơm',
    'Bật đèn',
    'Tắt đèn',
    'Gửi cảnh báo',
    'Gửi thông báo khẩn cấp',
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [deviceData, rulesData] = await Promise.all([
          deviceApi.getAll().catch(() => []),
          thresholdApi.getAll().catch(() => []),
        ]);
        setDevices(deviceData);
        setRules(rulesData);
        if (deviceData.length > 0) {
          setRuleForm(prev => ({ ...prev, deviceId: deviceData[0].id }));
        }
      } catch (error) {
        console.error('ThresholdSettingsPage load error', error);
        toast.error('Không thể tải dữ liệu ngưỡng cảnh báo');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddRule = async () => {
    if (isReadOnly) return;
    
    // Validate action không được để trống
    if (!ruleForm.action || ruleForm.action.trim() === '') {
      toast.error('Vui lòng chọn hoặc nhập hành động');
      return;
    }
    
    // Validate min < max
    if (ruleForm.minValue >= ruleForm.maxValue) {
      toast.error('Giá trị tối thiểu phải nhỏ hơn giá trị tối đa');
      return;
    }
    
    try {
      const newRule = await thresholdApi.create(ruleForm as any);
      setRules(prev => [newRule, ...prev]);
      setShowRuleModal(false);
      setCustomAction(false);
      setRuleForm({
        deviceId: devices[0]?.id || '',
        parameter: 'temperature',
        minValue: 0,
        maxValue: 100,
        action: '',
      });
      toast.success('Đã thêm quy tắc ngưỡng mới!');
    } catch (error) {
      toast.error('Lỗi khi thêm quy tắc');
    }
  };

  const toggleRule = async (id: string) => {
    if (isReadOnly) return;
    const rule = rules.find(r => r.id === id);
    if (!rule) return;

    try {
      const newStatus = !rule.isActive;
      await thresholdApi.update(id, { isActive: newStatus });
      setRules(prev => prev.map(r => (r.id === id ? { ...r, isActive: newStatus } : r)));
      toast.success(newStatus ? 'Đã bật quy tắc' : 'Đã tắt quy tắc');
    } catch (error) {
      toast.error('Lỗi khi thay đổi trạng thái');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (isReadOnly) return;
    try {
      await thresholdApi.delete(id);
      setRules(prev => prev.filter(r => r.id !== id));
      toast.success('Đã xóa quy tắc');
    } catch (error) {
      toast.error('Lỗi khi xóa');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải ngưỡng cảnh báo...</div>;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1>Ngưỡng cảnh báo</h1>
        <p>Quản lý ngưỡng cảm biến để hệ thống tự động tạo cảnh báo</p>
      </div>

      <div className="farm-card-static p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-gray-800">Danh sách quy tắc</h2>
            <p className="text-sm text-gray-500">Cấu hình các ngưỡng an toàn cho thiết bị.</p>
          </div>
          {!isReadOnly && (
            <button onClick={() => setShowRuleModal(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Thêm quy tắc
            </button>
          )}
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
                    Chỉ số: <span className="font-semibold uppercase">{r.parameter}</span> | Ngưỡng an toàn:{' '}
                    <span className="font-semibold text-green-600">{r.minValue} - {r.maxValue}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Hành động khi vượt ngưỡng: {r.action}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!isReadOnly && (
                    <>
                      <button
                        onClick={() => toggleRule(r.id)}
                        className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${r.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${r.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                      <button onClick={() => handleDeleteRule(r.id)} className="action-btn delete w-8 h-8" title="Xóa quy tắc">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showRuleModal && !isReadOnly && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-green-600" /> Thêm ngưỡng cảnh báo
              </h2>
              <button onClick={() => setShowRuleModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5 text-gray-400" />
              </button>
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
                <input
                  value={ruleForm.parameter}
                  onChange={e => setRuleForm(p => ({ ...p, parameter: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Min (Tối thiểu)</label>
                  <input
                    type="number"
                    value={ruleForm.minValue}
                    onChange={e => setRuleForm(p => ({ ...p, minValue: Number(e.target.value) }))}
                    className="form-input"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Max (Tối đa)</label>
                  <input
                    type="number"
                    value={ruleForm.maxValue}
                    onChange={e => setRuleForm(p => ({ ...p, maxValue: Number(e.target.value) }))}
                    className="form-input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Hành động tự động</label>
                
                {!customAction ? (
                  <div className="space-y-2">
                    <CustomSelect
                      value={ruleForm.action}
                      onChange={v => setRuleForm(p => ({ ...p, action: v }))}
                      options={predefinedActions.map(a => ({ value: a, label: a }))}
                      placeholder="Chọn hành động..."
                    />
                    <button
                      type="button"
                      onClick={() => setCustomAction(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      + Nhập hành động tùy chỉnh
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      value={ruleForm.action}
                      onChange={e => setRuleForm(p => ({ ...p, action: e.target.value }))}
                      className="form-input"
                      placeholder="VD: Bật quạt tốc độ cao"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCustomAction(false);
                        setRuleForm(p => ({ ...p, action: '' }));
                      }}
                      className="text-xs text-gray-600 hover:text-gray-700 hover:underline"
                    >
                      ← Quay lại chọn từ danh sách
                    </button>
                  </div>
                )}
                
                <p className="text-xs text-gray-400 mt-1.5">
                  Hành động này sẽ được ghi vào nhật ký khi ngưỡng bị vượt quá
                </p>
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
