import { ConfirmDialog } from '../components/ConfirmDialog';
import { CustomSelect } from '../components/CustomSelect';
import { useState } from 'react';
import { alertApi, deviceApi, fieldApi, type Alert, type Device, type Field } from '../api/client';
import { AlertTriangle, Bell, CheckCheck, Trash2, Plus, Edit, X, ChevronLeft } from 'lucide-react';

export function AlertsPage() {
  const [alertList, setAlertList] = useState<Alert[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'warning' | 'critical' | 'info'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState({ deviceId: '', type: 'warning' as Alert['type'], message: '' });
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [alertsData, devicesData, fieldsData] = await Promise.all([
          alertApi.getAll(),
          deviceApi.getAll(),
          fieldApi.getAll(),
        ]);
        setAlertList(alertsData);
        setDevices(devicesData);
        setFields(fieldsData);
      } catch (err) {
        console.error('AlertsPage load error', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const markRead = (id: string) => setAlertList(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  const markAllRead = () => setAlertList(prev => prev.map(a => ({ ...a, isRead: true })));

  const confirmDelete = () => {
    if (deleteTarget) {
      setAlertList(prev => prev.filter(a => a.id !== deleteTarget));
      if (selectedAlert?.id === deleteTarget) setSelectedAlert(null);
      setDeleteTarget(null);
    }
  };

  const openAdd = () => {
    setEditingAlert(null);
    setForm({ deviceId: devices[0]?.id || '', type: 'warning', message: '' });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (a: Alert) => {
    setEditingAlert(a);
    setForm({ deviceId: a.deviceId, type: a.type, message: a.message });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.message) { setFormError('Vui long nhap noi dung canh bao'); return; }
    if (!form.deviceId) { setFormError('Vui long chon thiet bi'); return; }
    if (editingAlert) {
      setAlertList(prev => prev.map(a => a.id === editingAlert.id ? { ...a, ...form } : a));
    } else {
      setAlertList(prev => [{ id: `a${Date.now()}`, ...form, isRead: false, createdAt: new Date().toISOString() }, ...prev]);
    }
    setShowModal(false);
  };

  const filtered = alertList.filter(a => {
    if (filter === 'unread') return !a.isRead;
    if (filter === 'all') return true;
    return a.type === filter;
  });

  const unreadCount = alertList.filter(a => !a.isRead).length;

  const typeConfig: Record<string, { bg: string; icon: string; label: string }> = {
    critical: { bg: 'bg-red-50 border-red-200', icon: 'text-red-500', label: 'Nghiem trong' },
    warning: { bg: 'bg-yellow-50 border-yellow-200', icon: 'text-yellow-500', label: 'Canh bao' },
    info: { bg: 'bg-blue-50 border-blue-200', icon: 'text-blue-500', label: 'Thong tin' },
  };

  const filterLabels: Record<string, string> = { all: 'Tat ca', unread: 'Chua doc', critical: 'Nghiem trong', warning: 'Canh bao', info: 'Thong tin' };

  // Detail view
  if (selectedAlert) {
    const config = typeConfig[selectedAlert.type];
    const device = devices.find(d => d.id === selectedAlert.deviceId);
    const field = device ? fields.find(f => f.id === device.fieldId) : null;
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedAlert(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Quay lai danh sach
        </button>
        <div className="farm-card-static p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${selectedAlert.type === 'critical' ? 'bg-red-100' : selectedAlert.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
              <AlertTriangle className={`w-7 h-7 ${config.icon}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`status-badge ${selectedAlert.type === 'critical' ? 'error' : selectedAlert.type === 'warning' ? 'warning' : 'active'}`}>
                  {config.label}
                </span>
                {!selectedAlert.isRead && <span className="status-badge active">Chua doc</span>}
              </div>
              <h2 className="text-gray-800">{selectedAlert.message}</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { l: 'Thiet bi', v: device?.name || 'N/A' },
              { l: 'Canh dong', v: field?.name || 'N/A' },
              { l: 'Thoi gian', v: new Date(selectedAlert.createdAt).toLocaleString('vi-VN') },
              { l: 'Gia tri hien tai', v: device?.lastValue !== undefined ? `${device.lastValue}${device.unit}` : 'N/A' },
            ].map(item => (
              <div key={item.l} className="bg-[#f8faf8] rounded-xl p-4 border border-green-50">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider">{item.l}</p>
                <p className="text-sm text-gray-800 mt-1.5">{item.v}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-5 border-t border-gray-100">
            {!selectedAlert.isRead && (
              <button onClick={() => { markRead(selectedAlert.id); setSelectedAlert({ ...selectedAlert, isRead: true }); }} className="btn-outline" style={{ padding: '8px 20px' }}>
                <CheckCheck className="w-4 h-4" /> Da doc
              </button>
            )}
            <button onClick={() => openEdit(selectedAlert)} className="action-btn edit" style={{ width: 'auto', borderRadius: '50px', padding: '8px 20px', gap: '6px' }}>
              <Edit className="w-4 h-4" /> Sua
            </button>
            <button onClick={() => setDeleteTarget(selectedAlert.id)} className="action-btn delete" style={{ width: 'auto', borderRadius: '50px', padding: '8px 20px', gap: '6px' }}>
              <Trash2 className="w-4 h-4" /> Xoa
            </button>
          </div>
        </div>
        <ConfirmDialog open={!!deleteTarget} title="Xoa canh bao" message="Ban co chac muon xoa canh bao nay?" onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} confirmLabel="Xoa" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Canh bao</h1>
          <p>{unreadCount} canh bao chua doc</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={markAllRead} className="btn-ghost">
            <CheckCheck className="w-4 h-4" /> Da doc tat ca
          </button>
          <button onClick={openAdd} className="btn-primary">
            <Plus className="w-4 h-4" /> Tao canh bao
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'unread', 'critical', 'warning', 'info'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`filter-chip ${filter === f ? 'active' : ''}`}>
            {filterLabels[f]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="farm-card-static empty-state">
            <Bell className="w-14 h-14" />
            <p>Khong co canh bao nao</p>
          </div>
        ) : filtered.map(a => {
          const config = typeConfig[a.type];
          const device = devices.find(d => d.id === a.deviceId);
          return (
            <div key={a.id} className={`farm-card flex items-start gap-4 p-4 border ${config.bg} cursor-pointer ${!a.isRead ? 'ring-2 ring-green-300 ring-offset-1' : ''}`} onClick={() => setSelectedAlert(a)}>
              <AlertTriangle className={`w-5 h-5 mt-0.5 ${config.icon} shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{a.message}</p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="text-xs text-gray-500">Thiet bi: {device?.name}</span>
                  <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!a.isRead && (
                  <button onClick={e => { e.stopPropagation(); markRead(a.id); }} className="action-btn view" style={{ width: 30, height: 30 }} title="Da doc">
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={e => { e.stopPropagation(); openEdit(a); }} className="action-btn edit" style={{ width: 30, height: 30 }} title="Sua">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={e => { e.stopPropagation(); setDeleteTarget(a.id); }} className="action-btn delete" style={{ width: 30, height: 30 }} title="Xoa">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h2>{editingAlert ? 'Sua canh bao' : 'Tao canh bao moi'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{formError}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Thiet bi *</label>
                <CustomSelect
                  value={form.deviceId}
                  onChange={v => setForm(p => ({ ...p, deviceId: v }))}
                  options={devices.map(d => ({ value: d.id, label: d.name }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Muc do *</label>
                <CustomSelect
                  value={form.type}
                  onChange={v => setForm(p => ({ ...p, type: v as Alert['type'] }))}
                  options={[
                    { value: 'info', label: 'Thong tin' },
                    { value: 'warning', label: 'Canh bao' },
                    { value: 'critical', label: 'Nghiem trong' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Noi dung *</label>
                <textarea value={form.message} onChange={e => { setForm(p => ({ ...p, message: e.target.value })); setFormError(''); }} rows={3} className="form-input resize-none" placeholder="Mo ta canh bao..." />
              </div>
            </div>
            <div className="flex gap-3 mt-7">
              <button onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center">Huy</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center">Luu</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Xoa canh bao" message="Ban co chac chan muon xoa canh bao nay?" onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} confirmLabel="Xoa" />
    </div>
  );
}