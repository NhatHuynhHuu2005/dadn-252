import { useState, useEffect, useCallback } from 'react';
import { deviceApi, fieldApi, sensorApi, useWebSocketBroadcast, type Device, type Field, type SensorLog } from '../api/client';
import { Cpu, Thermometer, Droplets, Sun, Gauge, Power, Fan, ToggleLeft, Wifi, WifiOff, AlertCircle, X, Activity, Plus, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CustomSelect } from '../components/CustomSelect';

const typeIcons: Record<string, any> = {
  temperature: Thermometer,
  humidity: Droplets,
  soil_moisture: Droplets,
  light: Sun,
  ph: Gauge,
  pump: Power,
  valve: ToggleLeft,
  fan: Fan,
};

const typeLabels: Record<string, string> = {
  temperature: 'Nhiet do',
  humidity: 'Do am',
  soil_moisture: 'Do am dat',
  light: 'Anh sang',
  ph: 'pH',
  pump: 'May bom',
  valve: 'Van',
  fan: 'Quat',
};

const typeColors: Record<string, string> = {
  temperature: '#ef4444',
  humidity: '#3b82f6',
  soil_moisture: '#8b5cf6',
  light: '#f59e0b',
  ph: '#10b981',
  pump: '#06b6d4',
  valve: '#6366f1',
  fan: '#ec4899',
};

const defaultUnits: Record<string, string> = {
  temperature: '°C',
  humidity: '%',
  soil_moisture: '%',
  light: 'lux',
  ph: 'pH',
  pump: '',
  valve: '',
  fan: '',
};

