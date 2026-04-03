import { Thermometer, Droplets, Sun, Cpu, AlertTriangle, MapPin, TrendingUp, TrendingDown, Activity, Filter, Leaf, Gauge, Info, Loader } from 'lucide-react';
import { deviceApi, fieldApi, alertApi, actionLogApi, sensorApi, type Device, type Field, type Alert, type ActionLog } from '../api/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useMemo, useState, useEffect } from 'react';

// Crop-specific recommended metrics
const cropRecommendations: Record<string, {
  label: string;
  color: string;
  icon: typeof Leaf;
  metrics: { name: string; ideal: string; optimal: number; unit: string; importance: 'high' | 'medium' | 'low' }[];
  tips: string[];
}> = {
  'Lua': {
    label: 'Lua (Rice)',
    color: '#22c55e',
    icon: Leaf,
    metrics: [
      { name: 'Nhiet do', ideal: '25-32°C', optimal: 28, unit: '°C', importance: 'high' },
      { name: 'Do am khong khi', ideal: '70-85%', optimal: 80, unit: '%', importance: 'high' },
      { name: 'Do am dat', ideal: '60-80%', optimal: 75, unit: '%', importance: 'high' },
      { name: 'pH dat', ideal: '5.5-7.0', optimal: 6.2, unit: 'pH', importance: 'medium' },
      { name: 'Anh sang', ideal: '800-1200 lux', optimal: 1000, unit: 'lux', importance: 'medium' },
      { name: 'Muc nuoc', ideal: '3-10 cm', optimal: 5, unit: 'cm', importance: 'high' },
    ],
    tips: [
      'Lua can ngap nuoc trong giai doan sinh truong, giu muc nuoc 3-10cm',
      'Nhiet do ly tuong 25-32°C, toi uu nhat la 28°C',
      'Giam luong nuoc truoc thu hoach 7-10 ngay de hat chin deu',
    ],
  },
  'Rau xanh': {
    label: 'Rau xanh (Vegetables)',
    color: '#10b981',
    icon: Leaf,
    metrics: [
      { name: 'Nhiet do', ideal: '18-28°C', optimal: 22, unit: '°C', importance: 'high' },
      { name: 'Do am khong khi', ideal: '60-75%', optimal: 65, unit: '%', importance: 'medium' },
      { name: 'Do am dat', ideal: '40-65%', optimal: 55, unit: '%', importance: 'high' },
      { name: 'pH dat', ideal: '6.0-7.0', optimal: 6.5, unit: 'pH', importance: 'high' },
      { name: 'Anh sang', ideal: '600-1000 lux', optimal: 800, unit: 'lux', importance: 'medium' },
      { name: 'EC (do dan dien)', ideal: '1.5-3.0', optimal: 2.2, unit: 'mS/cm', importance: 'medium' },
    ],
    tips: [
      'Rau xanh can tuoi deu, tranh de dat qua kho hoac ngap nuoc',
      'pH dat 6.5 la toi uu nhat cho hap thu dinh duong',
      'Che bong nhe khi nhiet do vuot 35°C de tranh chay la',
    ],
  },
  'Ca chua': {
    label: 'Ca chua (Tomato)',
    color: '#ef4444',
    icon: Leaf,
    metrics: [
      { name: 'Nhiet do', ideal: '20-30°C', optimal: 25, unit: '°C', importance: 'high' },
      { name: 'Do am khong khi', ideal: '50-70%', optimal: 60, unit: '%', importance: 'high' },
      { name: 'Do am dat', ideal: '45-65%', optimal: 55, unit: '%', importance: 'high' },
      { name: 'pH dat', ideal: '6.0-6.8', optimal: 6.3, unit: 'pH', importance: 'high' },
      { name: 'Anh sang', ideal: '1000-1500 lux', optimal: 1200, unit: 'lux', importance: 'high' },
      { name: 'CO2', ideal: '800-1200', optimal: 1000, unit: 'ppm', importance: 'low' },
    ],
    tips: [
      'Ca chua can nhieu anh sang, toi thieu 6-8h/ngay',
      'Do am khong khi qua cao (>80%) gay nam benh, can thong gio tot',
      'Tuoi goc, tranh tuoi len la de giam nguy co benh',
    ],
  },
};

