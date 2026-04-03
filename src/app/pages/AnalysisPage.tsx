import { Thermometer, Droplets, Sun, Cpu, AlertTriangle, MapPin, TrendingUp, TrendingDown, Activity, Filter, Leaf, Gauge, Info, Download, BarChart3, PieChart as PieChartIcon, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { CustomSelect } from '../components/CustomSelect';
import { fieldApi, deviceApi, alertApi, actionLogApi, type Field, type Device, type Alert, type ActionLog } from '../api/client';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];

export function AnalysisPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
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
      } catch (err) {
        console.error('AnalysisPage load error', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Get unique crop types
  const cropTypes = useMemo(() => [...new Set(fields.map(f => f.cropType))], []);

  // Filtered fields
  const filteredFields = useMemo(() => {
    return fields.filter(f => {
      if (selectedField !== 'all' && f.id !== selectedField) return false;
      if (selectedCrop !== 'all' && f.cropType !== selectedCrop) return false;
      return true;
    });
  }, [selectedField, selectedCrop]);

  // Filtered devices
  const filteredDevices = useMemo(() => {
    const fieldIds = filteredFields.map(f => f.id);
    return devices.filter(d => fieldIds.includes(d.fieldId));
  }, [filteredFields]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    const deviceIds = filteredDevices.map(d => d.id);
    return alerts.filter(a => deviceIds.includes(a.deviceId));
  }, [filteredDevices]);

  // Device status distribution
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

  // Crop type distribution
  const cropDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredFields.forEach(f => {
      counts[f.cropType] = (counts[f.cropType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value], i) => ({
      name,
      value,
      color: COLORS[i % COLORS.length]
    }));
  }, [filteredFields]);

  // Field status distribution
  const fieldStatusData = useMemo(() => {
    const active = filteredFields.filter(f => f.status === 'active').length;
    const inactive = filteredFields.filter(f => f.status === 'inactive').length;
    const harvesting = filteredFields.filter(f => f.status === 'harvesting').length;
    return [
      { name: 'Dang hoat dong', value: active, color: '#22c55e' },
      { name: 'Khong hoat dong', value: inactive, color: '#6b7280' },
      { name: 'Thu hoach', value: harvesting, color: '#f59e0b' },
    ].filter(d => d.value > 0);
  }, [filteredFields]);

  // Alert timeline
  const alertTimeline = useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
      days[key] = 0;
    }
    filteredAlerts.forEach(a => {
      const date = new Date(a.createdAt);
      const key = date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
      if (key in days) days[key]++;
    });
    return Object.entries(days).map(([date, count]) => ({ date, count }));
  }, [filteredAlerts]);

  // Export report
  const exportReport = useCallback((format: 'csv' | 'json' | 'pdf') => {
    setShowExportMenu(false);
    const reportData = {
      generatedAt: new Date().toISOString(),
      filters: { field: selectedField, crop: selectedCrop, timeRange },
      fields: filteredFields.map(f => ({ name: f.name, location: f.location, area: f.area, cropType: f.cropType, status: f.status })),
      devices: filteredDevices.map(d => ({ name: d.name, type: d.type, status: d.status, lastValue: d.lastValue, unit: d.unit })),
      alerts: filteredAlerts.map(a => ({ message: a.message, type: a.type, isRead: a.isRead, createdAt: a.createdAt })),
      statistics: {
        totalFields: filteredFields.length,
        totalDevices: filteredDevices.length,
        onlineDevices: filteredDevices.filter(d => d.status === 'online').length,
        totalAlerts: filteredAlerts.length,
        unreadAlerts: filteredAlerts.filter(a => !a.isRead).length,
      }
    };

    let content: string;
    let mimeType: string;
    let extension: string;

    if (format === 'csv') {
      const rows = [['Ten thiet bi', 'Loai', 'Trang thai', 'Gia tri', 'Don vi']];
      reportData.devices.forEach(d => rows.push([d.name, d.type, d.status, String(d.lastValue ?? ''), d.unit ?? '']));
      content = rows.map(r => r.join(',')).join('\n');
      mimeType = 'text/csv';
      extension = 'csv';
    } else if (format === 'json') {
      content = JSON.stringify(reportData, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      const lines = [
        'BAO CAO PHAN TICH NONG TRAI THONG MINH',
        `Ngay: ${new Date().toLocaleDateString('vi-VN')}`,
        `Ky thuat: ${timeRange === 'day' ? 'Hom nay' : timeRange === 'week' ? 'Tuan nay' : 'Thang nay'}`,
        '',
        '=== THONG KE ===',
        `Tong canh dong: ${reportData.statistics.totalFields}`,
        `Tong thiet bi: ${reportData.statistics.totalDevices}`,
        `Thiet bi online: ${reportData.statistics.onlineDevices}`,
        `Tong canh bao: ${reportData.statistics.totalAlerts}`,
        `Canh bao chua doc: ${reportData.statistics.unreadAlerts}`,
        '',
        '--- CHI TIET THIET BI ---',
        ...reportData.devices.map(d => `${d.name} | ${d.type} | ${d.status} | ${d.lastValue ?? 'N/A'}${d.unit ?? ''}`),
        '',
        '--- DANH SACH CANH BAO ---',
        ...reportData.alerts.map(a => `[${a.type}] ${a.message} - ${new Date(a.createdAt).toLocaleString('vi-VN')}`),
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
  }, [selectedField, selectedCrop, timeRange, filteredFields, filteredDevices, filteredAlerts]);

  // Statistics cards
  const stats = useMemo(() => [
    { label: 'Canh dong', value: filteredFields.length, icon: MapPin, color: '#3b82f6' },
    { label: 'Thiet bi', value: filteredDevices.length, icon: Cpu, color: '#22c55e' },
    { label: 'Online', value: filteredDevices.filter(d => d.status === 'online').length, icon: Activity, color: '#10b981' },
    { label: 'Canh bao', value: filteredAlerts.filter(a => !a.isRead).length, icon: AlertTriangle, color: '#ef4444' },
  ], [filteredFields, filteredDevices, filteredAlerts]);

  if (loading) return <div className="text-center py-16">Dang tai du lieu...</div>;
  if (error) return <div className="text-center py-16 text-red-600">Loi: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Phan tich & Bao cao</h1>
            <p className="text-gray-600 text-sm">Tong hop thong ke va phan tich chi tiet he thong</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" /> Xuat bao cao
            </button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border z-20 py-1">
                  <button onClick={() => exportReport('csv')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">CSV (Excel)</button>
                  <button onClick={() => exportReport('json')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">JSON</button>
                  <button onClick={() => exportReport('pdf')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Text Report</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <CustomSelect
            value={selectedField}
            onChange={v => {
              setSelectedField(v);
              if (v !== 'all') {
                const field = fields.find(f => f.id === v);
                if (field) setSelectedCrop(field.cropType);
              }
            }}
            options={[
              { value: 'all', label: 'Tat ca canh dong' },
              ...fields.map(f => ({ value: f.id, label: f.name }))
            ]}
          />
          <CustomSelect
            value={selectedCrop}
            onChange={v => {
              setSelectedCrop(v);
              if (v !== 'all' && selectedField !== 'all') {
                const field = fields.find(f => f.id === selectedField);
                if (field && field.cropType !== v) setSelectedField('all');
              }
            }}
            options={[
              { value: 'all', label: 'Tat ca giong cay' },
              ...cropTypes.map(c => ({ value: c, label: c }))
            ]}
          />
          <CustomSelect
            value={timeRange}
            onChange={v => setTimeRange(v as 'day' | 'week' | 'month')}
            options={[
              { value: 'day', label: 'Hom nay' },
              { value: 'week', label: 'Tuan nay' },
              { value: 'month', label: 'Thang nay' }
            ]}
          />
          {(selectedField !== 'all' || selectedCrop !== 'all') && (
            <button
              onClick={() => { setSelectedField('all'); setSelectedCrop('all'); }}
              className="px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
            >
              Xoa bo loc
            </button>
          )}
        </div>
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Status */}
        {deviceStatusData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-blue-600" /> Trang thai thiet bi
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={deviceStatusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} (${value})`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {deviceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Field Status */}
        {fieldStatusData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" /> Trang thai canh dong
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={fieldStatusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} (${value})`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {fieldStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Crop Distribution */}
        {cropDistributionData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-600" /> Phan bo giong cay
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cropDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#22c55e">
                  {cropDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Alert Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" /> Canh bao theo thoi gian
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={alertTimeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts list */}
      {filteredAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Canh bao gan day ({filteredAlerts.length})</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredAlerts.slice(0, 10).map((alert, i) => (
              <div key={i} className={`p-3 rounded-lg border ${alert.type === 'critical' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`font-medium ${alert.type === 'critical' ? 'text-red-900' : 'text-yellow-900'}`}>{alert.message}</p>
                    <p className="text-xs text-gray-600 mt-1">{new Date(alert.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                  {!alert.isRead && (
                    <div className="ml-3 w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
