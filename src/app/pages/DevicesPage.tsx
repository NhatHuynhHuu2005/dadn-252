import { useState, useEffect, useCallback } from 'react';
import { deviceApi, fieldApi, sensorApi, useWebSocketBroadcast, type Device, type Field, type SensorLog } from '../api/client';
import { Cpu, Thermometer, Droplets, Sun, Gauge, Power, Fan, ToggleLeft, Wifi, WifiOff, AlertCircle, X, Activity, Plus, Trash2, Radio, Layers, HelpCircle, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CustomSelect } from '../components/CustomSelect';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../hooks/useRole';
import { toast } from 'sonner';

const typeIcons: Record<string, any> = {
  temperature: Thermometer,
  humidity: Droplets,
  soil_moisture: Droplets,
  rainfall: Droplets,
  electrical_conductivity: Activity,
  wind_speed: Fan,
  light: Sun,
  ph: Gauge,
  pump: Power,
  valve: ToggleLeft,
  fan: Fan,
  light_control: Sun,
  control: Cpu,
};

const typeLabels: Record<string, string> = {
  temperature: 'Nhiệt độ',
  humidity: 'Độ ẩm',
  soil_moisture: 'Độ ẩm đất',
  rainfall: 'Lượng mưa',
  electrical_conductivity: 'Độ dẫn điện',
  wind_speed: 'Tốc độ gió',
  light: 'Ánh sáng',
  ph: 'pH',
  pump: 'Máy bơm',
  valve: 'Van',
  fan: 'Quạt',
  light_control: 'Đèn',
  control: 'Điều khiển',
};

const typeColors: Record<string, string> = {
  temperature: '#ef4444',
  humidity: '#3b82f6',
  soil_moisture: '#8b5cf6',
  rainfall: '#0ea5e9',
  electrical_conductivity: '#10b981',
  wind_speed: '#64748b',
  light: '#f59e0b',
  ph: '#10b981',
  pump: '#06b6d4',
  valve: '#6366f1',
  fan: '#ec4899',
  light_control: '#f59e0b',
  control: '#6b7280',
};

const defaultUnits: Record<string, string> = {
  temperature: '°C',
  humidity: '%',
  soil_moisture: '%',
  rainfall: 'mm',
  electrical_conductivity: 'mS/cm',
  wind_speed: 'm/s',
  light: 'lux',
  ph: 'pH',
  pump: '',
  valve: '',
  fan: '',
  light_control: '',
  control: '',
};

const SENSOR_TYPES = ['temperature', 'humidity', 'soil_moisture', 'light', 'ph', 'rainfall', 'electrical_conductivity', 'wind_speed'];
const ACTUATOR_TYPES = ['pump', 'valve', 'fan', 'control', 'light_control'];