const getIcon = (type: string) => {
  switch (type) {
    case 'temperature': return Thermometer;
    case 'humidity': case 'soil_moisture': return Droplets;
    case 'light': return Sun;
    case 'ph': return Gauge;
    default: return Cpu;
  }
};

const getColor = (type: string) => {
  switch (type) {
    case 'temperature': return '#ef4444';
    case 'humidity': return '#3b82f6';
    case 'soil_moisture': return '#8b5cf6';
    case 'light': return '#f59e0b';
    case 'ph': return '#10b981';
    default: return '#6b7280';
  }
};

export function DashboardPage() {
  // Data states
  const [fields, setFields] = useState<Field[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [sensorHistories, setSensorHistories] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use 'all' as default (no filtering)
  const selectedField = 'all';
  const selectedCrop = 'all';

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [fieldsData, devicesData, alertsData, logsData] = await Promise.all([
          fieldApi.getAll(),
          deviceApi.getAll(),
          alertApi.getAll(),
          actionLogApi.getAll(),
        ]);

        setFields(fieldsData);
        setDevices(devicesData);
        setAlerts(alertsData);
        setActionLogs(logsData);

        // Fetch sensor histories for all devices
        const deviceIds = devicesData.map((d) => d.id);
        if (deviceIds.length > 0) {
          const histories = await sensorApi.getBatchHistory(deviceIds, 100);
          setSensorHistories(histories);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtered fields
  const filteredFields = useMemo(() => {
    return fields.filter((f) => {
      if (selectedField !== 'all' && f.id !== selectedField) return false;
      if (selectedCrop !== 'all' && f.cropType !== selectedCrop) return false;
      return true;
    });
  }, [fields, selectedField, selectedCrop]);

  // Filtered devices (by filtered fields)
  const filteredDevices = useMemo(() => {
    const fieldIds = filteredFields.map((f) => f.id);
    return devices.filter((d) => fieldIds.includes(d.fieldId));
  }, [filteredFields, devices]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    const deviceIds = filteredDevices.map((d) => d.id);
    return alerts.filter((a) => deviceIds.includes(a.deviceId));
  }, [filteredDevices, alerts]);

  // Stats based on filter
  const stats = useMemo(() => [
    { label: 'Canh dong', value: filteredFields.length, icon: MapPin, iconColor: '#3b82f6', bgColor: 'bg-blue-50' },
    { label: 'Thiet bi', value: filteredDevices.length, icon: Cpu, iconColor: '#22c55e', bgColor: 'bg-green-50' },
    { label: 'Online', value: filteredDevices.filter(d => d.status === 'online').length, icon: Activity, iconColor: '#10b981', bgColor: 'bg-emerald-50' },
    { label: 'Canh bao', value: filteredAlerts.filter(a => !a.isRead).length, icon: AlertTriangle, iconColor: '#ef4444', bgColor: 'bg-red-50' },
  ], [filteredFields, filteredDevices, filteredAlerts]);

  // Sensor cards from filtered devices
  const sensorCards = useMemo(() =>
    filteredDevices.filter(d => ['temperature', 'humidity', 'soil_moisture', 'light', 'ph'].includes(d.type) && d.status === 'online'),
    [filteredDevices]
  );

  // Chart data from first temperature & humidity sensor of filtered
  const tempDevice = filteredDevices.find(d => d.type === 'temperature' && d.status === 'online');
  const humDevice = filteredDevices.find(d => d.type === 'humidity' && d.status === 'online');
  const soilDevice = filteredDevices.find(d => d.type === 'soil_moisture' && d.status === 'online');

  const tempData = useMemo(() => {
    if (!tempDevice || !sensorHistories[tempDevice.id]) return [];
    return sensorHistories[tempDevice.id]
      .slice(-48) // Last 48 readings (~2 hours if 2.5 min intervals)
      .filter((_: any, i: number) => i % 4 === 0)
      .map((l: any) => ({
        time: new Date(l.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        value: l.value
      }));
  }, [tempDevice?.id, sensorHistories]);

  const humidityData = useMemo(() => {
    if (!humDevice || !sensorHistories[humDevice.id]) return [];
    return sensorHistories[humDevice.id]
      .slice(-48)
      .filter((_: any, i: number) => i % 4 === 0)
      .map((l: any) => ({
        time: new Date(l.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        value: l.value
      }));
  }, [humDevice?.id, sensorHistories]);

  const soilData = useMemo(() => {
    if (!soilDevice || !sensorHistories[soilDevice.id]) return [];
    return sensorHistories[soilDevice.id]
      .slice(-48)
      .filter((_: any, i: number) => i % 4 === 0)
      .map((l: any) => ({
        time: new Date(l.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        value: l.value
      }));
  }, [soilDevice?.id, sensorHistories]);

  // Current crop recommendation
  const currentCropType = selectedCrop !== 'all'
    ? selectedCrop
    : selectedField !== 'all'
      ? fields.find(f => f.id === selectedField)?.cropType
      : null;

  const recommendation = currentCropType ? cropRecommendations[currentCropType] : null;

  // Radar data for crop health score
  const radarData = useMemo(() => {
    if (!recommendation) return [];
    const sensorMap: Record<string, number | undefined> = {};
    sensorCards.forEach(d => {
      if (d.type === 'temperature') sensorMap['Nhiet do'] = d.lastValue;
      if (d.type === 'humidity') sensorMap['Do am khong khi'] = d.lastValue;
      if (d.type === 'soil_moisture') sensorMap['Do am dat'] = d.lastValue;
      if (d.type === 'light') sensorMap['Anh sang'] = d.lastValue;
      if (d.type === 'ph') sensorMap['pH dat'] = d.lastValue;
    });

    return recommendation.metrics.slice(0, 5).map(m => {
      const actual = sensorMap[m.name];
      // No sensor data → score 0
      if (actual === undefined || actual === null) {
        return { metric: m.name, score: 0, fullMark: 100 };
      }
      const idealRange = m.ideal.match(/[\d.]+/g)?.map(Number) || [0, 100];
      const min = idealRange[0];
      const max = idealRange[idealRange.length - 1];
      const optimal = m.optimal;
      // Gaussian scoring: 100 at optimal, drops off based on distance
      // sigma = half the ideal range width, so edges of ideal range ≈ 60-70 score
      const sigma = (max - min) / 2;
      const distance = actual - optimal;
      const score = 100 * Math.exp(-(distance * distance) / (2 * sigma * sigma));
      return { metric: m.name, score: Math.round(score), fullMark: 100 };
    });
  }, [recommendation, sensorCards]);

  // Evaluate sensor value against ideal range
  const evaluateValue = (value: number | undefined, ideal: string): { status: 'good' | 'warning' | 'danger'; label: string } => {
    if (value === undefined) return { status: 'warning', label: 'Khong co du lieu' };
    const nums = ideal.match(/[\d.]+/g)?.map(Number) || [];
    if (nums.length < 2) return { status: 'good', label: 'Binh thuong' };
    const [min, max] = [nums[0], nums[nums.length - 1]];
    if (value >= min && value <= max) return { status: 'good', label: 'Ly tuong' };
    const margin = (max - min) * 0.2;
    if (value >= min - margin && value <= max + margin) return { status: 'warning', label: 'Can theo doi' };
    return { status: 'danger', label: 'Ngoai nguong!' };
  };

  return (
    <div className="space-y-6">
      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-green-500" />
          <span className="ml-3 text-gray-600">Dang tai du lieu...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Loi tai du lieu: {error}
        </div>
      )}

      {/* Main content - only show when not loading */}
      {!isLoading && !error && (
        <>
          {/* Hero banner with background */}
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1665756868729-a39725b62c47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBncmVlbiUyMGZhcm0lMjBmaWVsZCUyMGRyb25lJTIwdmlld3xlbnwxfHx8fDE3NzQ4NjYxNTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Farm background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a3a1a]/85 via-[#1a3a1a]/60 to-transparent" />
        </div>
        <div className="relative px-6 lg:px-8 py-7 lg:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-white text-xl sm:text-2xl lg:text-3xl mb-1">Dashboard</h1>
            <p className="text-white/70 text-sm">Tong quan he thong nong trai thong minh</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl text-gray-800 mt-1">{s.value}</p>
              </div>
              <div className={`w-12 h-12 ${s.bgColor} rounded-xl flex items-center justify-center`}>
                <s.icon className="w-6 h-6" style={{ color: s.iconColor }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Crop recommendation panel */}
      {recommendation && (
        <div className="farm-card-static overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3" style={{ backgroundColor: `${recommendation.color}10` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${recommendation.color}20` }}>
              <Leaf className="w-5 h-5" style={{ color: recommendation.color }} />
            </div>
            <div>
              <h3 className="text-gray-800">De xuat chi so cho {recommendation.label}</h3>
              <p className="text-xs text-gray-500">Cac thong so quan trong can giam sat cho loai cay nay</p>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Metrics table */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendation.metrics.map(m => {
                    // Find matching sensor
                    const matchDevice = sensorCards.find(d => {
                      if (m.name === 'Nhiet do' && d.type === 'temperature') return true;
                      if (m.name === 'Do am khong khi' && d.type === 'humidity') return true;
                      if (m.name === 'Do am dat' && d.type === 'soil_moisture') return true;
                      if (m.name === 'Anh sang' && d.type === 'light') return true;
                      if (m.name === 'pH dat' && d.type === 'ph') return true;
                      return false;
                    });
                    const eval_ = evaluateValue(matchDevice?.lastValue, m.ideal);
                    const statusColors = { good: 'bg-green-50 border-green-200', warning: 'bg-yellow-50 border-yellow-200', danger: 'bg-red-50 border-red-200' };
                    const statusTextColors = { good: 'text-green-600', warning: 'text-yellow-600', danger: 'text-red-600' };
                    const importanceBadge = { high: 'bg-red-100 text-red-600', medium: 'bg-yellow-100 text-yellow-600', low: 'bg-gray-100 text-gray-500' };
                    const importanceLabel = { high: 'Quan trong', medium: 'Trung binh', low: 'Tham khao' };

                    return (
                      <div key={m.name} className={`p-4 rounded-xl border ${matchDevice ? statusColors[eval_.status] : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-800">{m.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${importanceBadge[m.importance]}`}>
                            {importanceLabel[m.importance]}
                          </span>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-xs text-gray-500">Ly tuong: {m.ideal}</p>
                            {matchDevice ? (
                              <p className="text-lg text-gray-800 mt-1">
                                {matchDevice.lastValue} <span className="text-xs text-gray-400">{m.unit}</span>
                              </p>
                            ) : (
                              <p className="text-xs text-gray-400 mt-1 italic">Chua co cam bien</p>
                            )}
                          </div>
                          {matchDevice && (
                            <div className="flex items-center gap-1">
                              {eval_.status === 'good' ? <TrendingUp className="w-3.5 h-3.5 text-green-500" /> :
                               eval_.status === 'warning' ? <TrendingDown className="w-3.5 h-3.5 text-yellow-500" /> :
                               <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                              <span className={`text-xs ${statusTextColors[eval_.status]}`}>{eval_.label}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Radar chart + tips */}
              <div className="space-y-4">
                {radarData.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-700 mb-2 text-center">Diem suc khoe cay trong</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: '#6b7280' }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                        <Radar name="Score" dataKey="score" stroke={recommendation.color} fill={recommendation.color} fillOpacity={0.3} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    <p className="text-sm text-blue-800">Loi khuyen canh tac</p>
                  </div>
                  <ul className="space-y-2">
                    {recommendation.tips.map((tip, i) => (
                      <li key={i} className="text-xs text-blue-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sensor live cards */}
      {sensorCards.length > 0 && (
        <div>
          <h3 className="text-gray-800 mb-3">Cam bien thoi gian thuc</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {sensorCards.slice(0, 8).map(d => {
              const Icon = getIcon(d.type);
              const color = getColor(d.type);
              const field = fields.find(f => f.id === d.fieldId);

              // Evaluate against crop recommendation if available
              const cropType = field?.cropType;
              const rec = cropType ? cropRecommendations[cropType] : null;
              let evalResult: { status: string; label: string } | null = null;
              if (rec) {
                const metricMap: Record<string, string> = {
                  temperature: 'Nhiet do', humidity: 'Do am khong khi',
                  soil_moisture: 'Do am dat', light: 'Anh sang', ph: 'pH dat'
                };
                const metricName = metricMap[d.type];
                const metric = rec.metrics.find(m => m.name === metricName);
                if (metric) evalResult = evaluateValue(d.lastValue, metric.ideal);
              }

              return (
                <div key={d.id} className="stat-card">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-5 h-5" style={{ color }} />
                    <span className="text-xs text-gray-500 truncate">{d.name}</span>
                  </div>
                  <p className="text-3xl text-gray-800">{d.lastValue}<span className="text-sm text-gray-400 ml-1">{d.unit}</span></p>
                  <div className="flex items-center justify-between mt-2">
                    {evalResult ? (
                      <div className="flex items-center gap-1">
                        {evalResult.status === 'good' ? <TrendingUp className="w-3 h-3 text-green-500" /> :
                         evalResult.status === 'warning' ? <TrendingDown className="w-3 h-3 text-yellow-500" /> :
                         <AlertTriangle className="w-3 h-3 text-red-500" />}
                        <span className={`text-xs ${evalResult.status === 'good' ? 'text-green-600' : evalResult.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                          {evalResult.label}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">Binh thuong</span>
                      </div>
                    )}
                    <span className="text-[10px] text-gray-400">{field?.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tempData.length > 0 && (
          <div className="farm-card-static p-5">
            <div className="flex items-center gap-2 mb-4">
              <Thermometer className="w-5 h-5 text-red-500" />
              <h3 className="text-gray-800">Nhiet do</h3>
              <span className="text-xs text-gray-400 ml-auto">{tempDevice?.name}</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={tempData}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" domain={['auto', 'auto']} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#ef4444" fill="url(#tempGrad)" strokeWidth={2} name="°C" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {humidityData.length > 0 && (
          <div className="farm-card-static p-5">
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="w-5 h-5 text-blue-500" />
              <h3 className="text-gray-800">Do am khong khi</h3>
              <span className="text-xs text-gray-400 ml-auto">{humDevice?.name}</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={humidityData}>
                <defs>
                  <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" domain={['auto', 'auto']} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#humGrad)" strokeWidth={2} name="%" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {soilData.length > 0 && (
          <div className="farm-card-static p-5">
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="w-5 h-5 text-purple-500" />
              <h3 className="text-gray-800">Do am dat</h3>
              <span className="text-xs text-gray-400 ml-auto">{soilDevice?.name}</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={soilData}>
                <defs>
                  <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" domain={['auto', 'auto']} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="url(#soilGrad)" strokeWidth={2} name="%" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {tempData.length === 0 && humidityData.length === 0 && soilData.length === 0 && (
          <div className="col-span-full farm-card-static empty-state">
            <Cpu className="w-14 h-14" />
            <p className="text-gray-500">Khong co du lieu cam bien cho bo loc hien tai</p>
          </div>
        )}
      </div>

      {/* Recent alerts & activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="farm-card-static p-5">
          <h3 className="text-gray-800 mb-4">Canh bao gan day</h3>
          <div className="space-y-3">
            {(filteredAlerts.length > 0 ? filteredAlerts : alerts).slice(0, 4).map(a => (
              <div key={a.id} className={`flex items-start gap-3 p-3 rounded-lg ${a.type === 'critical' ? 'bg-red-50' : a.type === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'}`}>
                <AlertTriangle className={`w-5 h-5 mt-0.5 ${a.type === 'critical' ? 'text-red-500' : a.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{a.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(a.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                {!a.isRead && <span className="w-2 h-2 bg-red-500 rounded-full mt-2" />}
              </div>
            ))}
            {filteredAlerts.length === 0 && selectedField !== 'all' && (
              <p className="text-sm text-gray-400 text-center py-4">Khong co canh bao cho canh dong nay</p>
            )}
          </div>
        </div>

        <div className="farm-card-static p-5">
          <h3 className="text-gray-800 mb-4">Nhat ky hoat dong</h3>
          <div className="space-y-3">
            {actionLogs.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{log.action}: <span className="text-gray-600">{log.target}</span></p>
                  <p className="text-xs text-gray-500">{log.details}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(log.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}