export function DevicesPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [deviceList, setDeviceList] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<SensorLog[]>([]);
  const [liveData, setLiveData] = useState<Record<string, SensorLog[]>>({});
  const [filterField, setFilterField] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', type: 'temperature' as Device['type'], fieldId: '', status: 'online' as Device['status'] });
  const [addError, setAddError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { readings, isConnected: wsConnected } = useWebSocketBroadcast();

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [fieldsResult, devicesResult] = await Promise.all([fieldApi.getAll(), deviceApi.getAll()]);
        setFields(fieldsResult);
        setDeviceList(devicesResult);
        if (fieldsResult.length > 0) {
          setAddForm(prev => ({ ...prev, fieldId: fieldsResult[0].id }));
        }
      } catch (err) {
        console.error('Failed to load devices or fields', err);
        setError('Khong the tai du lieu. Vui long thu lai.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (!readings || readings.length === 0) return;

    const latest = readings[readings.length - 1];

    setDeviceList(prev => prev.map(d => {
      if (d.id === latest.deviceId) {
        return { ...d, lastValue: latest.value, lastUpdate: latest.timestamp };
      }
      return d;
    }));

    setLiveData(prev => {
      const existing = prev[latest.deviceId] || [];
      const updated = [...existing, latest].slice(-100);
      return { ...prev, [latest.deviceId]: updated };
    });
  }, [readings]);

  useEffect(() => {
    if (!selectedDevice) {
      setSelectedHistory([]);
      return;
    }

    let isMounted = true;
    sensorApi.getHistory(selectedDevice.id, 100)
      .then(history => {
        if (isMounted) {
          setSelectedHistory(history);
        }
      })
      .catch(err => {
        console.error('Failed to fetch sensor history', err);
      });

    return () => { isMounted = false; };
  }, [selectedDevice]);

  const toggleActuator = useCallback(async (deviceId: string) => {
    setDeviceList(prev => prev.map(d => {
      if (d.id === deviceId && ['pump', 'valve', 'fan'].includes(d.type)) {
        const nextValue = d.lastValue === 1 ? 0 : 1;
        deviceApi.update(deviceId, { lastValue: nextValue });
        return { ...d, lastValue: nextValue, status: 'online' };
      }
      return d;
    }));
  }, []);

  const handleAddDevice = async () => {
    if (!addForm.name) {
      setAddError('Vui long nhap ten thiet bi');
      return;
    }
    if (!addForm.fieldId) {
      setAddError('Vui long chon canh dong');
      return;
    }

    const newDevice: Omit<Device, 'id' | 'createdAt'> = {
      name: addForm.name,
      type: addForm.type,
      status: addForm.status,
      fieldId: addForm.fieldId,
      lastValue: ['pump', 'valve', 'fan'].includes(addForm.type) ? 0 : undefined,
      unit: defaultUnits[addForm.type],
    };

    try {
      const created = await deviceApi.create(newDevice as any);
      setDeviceList(prev => [created, ...prev]);
      setShowAddModal(false);
      setAddForm({ name: '', type: 'temperature', fieldId: fields[0]?.id || '', status: 'online' });
      setAddError('');
    } catch (err) {
      console.error('Failed to create device', err);
      setAddError('Tao thiet bi khong thanh cong.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deviceApi.delete(deleteTarget);
      setDeviceList(prev => prev.filter(d => d.id !== deleteTarget));
      if (selectedDevice?.id === deleteTarget) setSelectedDevice(null);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete device', err);
      setDeleteTarget(null);
    }
  };

  const filteredDevices = deviceList.filter(d => {
    if (filterField !== 'all' && d.fieldId !== filterField) return false;
    if (filterType !== 'all' && d.type !== filterType) return false;
    return true;
  });

  const statusDot = (status: string) => {
    const c = status === 'online' ? 'bg-green-500' : status === 'offline' ? 'bg-gray-400' : 'bg-red-500';
    return <span className={`w-2.5 h-2.5 rounded-full ${c} inline-block`} />;
  };

  const selectedChartData = selectedDevice
    ? (liveData[selectedDevice.id] ?? selectedHistory).map((entry) => ({
        ...entry,
        time: new Date(entry.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      }))
    : [];

  if (isLoading) {
    return <div>Đang tải dữ liệu thiết bị...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Thiet bi IoT</h1>
          <p>Quan ly va giam sat thiet bi thoi gian thuc</p>
        </div>
        <div className="flex items-center gap-3">
          {wsConnected ? (
            <span className="status-badge online"><Wifi className="w-4 h-4" /> Socket ket noi</span>
          ) : (
            <span className="status-badge error"><WifiOff className="w-4 h-4" /> Mat ket noi</span>
          )}
          <button onClick={() => { setShowAddModal(true); setAddError(''); }} className="btn-primary">
            <Plus className="w-4 h-4" /> Them thiet bi
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <CustomSelect
          value={filterField}
          onChange={setFilterField}
          options={[
            { value: 'all', label: 'Tat ca canh dong' },
            ...fields.map(f => ({ value: f.id, label: f.name })),
          ]}
          style={{ minWidth: '180px', width: 'auto' }}
        />
        <CustomSelect
          value={filterType}
          onChange={setFilterType}
          options={[
            { value: 'all', label: 'Tat ca loai' },
            ...Object.entries(typeLabels).map(([k, v]) => ({ value: k, label: v })),
          ]}
          style={{ minWidth: '160px', width: 'auto' }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filteredDevices.map(d => {
          const Icon = typeIcons[d.type] || Cpu;
          const color = typeColors[d.type] || '#6b7280';
          const field = fields.find(f => f.id === d.fieldId);
          const isActuator = ['pump', 'valve', 'fan'].includes(d.type);
          const isOn = d.lastValue === 1;
          const live = liveData[d.id];
          const lastUpdate = live?.[live.length - 1]?.timestamp || d.lastUpdate;

          return (
            <div key={d.id} className="farm-card p-5 cursor-pointer relative group" onClick={() => setSelectedDevice(d)}>
              <button
                onClick={e => { e.stopPropagation(); setDeleteTarget(d.id); }}
                className="action-btn delete absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all"
                style={{ width: 28, height: 28 }}
                title="Xoa thiet bi"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 truncate max-w-[150px]">{d.name}</p>
                    <p className="text-xs text-gray-400">{typeLabels[d.type]}</p>
                  </div>
                </div>
                {statusDot(d.status)}
              </div>

              {isActuator ? (
                <div className="flex items-center justify-between mt-4">
                  <span className={`text-sm ${isOn ? 'text-green-600' : 'text-gray-500'}`}>{isOn ? 'Dang bat' : 'Dang tat'}</span>
                  <button
                    onClick={e => { e.stopPropagation(); toggleActuator(d.id); }}
                    className={`w-12 h-7 rounded-full flex items-center transition-colors px-0.5 ${isOn ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${isOn ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-3xl text-gray-800">{d.lastValue ?? '-'}<span className="text-sm text-gray-400 ml-1">{d.unit}</span></p>
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400">{field?.name}</span>
                {lastUpdate && (
                  <span className="flex items-center gap-1 text-xs text-green-500">
                    <Activity className="w-3 h-3" /> Live
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDevice && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 min-w-0">
                {(() => { const Icon = typeIcons[selectedDevice.type] || Cpu; return <Icon className="w-6 h-6 shrink-0" style={{ color: typeColors[selectedDevice.type] }} />; })()}
                <div className="min-w-0">
                  <h2 className="text-gray-800 truncate">{selectedDevice.name}</h2>
                  <p className="text-sm text-gray-500 truncate">{typeLabels[selectedDevice.type]} - {fields.find(f => f.id === selectedDevice.fieldId)?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => { setDeleteTarget(selectedDevice.id); }} className="action-btn delete" title="Xoa thiet bi">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedDevice(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#f8faf8] rounded-xl p-4 text-center border border-green-50">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider">Trang thai</p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  {statusDot(selectedDevice.status)}
                  <span className="text-sm text-gray-700">{selectedDevice.status}</span>
                </div>
              </div>
              <div className="bg-[#f8faf8] rounded-xl p-4 text-center border border-green-50">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider">Gia tri hien tai</p>
                <p className="text-xl text-gray-800 mt-1">{selectedDevice.lastValue ?? '-'}{selectedDevice.unit}</p>
              </div>
              <div className="bg-[#f8faf8] rounded-xl p-4 text-center border border-green-50">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider">WebSocket</p>
                <p className="text-sm text-green-600 mt-1">{wsConnected ? 'Da ket noi' : 'Mat ket noi'}</p>
              </div>
            </div>

            {(['pump', 'valve', 'fan'].includes(selectedDevice.type) ? false : true) && (
              <div>
                <h3 className="text-gray-800 mb-3">Du lieu thoi gian thuc</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={selectedChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" domain={[ 'auto', 'auto' ]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke={typeColors[selectedDevice.type]} strokeWidth={2} dot={false} name={selectedDevice.unit} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
              <p className="text-sm text-green-800"><strong>API Endpoint:</strong> GET /api/devices/{selectedDevice.id}/data</p>
              <p className="text-sm text-green-800 mt-1"><strong>WebSocket:</strong> ws://localhost:5000/ws?deviceId={selectedDevice.id}</p>
              <p className="text-xs text-green-600 mt-2">Du lieu duoc cap nhat tu WebSocket va sensor history API</p>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h2>Them thiet bi moi</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {addError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{addError}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Ten thiet bi *</label>
                <input value={addForm.name} onChange={e => { setAddForm(p => ({ ...p, name: e.target.value })); setAddError(''); }} className="form-input" placeholder="VD: Cam bien nhiet do A1-05" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Loai thiet bi *</label>
                <CustomSelect
                  value={addForm.type}
                  onChange={v => setAddForm(p => ({ ...p, type: v as Device['type'] }))}
                  options={Object.entries(typeLabels).map(([k, v]) => ({ value: k, label: v }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Canh dong *</label>
                <CustomSelect
                  value={addForm.fieldId}
                  onChange={v => setAddForm(p => ({ ...p, fieldId: v }))}
                  options={fields.map(f => ({ value: f.id, label: `${f.name} (${f.location})` }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Trang thai</label>
                <CustomSelect
                  value={addForm.status}
                  onChange={v => setAddForm(p => ({ ...p, status: v as Device['status'] }))}
                  options={[
                    { value: 'online', label: 'Online' },
                    { value: 'offline', label: 'Offline' },
                  ]}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-7">
              <button onClick={() => setShowAddModal(false)} className="btn-ghost flex-1 justify-center">Huy</button>
              <button onClick={handleAddDevice} className="btn-primary flex-1 justify-center">Luu</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Xac nhan xoa thiet bi"
        description="Ban co chac chan muon xoa thiet bi nay?"
      />
    </div>
  );
}