export function DevicesPage() {
  const { user } = useAuth();
  const { canManageDevices, canToggleActuator } = useRole();

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
  const [activeSection, setActiveSection] = useState<'all' | 'sensors' | 'actuators'>('all');
  const [processingActuators, setProcessingActuators] = useState<string[]>([]);

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
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
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
      const updated = [...existing, latest as any].slice(-100);
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
        if (isMounted) setSelectedHistory(history);
      })
      .catch(err => console.error('Failed to fetch sensor history', err));

    return () => { isMounted = false; };
  }, [selectedDevice]);

  const toggleActuator = async (deviceId: string) => {
    if (!canToggleActuator) return;

    const device = deviceList.find(d => d.id === deviceId);
    if (!device || !ACTUATOR_TYPES.includes((device.type || '').toLowerCase())) return;

    const nextValue = device.lastValue === 1 ? 0 : 1;
    
    setProcessingActuators(prev => [...prev, deviceId]);

    try {
      await deviceApi.update(deviceId, { ...device, lastValue: nextValue });
      // Simulate slight network delay for better UX
      await new Promise(res => setTimeout(res, 600));
      setDeviceList(prev => prev.map(d => d.id === deviceId ? { ...d, lastValue: nextValue } : d));
    } catch (err) {
      console.error('Lỗi khi điều khiển thiết bị:', err);
      toast.error('Lỗi mạng: Không thể lưu trạng thái thiết bị!');
    } finally {
      setProcessingActuators(prev => prev.filter(id => id !== deviceId));
    }
  };

  const handleAddDevice = async () => {
    if (!canManageDevices) return;
    if (!addForm.name) { setAddError('Vui lòng nhập tên thiết bị'); return; }
    if (!addForm.fieldId) { setAddError('Vui lòng chọn cánh đồng'); return; }

    const newDevice: Omit<Device, 'id' | 'createdAt'> = {
      name: addForm.name,
      type: addForm.type,
      status: addForm.status,
      fieldId: addForm.fieldId,
      lastValue: ACTUATOR_TYPES.includes(addForm.type) ? 0 : undefined,
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
      setAddError('Tạo thiết bị không thành công.');
    }
  };

  const confirmDelete = async () => {
    if (!canManageDevices || !deleteTarget) return;

    try {
      await deviceApi.delete(deleteTarget);
      setDeviceList(prev => prev.filter(d => d.id !== deleteTarget));
      setDeleteTarget(null);
      if (selectedDevice?.id === deleteTarget) setSelectedDevice(null);
      toast.success('Đã xóa thiết bị thành công');
    } catch (err) {
      console.error("Lỗi khi xóa thiết bị:", err);
      toast.error("Không thể xóa thiết bị này!");
    }
  };

  const baseFilteredDevices = deviceList.filter(d => {
    if (filterField !== 'all' && d.fieldId !== filterField) return false;
    if (filterType !== 'all' && d.type !== filterType) return false;
    return true;
  });

  const allCount = baseFilteredDevices.length;
  const sensorCount = baseFilteredDevices.filter(d => SENSOR_TYPES.includes((d.type || '').toLowerCase())).length;
  const actuatorCount = baseFilteredDevices.filter(d => ACTUATOR_TYPES.includes((d.type || '').toLowerCase())).length;

  const filteredDevices = baseFilteredDevices.filter(d => {
    const typeLower = (d.type || '').toLowerCase();
    if (activeSection === 'sensors' && !SENSOR_TYPES.includes(typeLower)) return false;
    if (activeSection === 'actuators' && !ACTUATOR_TYPES.includes(typeLower)) return false;
    return true;
  });

  const sensorDevices = filteredDevices.filter(d => SENSOR_TYPES.includes((d.type || '').toLowerCase()));
  const actuatorDevices = filteredDevices.filter(d => ACTUATOR_TYPES.includes((d.type || '').toLowerCase()));

  const statusDot = (status: string, animated = false) => {
    const c = status === 'online' ? 'bg-green-500' : status === 'offline' ? 'bg-gray-400' : 'bg-red-500';
    return (
      <span className="relative inline-flex">
        <span className={`w-2.5 h-2.5 rounded-full ${c} inline-block`} />
        {animated && status === 'online' && (
          <span className={`absolute inset-0 rounded-full ${c} animate-ping opacity-60`} />
        )}
      </span>
    );
  };

  const selectedChartData = selectedDevice
    ? (liveData[selectedDevice.id] ?? selectedHistory).map(entry => ({
      ...entry,
      time: new Date(entry.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    }))
    : [];

  const renderDeviceCard = (d: Device) => {
    const Icon = typeIcons[d.type] || Cpu;
    const color = typeColors[d.type] || '#6b7280';
    const field = fields.find(f => f.id === d.fieldId);
    const isActuator = ACTUATOR_TYPES.includes(d.type);
    const isOn = d.lastValue === 1;
    const isProcessing = processingActuators.includes(d.id);
    const live = liveData[d.id];
    const lastUpdate = live?.[live.length - 1]?.timestamp || d.lastUpdate;

    return (
      <div key={d.id} className="farm-card p-5 cursor-pointer relative group" onClick={() => !isProcessing && setSelectedDevice(d)}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-sm text-gray-800 truncate max-w-[150px]">{d.name}</p>
              <div className="flex items-center gap-1">
                <p className="text-xs text-gray-400">{typeLabels[d.type]}</p>
                {isActuator && (
                  <div className="group/tooltip relative flex items-center justify-center">
                    <HelpCircle className="w-3 h-3 text-gray-300 hover:text-gray-500 transition-colors" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/tooltip:block w-48 bg-gray-800 text-white text-[10px] p-2 rounded z-10 text-center shadow-lg pointer-events-none">
                      Hệ thống đã gửi tín hiệu điều khiển. Cần cảm biến phản hồi (VD: Cảm biến lưu lượng) để xác thực 100% thiết bị đã hoạt động.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {statusDot(d.status, true)}
        </div>

        {isActuator ? (
          <div className="flex items-center justify-between mt-4 h-7">
            {isProcessing ? (
              <span className="text-sm font-medium text-amber-500 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang xử lý...
              </span>
            ) : (
              <span className={`text-sm font-medium ${isOn ? 'text-green-600' : 'text-gray-500'}`}>
                {isOn ? '● Đang bật' : '○ Đang tắt'}
              </span>
            )}
            {canToggleActuator ? (
              <button
                onClick={e => { e.stopPropagation(); toggleActuator(d.id); }}
                disabled={isProcessing}
                className={`w-12 h-7 rounded-full flex items-center transition-colors px-0.5 ${isProcessing ? 'bg-amber-400 opacity-50 cursor-not-allowed' : isOn ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${isOn && !isProcessing ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            ) : (
              <span className="text-xs text-gray-400">Chỉ xem</span>
            )}
          </div>
        ) : (
          <div className="mt-2 h-7 flex items-center">
            <p className="text-3xl text-gray-800 leading-none">{d.lastValue ?? '-'}<span className="text-sm text-gray-400 ml-1">{d.unit}</span></p>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            {field?.zoneCode && (
              <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-semibold rounded-full border border-green-200">
                {field.zoneCode}
              </span>
            )}
            <span className="text-xs text-gray-400">{field?.name}</span>
          </div>
          {lastUpdate && (
            <span className="flex items-center gap-1 text-xs text-green-500">
              <Activity className="w-3 h-3" /> Live
            </span>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) return <div>Đang tải dữ liệu thiết bị...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Thiết bị IoT</h1>
          <p>Quản lý và giám sát thiết bị thời gian thực</p>
        </div>
        <div className="flex items-center gap-3">
          {/* IoT Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium ${wsConnected ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <span className="relative inline-flex">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              {wsConnected && <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-60" />}
            </span>
            {wsConnected ? <><Wifi className="w-3.5 h-3.5" /> IoT Server: Kết nối</> : <><WifiOff className="w-3.5 h-3.5" /> IoT Server: Mất kết nối</>}
          </div>
          {canManageDevices && (
            <button onClick={() => { setShowAddModal(true); setAddError(''); }} className="btn-primary">
              <Plus className="w-4 h-4" /> Thêm thiết bị
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <CustomSelect
          value={filterField}
          onChange={setFilterField}
          options={[
            { value: 'all', label: 'Tất cả cánh đồng' },
            ...fields.map(f => ({ value: f.id, label: f.zoneCode ? `${f.zoneCode} - ${f.name}` : f.name })),
          ]}
          style={{ minWidth: '200px', width: 'auto' }}
        />
        <CustomSelect
          value={filterType}
          onChange={setFilterType}
          options={[
            { value: 'all', label: 'Tất cả loại' },
            ...Object.entries(typeLabels).map(([k, v]) => ({ value: k, label: v })),
          ]}
          style={{ minWidth: '160px', width: 'auto' }}
        />
      </div>

      {/* Section Tabs */}
      <div className="tab-segment">
        <button onClick={() => setActiveSection('all')} className={`tab-btn ${activeSection === 'all' ? 'active' : ''}`}>
          <Layers className="w-4 h-4" /> Tất cả
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeSection === 'all' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{allCount}</span>
        </button>
        <button onClick={() => setActiveSection('sensors')} className={`tab-btn ${activeSection === 'sensors' ? 'active' : ''}`}>
          <Radio className="w-4 h-4" /> Cảm biến
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeSection === 'sensors' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>{sensorCount}</span>
        </button>
        <button onClick={() => setActiveSection('actuators')} className={`tab-btn ${activeSection === 'actuators' ? 'active' : ''}`}>
          <Power className="w-4 h-4" /> Thiết bị điều khiển
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeSection === 'actuators' ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-200 text-gray-500'}`}>{actuatorCount}</span>
        </button>
      </div>

      {/* Device Grid */}
      {activeSection === 'all' ? (
        <>
          {/* Sensors Section */}
          {sensorDevices.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Radio className="w-4 h-4 text-blue-500" />
                <h3 className="text-gray-700 text-sm font-semibold uppercase tracking-wider">Cảm biến ({sensorDevices.length})</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {sensorDevices.map(renderDeviceCard)}
              </div>
            </div>
          )}

          {/* Actuators Section */}
          {actuatorDevices.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 mt-2">
                <Power className="w-4 h-4 text-cyan-500" />
                <h3 className="text-gray-700 text-sm font-semibold uppercase tracking-wider">Thiết bị điều khiển ({actuatorDevices.length})</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {actuatorDevices.map(renderDeviceCard)}
              </div>
            </div>
          )}

          {filteredDevices.length === 0 && (
            <div className="farm-card-static empty-state">
              <Cpu className="w-14 h-14" />
              <p className="text-gray-500">Không có thiết bị nào</p>
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredDevices.map(renderDeviceCard)}
          {filteredDevices.length === 0 && (
            <div className="col-span-full farm-card-static empty-state">
              <Cpu className="w-14 h-14" />
              <p className="text-gray-500">Không có thiết bị nào</p>
            </div>
          )}
        </div>
      )}

      {/* Device Detail Modal */}
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
                {canManageDevices && (
                  <button onClick={() => { setDeleteTarget(selectedDevice.id); }} className="action-btn delete" title="Xóa thiết bị">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setSelectedDevice(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#f8faf8] rounded-xl p-4 text-center border border-green-50">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider">Trạng thái</p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  {statusDot(selectedDevice.status, true)}
                  <span className="text-sm text-gray-700">{selectedDevice.status === 'online' ? 'Online' : selectedDevice.status === 'offline' ? 'Offline' : 'Lỗi'}</span>
                </div>
              </div>
              <div className="bg-[#f8faf8] rounded-xl p-4 text-center border border-green-50">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider">Giá trị hiện tại</p>
                <p className="text-xl text-gray-800 mt-1">{selectedDevice.lastValue ?? '-'}{selectedDevice.unit}</p>
              </div>
              <div className="bg-[#f8faf8] rounded-xl p-4 text-center border border-green-50">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider">IoT Server</p>
                <p className={`text-sm mt-1 font-medium ${wsConnected ? 'text-green-600' : 'text-red-500'}`}>
                  {wsConnected ? '● Đã kết nối' : '○ Mất kết nối'}
                </p>
              </div>
            </div>

            {!ACTUATOR_TYPES.includes(selectedDevice.type) && (
              <div>
                <h3 className="text-gray-800 mb-3">Dữ liệu thời gian thực</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={selectedChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" domain={['auto', 'auto']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke={typeColors[selectedDevice.type]} strokeWidth={2} dot={false} name={selectedDevice.unit} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
              <p className="text-sm text-green-800"><strong>API Endpoint:</strong> GET /api/devices/{selectedDevice.id}/data</p>
              <p className="text-sm text-green-800 mt-1"><strong>WebSocket:</strong> ws://localhost:5000/ws?deviceId={selectedDevice.id}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Device Modal */}
      {canManageDevices && showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h2>Thêm thiết bị mới</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {addError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{addError}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Tên thiết bị *</label>
                <input value={addForm.name} onChange={e => { setAddForm(p => ({ ...p, name: e.target.value })); setAddError(''); }} className="form-input" placeholder="VD: Cảm biến nhiệt độ A1-05" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Loại thiết bị *</label>
                <CustomSelect
                  value={addForm.type}
                  onChange={v => setAddForm(p => ({ ...p, type: v as Device['type'] }))}
                  options={Object.entries(typeLabels).map(([k, v]) => ({ value: k, label: v }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Cánh đồng / Khu vực *</label>
                <CustomSelect
                  value={addForm.fieldId}
                  onChange={v => setAddForm(p => ({ ...p, fieldId: v }))}
                  options={fields.map(f => ({ value: f.id, label: f.zoneCode ? `${f.zoneCode} - ${f.name}` : f.name }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Trạng thái</label>
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
              <button onClick={() => setShowAddModal(false)} className="btn-ghost flex-1 justify-center">Hủy</button>
              <button onClick={handleAddDevice} className="btn-primary flex-1 justify-center">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {canManageDevices && (
        <ConfirmDialog
          open={!!deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          title="Xóa thiết bị"
          message="Bạn có chắc chắn muốn xóa thiết bị này? Hành động này không thể hoàn tác."
          confirmLabel="Xóa"
        />
      )}
    </div>
  );
}
