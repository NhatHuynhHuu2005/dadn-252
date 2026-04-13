import { Thermometer, Droplets, Sun, Cpu, AlertTriangle, MapPin, TrendingUp, TrendingDown, Activity, Filter, Leaf, Gauge, Info, Download, BarChart3, PieChart as PieChartIcon, Calendar, Clock, List } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { CustomSelect } from '../components/CustomSelect';
import { fieldApi, deviceApi, alertApi, actionLogApi, scheduleApi, type Field, type Device, type Alert, type ActionLog, type Schedule } from '../api/client';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];

export function AnalysisPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedField, setSelectedField] = useState<string>('all');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [fieldsData, devicesData, alertsData, logsData, schedulesData] = await Promise.all([
          fieldApi.getAll().catch(() => []),
          deviceApi.getAll().catch(() => []),
          alertApi.getAll().catch(() => []),
          actionLogApi.getAll().catch(() => []),
          scheduleApi.getAll().catch(() => [])
        ]);
        setFields(fieldsData);
        setDevices(devicesData);
        setAlerts(alertsData);
        setActionLogs(logsData);
        setSchedules(schedulesData);
      } catch (err) {
        console.error('AnalysisPage load error', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Filtered fields
  const filteredFields = useMemo(() => {
    return fields.filter(f => {
      if (selectedField !== 'all' && f.id !== selectedField) return false;
      if (selectedCrop !== 'all' && f.cropType !== selectedCrop) return false;
      return true;
    });
  }, [fields, selectedField, selectedCrop]);

  // Filtered devices
  const filteredDevices = useMemo(() => {
    const fieldIds = filteredFields.map(f => f.id);
    return devices.filter(d => fieldIds.includes(d.fieldId));
  }, [filteredFields, devices]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    const deviceIds = filteredDevices.map(d => d.id);
    return alerts.filter(a => deviceIds.includes(a.deviceId));
  }, [filteredDevices, alerts]);

  // ================= BIỂU ĐỒ TÀI SẢN =================
  const deviceStatusData = useMemo(() => {
    const online = filteredDevices.filter(d => d.status === 'online').length;
    const offline = filteredDevices.filter(d => d.status === 'offline').length;
    const error = filteredDevices.filter(d => d.status === 'error').length;
    return [
      { name: 'Online', value: online, color: '#22c55e' },
      { name: 'Offline', value: offline, color: '#6b7280' },
      { name: 'Error', value: error, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [filteredDevices]);

  const fieldStatusData = useMemo(() => {
    const active = filteredFields.filter(f => f.status === 'active').length;
    const inactive = filteredFields.filter(f => f.status === 'inactive').length;
    const harvesting = filteredFields.filter(f => f.status === 'harvesting').length;
    return [
      { name: 'Đang hoạt động', value: active, color: '#22c55e' },
      { name: 'Tạm dừng', value: inactive, color: '#6b7280' },
      { name: 'Thu hoạch', value: harvesting, color: '#f59e0b' },
    ].filter(d => d.value > 0);
  }, [filteredFields]);

  // ================= BIỂU ĐỒ VẬN HÀNH MỚI =================
  const alertTypeData = useMemo(() => {
    const counts = { critical: 0, warning: 0, info: 0 };
    filteredAlerts.forEach(a => {
      if (counts[a.type as keyof typeof counts] !== undefined) {
        counts[a.type as keyof typeof counts]++;
      }
    });
    return [
      { name: 'Nghiêm trọng', value: counts.critical, color: '#ef4444' },
      { name: 'Cảnh báo', value: counts.warning, color: '#f59e0b' },
      { name: 'Thông tin', value: counts.info, color: '#3b82f6' }
    ].filter(d => d.value > 0);
  }, [filteredAlerts]);

  const scheduleStatusData = useMemo(() => {
    const active = schedules.filter(s => s.isActive).length;
    const inactive = schedules.filter(s => !s.isActive).length;
    return [
      { name: 'Đang chạy', value: active, color: '#22c55e' },
      { name: 'Tạm dừng', value: inactive, color: '#9ca3af' }
    ].filter(d => d.value > 0);
  }, [schedules]);

  const actionLogData = useMemo(() => {
    const userCount = actionLogs.filter(l => l.category === 'user').length;
    const deviceCount = actionLogs.filter(l => l.category === 'device').length;
    return [
      { name: 'Thao tác tay', value: userCount, color: '#8b5cf6' },
      { name: 'Tự động', value: deviceCount, color: '#0ea5e9' }
    ].filter(d => d.value > 0);
  }, [actionLogs]);

  // Export report
  const exportReport = useCallback((format: 'csv' | 'json' | 'pdf') => {
    setShowExportMenu(false);
    const reportData = {
      generatedAt: new Date().toISOString(),
      filters: { field: selectedField, crop: selectedCrop, timeRange },
      statistics: {
        totalFields: filteredFields.length,
        totalDevices: filteredDevices.length,
        onlineDevices: filteredDevices.filter(d => d.status === 'online').length,
        totalAlerts: filteredAlerts.length,
        totalSchedules: schedules.length,
        totalActionLogs: actionLogs.length,
      }
    };

    let content: string;
    let mimeType: string;
    let extension: string;

    if (format === 'json') {
      content = JSON.stringify(reportData, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      const lines = [
        'BAO CAO PHAN TICH NONG TRAI THONG MINH',
        `Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`,
        '=== THONG KE CHUNG ===',
        `Tong canh dong: ${reportData.statistics.totalFields}`,
        `Tong thiet bi: ${reportData.statistics.totalDevices}`,
        `Thiết bị online: ${reportData.statistics.onlineDevices}`,
        `Tong canh bao: ${reportData.statistics.totalAlerts}`,
        `Tong lich hen: ${reportData.statistics.totalSchedules}`,
        `Tong nhat ky hoat dong: ${reportData.statistics.totalActionLogs}`,
      ];
      content = lines.join('\n');
      mimeType = 'text/plain';
      extension = 'txt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartfarm-analysis-${new Date().toISOString().slice(0, 10)}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedField, selectedCrop, timeRange, filteredFields, filteredDevices, filteredAlerts, schedules, actionLogs]);

  const cropTypes = useMemo(() => [...new Set(fields.map(f => f.cropType))], [fields]);

  const statCards = useMemo(() => [
    { label: 'Cánh đồng', value: filteredFields.length, icon: MapPin, color: '#3b82f6' },
    { label: 'Thiết bị', value: filteredDevices.length, icon: Cpu, color: '#22c55e' },
    { label: 'Cảnh báo', value: filteredAlerts.length, icon: AlertTriangle, color: '#ef4444' },
    { label: 'Lịch tự động', value: schedules.filter(s=>s.isActive).length, icon: Clock, color: '#f59e0b' },
  ], [filteredFields, filteredDevices, filteredAlerts, schedules]);

  if (loading) return <div className="text-center py-16">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-center py-16 text-red-600">Lỗi: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Phân tích & Báo cáo</h1>
            <p className="text-gray-600 text-sm">Tổng hợp thống kê và phân tích chi tiết hệ thống</p>
          </div>
          <div className="relative">
            <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium">
              <Download className="w-4 h-4" /> Xuất báo cáo
            </button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border z-20 py-1">
                  <button onClick={() => exportReport('json')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Xuất file JSON</button>
                  <button onClick={() => exportReport('pdf')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Xuất file Text</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <CustomSelect value={selectedField} onChange={setSelectedField} options={[{ value: 'all', label: 'Tất cả cánh đồng' }, ...fields.map(f => ({ value: f.id, label: f.name }))]} />
          <CustomSelect value={selectedCrop} onChange={setSelectedCrop} options={[{ value: 'all', label: 'Tất cả giống cây' }, ...cropTypes.map(c => ({ value: c, label: c }))]} />
        </div>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: stat.color + '15' }}>
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BIỂU ĐỒ VẬN HÀNH & HỆ THỐNG */}
      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-2">Phân tích Vận hành</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Biểu đồ Cảnh báo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> Mức độ Cảnh báo
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={alertTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                {alertTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ Lịch hẹn */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-500" /> Trạng thái Lịch tự động
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={scheduleStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                {scheduleStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ Nhật ký hoạt động */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" /> Tỷ lệ Tự động hóa
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={actionLogData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={90} tick={{fontSize: 12}} />
              <Tooltip cursor={{fill: 'transparent'}}/>
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {actionLogData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* BIỂU ĐỒ TÀI SẢN VẬT LÝ */}
      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-2">Phân tích Tài sản</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Device Status */}
        {deviceStatusData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-blue-600" /> Trạng thái Thiết bị
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={deviceStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  {deviceStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Field Status */}
        {fieldStatusData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" /> Tình trạng Cánh đồng
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={fieldStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {fieldStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </div>
  );
}

