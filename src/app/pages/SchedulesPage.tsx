import { ConfirmDialog } from '../components/ConfirmDialog';
import { CustomSelect } from '../components/CustomSelect';
import { useState, useEffect } from 'react';
import { scheduleApi, deviceApi, fieldApi, type Schedule, type Device, type Field } from '../api/client';
import { CalendarClock, Plus, Edit, Trash2, X, Power, PowerOff, Eye, ChevronLeft } from 'lucide-react';

export function SchedulesPage() {
  const [scheduleList, setScheduleList] = useState<Schedule[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [form, setForm] = useState({ name: '', fieldId: '', deviceId: '', action: 'on' as 'on' | 'off', cronExpression: '', isActive: true });
  const [formError, setFormError] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [schedulesData, devicesData, fieldsData] = await Promise.all([
          scheduleApi.getAll().catch(() => []),
          deviceApi.getAll().catch(() => []),
          fieldApi.getAll().catch(() => []),
        ]);
        setScheduleList(schedulesData);
        setDevices(devicesData);
        setFields(fieldsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Lọc thiết bị: Bao gồm cả chữ 'control' hoặc 'CONTROL' từ DB
  const actuators = devices.filter(d => ['pump', 'valve', 'fan', 'control'].includes((d.type || '').toLowerCase()));

  const openAdd = () => {
    setEditingSchedule(null);
    setForm({ name: '', fieldId: fields[0]?.id || '', deviceId: '', action: 'on', cronExpression: '0 6 * * *', isActive: true });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (s: Schedule) => {
    setEditingSchedule(s);
    setForm({ name: s.name, fieldId: s.fieldId || '', deviceId: s.deviceId || '', action: s.action as 'on' | 'off', cronExpression: s.cronExpression, isActive: s.isActive });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) { setFormError('Vui lòng nhập tên lịch hẹn'); return; }
    if (!form.fieldId) { setFormError('Vui lòng chọn cánh đồng'); return; }
    if (!form.deviceId) { setFormError('Vui lòng chọn thiết bị'); return; }
    if (!form.cronExpression) { setFormError('Vui lòng nhập cron expression'); return; }

    try {
      if (editingSchedule) {
        const updated = await scheduleApi.update(editingSchedule.id, form);
        setScheduleList(prev => prev.map(s => s.id === editingSchedule.id ? updated : s));
        if(selectedSchedule?.id === editingSchedule.id) setSelectedSchedule(updated);
      } else {
        const created = await scheduleApi.create(form);
        setScheduleList(prev => [created, ...prev]);
      }
      setShowModal(false);
    } catch (error) {
      console.error(error);
      setFormError('Lỗi khi lưu vào Database! Vui lòng khởi động lại server Node.js.');
    }
  };

  const toggleActive = async (id: string) => {
    const s = scheduleList.find(x => x.id === id);
    if (!s) return;

    try {
      await scheduleApi.update(id, { ...s, isActive: !s.isActive }); 
      
      setScheduleList(prev => prev.map(x => x.id === id ? { ...x, isActive: !x.isActive } : x));
      
      if (selectedSchedule?.id === id) {
        setSelectedSchedule({ ...selectedSchedule, isActive: !s.isActive });
      }
    } catch(err) {
      console.error("Lỗi khi cập nhật lịch hẹn:", err);
      alert("Không thể lưu trạng thái lịch hẹn vào hệ thống!");
    }
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        await scheduleApi.delete(deleteTarget); // Xóa khỏi DB
        setScheduleList(prev => prev.filter(s => s.id !== deleteTarget));
        if (selectedSchedule?.id === deleteTarget) setSelectedSchedule(null);
        setDeleteTarget(null);
      } catch(err) {
        console.error(err);
      }
    }
  };

  const parseCron = (cron: string) => {
    if(!cron) return 'N/A';
    const parts = cron.split(' ');
    if (parts.length >= 5) {
      const minute = parts[0].padStart(2, '0');
      const hour = parts[1].padStart(2, '0');
      const dayOfMonth = parts[2];
      const dayOfWeek = parts[4];
      let schedule = `${hour}:${minute}`;
      if (dayOfWeek !== '*') {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        schedule += ` ${dayOfWeek.split(',').map(d => days[parseInt(d)] || d).join(', ')}`;
      } else if (dayOfMonth !== '*') {
        schedule += ` ngày ${dayOfMonth}`;
      } else {
        schedule += ' hàng ngày';
      }
      return schedule;
    }
    return cron;
  };

  // Detảil view
  if (selectedSchedule) {
    const device = devices.find(d => d.id === selectedSchedule.deviceId);
    const field = fields.find(f => f.id === selectedSchedule.fieldId);
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedSchedule(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
        </button>
        <div className="farm-card-static p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedSchedule.action === 'on' ? 'bg-green-100' : 'bg-red-100'}`}>
                {selectedSchedule.action === 'on' ? <Power className="w-6 h-6 text-green-600" /> : <PowerOff className="w-6 h-6 text-red-600" />}
              </div>
              <div>
                <h2 className="text-gray-800">{selectedSchedule.name}</h2>
                <span className={`status-badge ${selectedSchedule.isActive ? 'active' : 'inactive'}`}>
                  {selectedSchedule.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                </span>
              </div>
            </div>
            <button onClick={() => toggleActive(selectedSchedule.id)} className={`w-12 h-7 rounded-full flex items-center px-0.5 transition-colors ${selectedSchedule.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${selectedSchedule.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { l: 'Thiết bị', v: device?.name || 'N/A' },
              { l: 'Cánh đồng', v: field?.name || 'N/A' },
              { l: 'Lịch trình', v: parseCron(selectedSchedule.cronExpression) },
              { l: 'Hành động', v: selectedSchedule.action === 'on' ? 'Bật thiết bị' : 'Tắt thiết bị' },
            ].map(item => (
              <div key={item.l} className="bg-[#f8faf8] rounded-xl p-4 border border-green-50">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider">{item.l}</p>
                <p className="text-sm text-gray-800 mt-1.5">{item.v}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#f8faf8] rounded-xl p-4 mb-6 border border-green-50">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">Cron Expression</p>
            <p className="text-sm text-gray-800 mt-1 font-mono">{selectedSchedule.cronExpression}</p>
            <p className="text-xs text-gray-400 mt-1">Ngày tạo: {new Date(selectedSchedule.createdAt).toLocaleDateString('vi-VN')}</p>
          </div>
          <div className="flex gap-3 pt-5 border-t border-gray-100">
            <button onClick={() => openEdit(selectedSchedule)} className="action-btn edit" style={{ width: 'auto', borderRadius: '50px', padding: '8px 20px', gap: '6px' }}>
              <Edit className="w-4 h-4" /> Sửa
            </button>
            <button onClick={() => setDeleteTarget(selectedSchedule.id)} className="action-btn delete" style={{ width: 'auto', borderRadius: '50px', padding: '8px 20px', gap: '6px' }}>
              <Trash2 className="w-4 h-4" /> Xóa
            </button>
          </div>
        </div>
        <ConfirmDialog open={!!deleteTarget} title="Xóa lịch hẹn" message="Bạn có chắc chắn muốn xóa lịch hẹn này? Thiết bị sẽ không tự động bật/tắt theo lịch này nữa." onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} confirmLabel="Xóa" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Lịch hẹn</h1>
          <p>Đặt lịch tự động bật/tắt thiết bị</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> Thêm lịch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scheduleList.map(s => {
          const device = devices.find(d => d.id === s.deviceId);
          const field = fields.find(f => f.id === s.fieldId);
          return (
            <div key={s.id} className={`farm-card p-5 ${!s.isActive ? 'opacity-60' : ''} cursor-pointer`} onClick={() => setSelectedSchedule(s)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.action === 'on' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {s.action === 'on' ? <Power className="w-5 h-5 text-green-600" /> : <PowerOff className="w-5 h-5 text-red-600" />}
                  </div>
                  <div>
                    <p className="text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-500">{device?.name || 'N/A'}</p>
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); toggleActive(s.id); }} className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${s.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${s.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                <CalendarClock className="w-4 h-4" />
                <span>{parseCron(s.cronExpression)}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{field?.name || 'N/A'}</span>
                <span>Hành động: {s.action === 'on' ? 'Bật' : 'Tắt'}</span>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button onClick={e => { e.stopPropagation(); setSelectedSchedule(s); }} className="action-btn view" title="Xem"><Eye className="w-4 h-4" /></button>
                <button onClick={e => { e.stopPropagation(); openEdit(s); }} className="action-btn edit" title="Sửa"><Edit className="w-4 h-4" /></button>
                <button onClick={e => { e.stopPropagation(); setDeleteTarget(s.id); }} className="action-btn delete" title="Xóa"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h2>{editingSchedule ? 'Sửa lịch hẹn' : 'Thêm lịch hẹn'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{formError}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Tên lịch *</label>
                <input value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setFormError(''); }} className="form-input" />
              </div>
              
              {/* Thêm chọn cánh đồng vào Form */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Cánh đồng *</label>
                <CustomSelect
                  value={form.fieldId}
                  onChange={v => {
                    setForm(p => ({ ...p, fieldId: v, deviceId: '' })); // Reset thiết bị khi đổi cánh đồng
                    setFormError('');
                  }}
                  options={fields.map(f => ({ value: f.id, label: f.name }))}
                />
              </div>

              {/* Danh sách thiết bị phụ thuộc vào cánh đồng đã chọn */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Thiết bị *</label>
                <CustomSelect
                  value={form.deviceId}
                  onChange={v => { setForm(p => ({ ...p, deviceId: v })); setFormError(''); }}
                  options={actuators.filter(d => d.fieldId === form.fieldId).map(d => ({ value: d.id, label: d.name }))}
                />
                {actuators.filter(d => d.fieldId === form.fieldId).length === 0 && form.fieldId !== '' && (
                  <p className="text-xs text-red-500 mt-1">Cánh đồng này không có thiết bị điều khiển nào!</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Hành động *</label>
                <CustomSelect
                  value={form.action}
                  onChange={v => setForm(p => ({ ...p, action: v as 'on' | 'off' }))}
                  options={[
                    { value: 'on', label: 'Bật' },
                    { value: 'off', label: 'Tắt' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Cron Expression *</label>
                <input value={form.cronExpression} onChange={e => { setForm(p => ({ ...p, cronExpression: e.target.value })); setFormError(''); }} className="form-input" placeholder="0 6 * * *" />
                <p className="text-xs text-gray-400 mt-1">VD: "0 6 * * *" = 06:00 hàng ngày</p>
              </div>
            </div>
            <div className="flex gap-3 mt-7">
              <button onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center">Hủy</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center">Lưu</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Xóa lịch hẹn" message="Bạn có chắc chắn muốn xóa lịch hẹn này? Thiết bị sẽ không tự động bật/tắt theo lịch này nữa." onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} confirmLabel="Xóa" />
    </div>
  );
}
