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
  const [form, setForm] = useState({ name: '', deviceId: '', action: 'on' as 'on' | 'off', cronExpression: '', isActive: true });
  const [formError, setFormError] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [schedulesData, devicesData, fieldsData] = await Promise.all([
          scheduleApi.getAll(),
          deviceApi.getAll(),
          fieldApi.getAll(),
        ]);
        setScheduleList(schedulesData);
        setDevices(devicesData);
        setFields(fieldsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);


  const actuators = devices.filter(d => ['pump', 'valve', 'fan'].includes(d.type));

  const openAdd = () => {
    setEditingSchedule(null);
    setForm({ name: '', deviceId: actuators[0]?.id || '', action: 'on', cronExpression: '0 6 * * *', isActive: true });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (s: Schedule) => {
    setEditingSchedule(s);
    setForm({ name: s.name, deviceId: s.deviceId, action: s.action, cronExpression: s.cronExpression, isActive: s.isActive });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name) { setFormError('Vui long nhap ten lich hen'); return; }
    if (!form.deviceId) { setFormError('Vui long chon thiet bi'); return; }
    if (!form.cronExpression) { setFormError('Vui long nhap cron expression'); return; }
    if (editingSchedule) {
      setScheduleList(prev => prev.map(s => s.id === editingSchedule.id ? { ...s, ...form } : s));
    } else {
      setScheduleList(prev => [...prev, { id: `s${Date.now()}`, ...form, createdAt: new Date().toISOString() }]);
    }
    setShowModal(false);
  };

  const toggleActive = (id: string) => setScheduleList(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));

  const confirmDelete = () => {
    if (deleteTarget) {
      setScheduleList(prev => prev.filter(s => s.id !== deleteTarget));
      if (selectedSchedule?.id === deleteTarget) setSelectedSchedule(null);
      setDeleteTarget(null);
    }
  };

  const parseCron = (cron: string) => {
    const parts = cron.split(' ');
    if (parts.length >= 5) {
      const minute = parts[0].padStart(2, '0');
      const hour = parts[1].padStart(2, '0');
      const dayOfMonth = parts[2];
      const month = parts[3];
      const dayOfWeek = parts[4];
      let schedule = `${hour}:${minute}`;
      if (dayOfWeek !== '*') {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        schedule += ` ${dayOfWeek.split(',').map(d => days[parseInt(d)] || d).join(', ')}`;
      } else if (dayOfMonth !== '*') {
        schedule += ` ngay ${dayOfMonth}`;
      } else {
        schedule += ' hang ngay';
      }
      return schedule;
    }
    return cron;
  };

  // Detail view
  if (selectedSchedule) {
    const device = devices.find(d => d.id === selectedSchedule.deviceId);
    const field = device ? fields.find(f => f.id === device.fieldId) : null;
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedSchedule(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Quay lai danh sach
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
                  {selectedSchedule.isActive ? 'Dang hoat dong' : 'Tam dung'}
                </span>
              </div>
            </div>
            <button onClick={() => toggleActive(selectedSchedule.id)} className={`w-12 h-7 rounded-full flex items-center px-0.5 transition-colors ${selectedSchedule.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${selectedSchedule.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { l: 'Thiet bi', v: device?.name || 'N/A' },
              { l: 'Canh dong', v: field?.name || 'N/A' },
              { l: 'Lich trinh', v: parseCron(selectedSchedule.cronExpression) },
              { l: 'Hanh dong', v: selectedSchedule.action === 'on' ? 'Bat thiet bi' : 'Tat thiet bi' },
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
            <p className="text-xs text-gray-400 mt-1">Ngay tao: {new Date(selectedSchedule.createdAt).toLocaleDateString('vi-VN')}</p>
          </div>
          <div className="flex gap-3 pt-5 border-t border-gray-100">
            <button onClick={() => openEdit(selectedSchedule)} className="action-btn edit" style={{ width: 'auto', borderRadius: '50px', padding: '8px 20px', gap: '6px' }}>
              <Edit className="w-4 h-4" /> Sua
            </button>
            <button onClick={() => setDeleteTarget(selectedSchedule.id)} className="action-btn delete" style={{ width: 'auto', borderRadius: '50px', padding: '8px 20px', gap: '6px' }}>
              <Trash2 className="w-4 h-4" /> Xoa
            </button>
          </div>
        </div>
        <ConfirmDialog open={!!deleteTarget} title="Xoa lich hen" message="Ban co chac chan muon xoa lich hen nay? Thiet bi se khong tu dong bat/tat theo lich nay nua." onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} confirmLabel="Xoa" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Lich hen</h1>
          <p>Dat lich tu dong bat/tat thiet bi</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> Them lich
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scheduleList.map(s => {
          const device = devices.find(d => d.id === s.deviceId);
          const field = device ? fields.find(f => f.id === device.fieldId) : null;
          return (
            <div key={s.id} className={`farm-card p-5 ${!s.isActive ? 'opacity-60' : ''} cursor-pointer`} onClick={() => setSelectedSchedule(s)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.action === 'on' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {s.action === 'on' ? <Power className="w-5 h-5 text-green-600" /> : <PowerOff className="w-5 h-5 text-red-600" />}
                  </div>
                  <div>
                    <p className="text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-500">{device?.name}</p>
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
                <span>{field?.name}</span>
                <span>Hanh dong: {s.action === 'on' ? 'Bat' : 'Tat'}</span>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button onClick={e => { e.stopPropagation(); setSelectedSchedule(s); }} className="action-btn view" title="Xem"><Eye className="w-4 h-4" /></button>
                <button onClick={e => { e.stopPropagation(); openEdit(s); }} className="action-btn edit" title="Sua"><Edit className="w-4 h-4" /></button>
                <button onClick={e => { e.stopPropagation(); setDeleteTarget(s.id); }} className="action-btn delete" title="Xoa"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h2>{editingSchedule ? 'Sua lich hen' : 'Them lich hen'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{formError}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Ten lich *</label>
                <input value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setFormError(''); }} className="form-input" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Thiet bi *</label>
                <CustomSelect
                  value={form.deviceId}
                  onChange={v => setForm(p => ({ ...p, deviceId: v }))}
                  options={actuators.map(d => ({ value: d.id, label: d.name }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Hanh dong *</label>
                <CustomSelect
                  value={form.action}
                  onChange={v => setForm(p => ({ ...p, action: v as 'on' | 'off' }))}
                  options={[
                    { value: 'on', label: 'Bat' },
                    { value: 'off', label: 'Tat' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Cron Expression *</label>
                <input value={form.cronExpression} onChange={e => { setForm(p => ({ ...p, cronExpression: e.target.value })); setFormError(''); }} className="form-input" placeholder="0 6 * * *" />
                <p className="text-xs text-gray-400 mt-1">VD: "0 6 * * *" = 06:00 hang ngay</p>
              </div>
            </div>
            <div className="flex gap-3 mt-7">
              <button onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center">Huy</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center">Luu</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Xoa lich hen" message="Ban co chac chan muon xoa lich hen nay? Thiet bi se khong tu dong bat/tat theo lich nay nua." onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} confirmLabel="Xoa" />
    </div>
  );
}