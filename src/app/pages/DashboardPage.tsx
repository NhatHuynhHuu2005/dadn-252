<<<<<<< HEAD
import { Thermometer, Droplets, Sun, Cpu, AlertTriangle, MapPin, TrendingUp, TrendingDown, Activity, Filter, Leaf, Gauge, Info, Loader } from 'lucide-react';
import { deviceApi, fieldApi, alertApi, actionLogApi, sensorApi, type Device, type Field, type Alert, type ActionLog } from '../api/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useMemo, useState, useEffect } from 'react';
=======
import { Thermometer, Droplets, Sun, Cpu, AlertTriangle, MapPin, TrendingUp, TrendingDown, Activity, Leaf, Gauge, Info, Loader, Wifi, WifiOff, Power, Fan, ToggleLeft, Download, BarChart3, PieChart as PieChartIcon, Calendar, Clock, Image as ImageIcon } from 'lucide-react';
import { deviceApi, fieldApi, alertApi, actionLogApi, sensorApi, scheduleApi, useWebSocketBroadcast, type Device, type Field, type Alert, type ActionLog, type Schedule } from '../api/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell, Legend } from 'recharts';
import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { CustomSelect } from '../components/CustomSelect';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { useRole } from '../hooks/useRole';
import { useAuth } from '../context/AuthContext';
>>>>>>> khanh

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
<<<<<<< HEAD
      { name: 'Nhiet do', ideal: '25-32°C', optimal: 28, unit: '°C', importance: 'high' },
      { name: 'Do am khong khi', ideal: '70-85%', optimal: 80, unit: '%', importance: 'high' },
      { name: 'Do am dat', ideal: '60-80%', optimal: 75, unit: '%', importance: 'high' },
      { name: 'pH dat', ideal: '5.5-7.0', optimal: 6.2, unit: 'pH', importance: 'medium' },
      { name: 'Anh sang', ideal: '800-1200 lux', optimal: 1000, unit: 'lux', importance: 'medium' },
=======
      { name: 'Nhiệt độ', ideal: '25-32°C', optimal: 28, unit: '°C', importance: 'high' },
      { name: 'Độ ẩm không khí', ideal: '70-85%', optimal: 80, unit: '%', importance: 'high' },
      { name: 'Độ ẩm đất', ideal: '60-80%', optimal: 75, unit: '%', importance: 'high' },
      { name: 'pH dat', ideal: '5.5-7.0', optimal: 6.2, unit: 'pH', importance: 'medium' },
      { name: 'Ánh sáng', ideal: '800-1200 lux', optimal: 1000, unit: 'lux', importance: 'medium' },
>>>>>>> khanh
      { name: 'Muc nuoc', ideal: '3-10 cm', optimal: 5, unit: 'cm', importance: 'high' },
    ],
    tips: [
      'Lua can ngap nuoc trong giai doan sinh truong, giu muc nuoc 3-10cm',
<<<<<<< HEAD
      'Nhiet do ly tuong 25-32°C, toi uu nhat la 28°C',
=======
      'Nhiệt độ ly tuong 25-32°C, toi uu nhat la 28°C',
>>>>>>> khanh
      'Giam luong nuoc truoc thu hoach 7-10 ngay de hat chin deu',
    ],
  },
  'Rau xanh': {
    label: 'Rau xanh (Vegetables)',
    color: '#10b981',
    icon: Leaf,
    metrics: [
<<<<<<< HEAD
      { name: 'Nhiet do', ideal: '18-28°C', optimal: 22, unit: '°C', importance: 'high' },
      { name: 'Do am khong khi', ideal: '60-75%', optimal: 65, unit: '%', importance: 'medium' },
      { name: 'Do am dat', ideal: '40-65%', optimal: 55, unit: '%', importance: 'high' },
      { name: 'pH dat', ideal: '6.0-7.0', optimal: 6.5, unit: 'pH', importance: 'high' },
      { name: 'Anh sang', ideal: '600-1000 lux', optimal: 800, unit: 'lux', importance: 'medium' },
=======
      { name: 'Nhiệt độ', ideal: '18-28°C', optimal: 22, unit: '°C', importance: 'high' },
      { name: 'Độ ẩm không khí', ideal: '60-75%', optimal: 65, unit: '%', importance: 'medium' },
      { name: 'Độ ẩm đất', ideal: '40-65%', optimal: 55, unit: '%', importance: 'high' },
      { name: 'pH dat', ideal: '6.0-7.0', optimal: 6.5, unit: 'pH', importance: 'high' },
      { name: 'Ánh sáng', ideal: '600-1000 lux', optimal: 800, unit: 'lux', importance: 'medium' },
>>>>>>> khanh
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
<<<<<<< HEAD
      { name: 'Nhiet do', ideal: '20-30°C', optimal: 25, unit: '°C', importance: 'high' },
      { name: 'Do am khong khi', ideal: '50-70%', optimal: 60, unit: '%', importance: 'high' },
      { name: 'Do am dat', ideal: '45-65%', optimal: 55, unit: '%', importance: 'high' },
      { name: 'pH dat', ideal: '6.0-6.8', optimal: 6.3, unit: 'pH', importance: 'high' },
      { name: 'Anh sang', ideal: '1000-1500 lux', optimal: 1200, unit: 'lux', importance: 'high' },
=======
      { name: 'Nhiệt độ', ideal: '20-30°C', optimal: 25, unit: '°C', importance: 'high' },
      { name: 'Độ ẩm không khí', ideal: '50-70%', optimal: 60, unit: '%', importance: 'high' },
      { name: 'Độ ẩm đất', ideal: '45-65%', optimal: 55, unit: '%', importance: 'high' },
      { name: 'pH dat', ideal: '6.0-6.8', optimal: 6.3, unit: 'pH', importance: 'high' },
      { name: 'Ánh sáng', ideal: '1000-1500 lux', optimal: 1200, unit: 'lux', importance: 'high' },
>>>>>>> khanh
      { name: 'CO2', ideal: '800-1200', optimal: 1000, unit: 'ppm', importance: 'low' },
    ],
    tips: [
      'Ca chua can nhieu anh sang, toi thieu 6-8h/ngay',
<<<<<<< HEAD
      'Do am khong khi qua cao (>80%) gay nam benh, can thong gio tot',
=======
      'Độ ẩm không khí qua cao (>80%) gay nam benh, can thong gio tot',
>>>>>>> khanh
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

<<<<<<< HEAD
  // Use 'all' as default (no filtering)
  const selectedField = 'all';
  const selectedCrop = 'all';
=======
  const { readings: wsReadings, isConnected: wsConnected } = useWebSocketBroadcast();

  // Live device state from WebSocket
  const [liveDevices, setLiveDevices] = useState<Record<string, Device>>({});
  useEffect(() => {
    if (!wsReadings || wsReadings.length === 0) return;
    const latest = wsReadings[wsReadings.length - 1];
    setLiveDevices(prev => {
      const dev = devices.find(d => d.id === latest.deviceId);
      if (!dev) return prev;
      return { ...prev, [latest.deviceId]: { ...dev, lastValue: latest.value, lastUpdate: latest.timestamp } };
    });
  }, [wsReadings, devices]);

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedField, setSelectedField] = useState<string>('all');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [downloadingChart, setDownloadingChart] = useState<string | null>(null);

  // Refs for chart download
  const chartRefs: Record<string, React.RefObject<HTMLDivElement | null>> = {
    alertChart: useRef<HTMLDivElement>(null),
    scheduleChart: useRef<HTMLDivElement>(null),
    actionChart: useRef<HTMLDivElement>(null),
    deviceStatusChart: useRef<HTMLDivElement>(null),
    fieldStatusChart: useRef<HTMLDivElement>(null),
  };

  const { user } = useAuth();
  const { canExportReports, isManager } = useRole();
>>>>>>> khanh

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
<<<<<<< HEAD
        const [fieldsData, devicesData, alertsData, logsData] = await Promise.all([
          fieldApi.getAll(),
          deviceApi.getAll(),
          alertApi.getAll(),
          actionLogApi.getAll(),
=======
        const filterUserId = isManager ? user?.id : undefined;

        const [fieldsData, devicesData, alertsData, logsData, schedulesData] = await Promise.all([
          fieldApi.getAll(filterUserId).catch(err => { console.error(err); return []; }),
          deviceApi.getAll().catch(err => { console.error(err); return []; }),
          alertApi.getAll().catch(err => {
            console.error('Lỗi lấy Alerts:', err);
            return []; // Trả về mảng rỗng nếu API lỗi để không sập trang
          }),
          actionLogApi.getAll().catch(err => { console.error(err); return []; }),
          scheduleApi.getAll().catch(err => { console.error(err); return []; }),
>>>>>>> khanh
        ]);

        setFields(fieldsData);
        setDevices(devicesData);
        setAlerts(alertsData);
        setActionLogs(logsData);
<<<<<<< HEAD
=======
        setSchedules(schedulesData);
>>>>>>> khanh

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
<<<<<<< HEAD
    { label: 'Canh dong', value: filteredFields.length, icon: MapPin, iconColor: '#3b82f6', bgColor: 'bg-blue-50' },
    { label: 'Thiet bi', value: filteredDevices.length, icon: Cpu, iconColor: '#22c55e', bgColor: 'bg-green-50' },
    { label: 'Online', value: filteredDevices.filter(d => d.status === 'online').length, icon: Activity, iconColor: '#10b981', bgColor: 'bg-emerald-50' },
    { label: 'Canh bao', value: filteredAlerts.filter(a => !a.isRead).length, icon: AlertTriangle, iconColor: '#ef4444', bgColor: 'bg-red-50' },
  ], [filteredFields, filteredDevices, filteredAlerts]);
=======
    { label: 'Cánh đồng', value: filteredFields.length, icon: MapPin, iconColor: '#3b82f6', bgColor: 'bg-blue-50' },
    { label: 'Thiết bị', value: filteredDevices.length, icon: Cpu, iconColor: '#22c55e', bgColor: 'bg-green-50' },
    { label: 'Lịch tự động', value: schedules.filter(s => s.isActive).length, icon: Clock, iconColor: '#f59e0b', bgColor: 'bg-amber-50' },
    { label: 'Cảnh báo', value: filteredAlerts.filter(a => !a.isRead).length, icon: AlertTriangle, iconColor: '#ef4444', bgColor: 'bg-red-50' },
  ], [filteredFields, filteredDevices, schedules, filteredAlerts]);

  // Chart data for analysis
  const deviceStatusData = useMemo(() => [
    { name: 'Online', value: filteredDevices.filter(d => d.status === 'online').length, color: '#22c55e' },
    { name: 'Offline', value: filteredDevices.filter(d => d.status === 'offline').length, color: '#6b7280' },
    { name: 'Error', value: filteredDevices.filter(d => d.status === 'error').length, color: '#ef4444' },
  ], [filteredDevices]);

  const fieldStatusData = useMemo(() => [
    { name: 'Đang hoạt động', value: filteredFields.filter(f => f.status === 'active').length, color: '#22c55e' },
    { name: 'Tạm dừng', value: filteredFields.filter(f => f.status === 'inactive').length, color: '#6b7280' },
    { name: 'Thu hoạch', value: filteredFields.filter(f => f.status === 'harvesting').length, color: '#f59e0b' },
  ], [filteredFields]);

  const alertTypeData = useMemo(() => {
    const counts = { critical: 0, warning: 0, info: 0 };
    filteredAlerts.forEach(a => { if (counts[a.type as keyof typeof counts] !== undefined) counts[a.type as keyof typeof counts]++; });
    return [
      { name: 'Nghiêm trọng', value: counts.critical, color: '#ef4444' },
      { name: 'Cảnh báo', value: counts.warning, color: '#f59e0b' },
      { name: 'Thông tin', value: counts.info, color: '#3b82f6' }
    ];
  }, [filteredAlerts]);

  const scheduleStatusData = useMemo(() => [
    { name: 'Đang chạy', value: schedules.filter(s => s.isActive).length, color: '#22c55e' },
    { name: 'Tạm dừng', value: schedules.filter(s => !s.isActive).length, color: '#9ca3af' }
  ], [schedules]);

  const actionLogData = useMemo(() => [
    { name: 'Thao tác tay', value: actionLogs.filter(l => l.category === 'user' || l.triggeredBy === 'manual').length, color: '#8b5cf6' },
    { name: 'Tự động', value: actionLogs.filter(l => l.category === 'device' || l.triggeredBy === 'schedule' || l.triggeredBy === 'threshold').length, color: '#0ea5e9' }
  ], [actionLogs]);

  const cropTypes = useMemo(() => [...new Set(fields.map(f => f.cropType))], [fields]);

  // ── XUẤT EXCEL ──────────────────────────────────────────────────────────────
  const exportExcel = useCallback(() => {
    setShowExportMenu(false);

    const wb = XLSX.utils.book_new();

    // Sheet 1: Tổng quan
    const overviewData = [
      ['BÁO CÁO PHÂN TÍCH NÔNG TRẠI THÔNG MINH'],
      [`Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`],
      [],
      ['Chỉ số', 'Giá trị'],
      ['Tổng cánh đồng', filteredFields.length],
      ['Tổng thiết bị', filteredDevices.length],
      ['Thiết bị online', filteredDevices.filter(d => d.status === 'online').length],
      ['Tổng cảnh báo', filteredAlerts.length],
      ['Cảnh báo chưa đọc', filteredAlerts.filter(a => !a.isRead).length],
      ['Lịch hẹn đang chạy', schedules.filter(s => s.isActive).length],
      ['Tổng nhật ký hoạt động', actionLogs.length],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(overviewData), 'Tổng quan');

    // Sheet 2: Danh sách cánh đồng
    const fieldRows = [
      ['ID', 'Tên', 'Khu vực', 'Vị trí', 'Diện tích (ha)', 'Loại cây', 'Trạng thái', 'Ngày tạo'],
      ...filteredFields.map(f => [f.id, f.name, f.zoneCode || '', f.location, f.area, f.cropType, f.status, new Date(f.createdAt).toLocaleDateString('vi-VN')])
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(fieldRows), 'Cánh đồng');

    // Sheet 3: Danh sách thiết bị
    const deviceRows = [
      ['ID', 'Tên', 'Loại', 'Trạng thái', 'Giá trị cuối', 'Đơn vị', 'Cánh đồng', 'Ngày tạo'],
      ...filteredDevices.map(d => {
        const field = fields.find(f => f.id === d.fieldId);
        return [d.id, d.name, d.type, d.status, d.lastValue ?? '', d.unit || '', field?.name || '', new Date(d.createdAt).toLocaleDateString('vi-VN')];
      })
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(deviceRows), 'Thiết bị');

    // Sheet 4: Cảnh báo
    const alertRows = [
      ['ID', 'Thiết bị', 'Loại', 'Nội dung', 'Đã đọc', 'Thời gian'],
      ...filteredAlerts.map(a => {
        const device = devices.find(d => d.id === a.deviceId);
        return [a.id, device?.name || a.deviceId, a.type, a.message, a.isRead ? 'Đã đọc' : 'Chưa đọc', new Date(a.createdAt).toLocaleString('vi-VN')];
      })
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(alertRows), 'Cảnh báo');

    // Sheet 5: Lịch hẹn
    const scheduleRows = [
      ['ID', 'Tên', 'Cánh đồng', 'Thiết bị', 'Hành động', 'Cron', 'Trạng thái', 'Ngày tạo'],
      ...schedules.map(s => {
        const field = fields.find(f => f.id === s.fieldId);
        const device = devices.find(d => d.id === s.deviceId);
        return [s.id, s.name, field?.name || '', device?.name || '', s.action, s.cronExpression, s.isActive ? 'Đang chạy' : 'Tạm dừng', new Date(s.createdAt).toLocaleDateString('vi-VN')];
      })
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(scheduleRows), 'Lịch hẹn');

    XLSX.writeFile(wb, `smartfarm-baocao-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [filteredFields, filteredDevices, filteredAlerts, schedules, actionLogs, fields, devices]);

  // ── TẢI BIỂU ĐỒ THÀNH ẢNH ──────────────────────────────────────────────────
  const downloadChart = async (chartKey: string, name: string) => {
    const ref = chartRefs[chartKey]?.current;
    if (!ref) return;

    setDownloadingChart(chartKey);
    try {
      const canvas = await html2canvas(ref, { backgroundColor: '#ffffff', scale: 2 });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `bieudo-${name}-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
    } catch (e) {
      console.error('Chart download error', e);
    } finally {
      setDownloadingChart(null);
    }
  };
>>>>>>> khanh

  // Sensor cards from filtered devices
  const sensorCards = useMemo(() =>
    filteredDevices.filter(d => ['temperature', 'humidity', 'soil_moisture', 'light', 'ph'].includes(d.type) && d.status === 'online'),
    [filteredDevices]
  );

<<<<<<< HEAD
  // Chart data from first temperature & humidity sensor of filtered
  const tempDevice = filteredDevices.find(d => d.type === 'temperature' && d.status === 'online');
  const humDevice = filteredDevices.find(d => d.type === 'humidity' && d.status === 'online');
  const soilDevice = filteredDevices.find(d => d.type === 'soil_moisture' && d.status === 'online');
=======
  // Chart data from first temperature & humidity sensor of filtered đoạn này....................................................
  const tempDevice = filteredDevices.find(d => d.type === 'temperature');
  const humDevice = filteredDevices.find(d => d.type === 'humidity');
  const soilDevice = filteredDevices.find(d => d.type === 'soil_moisture');
>>>>>>> khanh

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
<<<<<<< HEAD
      if (d.type === 'temperature') sensorMap['Nhiet do'] = d.lastValue;
      if (d.type === 'humidity') sensorMap['Do am khong khi'] = d.lastValue;
      if (d.type === 'soil_moisture') sensorMap['Do am dat'] = d.lastValue;
      if (d.type === 'light') sensorMap['Anh sang'] = d.lastValue;
=======
      if (d.type === 'temperature') sensorMap['Nhiệt độ'] = d.lastValue;
      if (d.type === 'humidity') sensorMap['Độ ẩm không khí'] = d.lastValue;
      if (d.type === 'soil_moisture') sensorMap['Độ ẩm đất'] = d.lastValue;
      if (d.type === 'light') sensorMap['Ánh sáng'] = d.lastValue;
>>>>>>> khanh
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
<<<<<<< HEAD
    if (value === undefined) return { status: 'warning', label: 'Khong co du lieu' };
=======
    if (value === undefined) return { status: 'warning', label: 'Không co du lieu' };
>>>>>>> khanh
    const nums = ideal.match(/[\d.]+/g)?.map(Number) || [];
    if (nums.length < 2) return { status: 'good', label: 'Binh thuong' };
    const [min, max] = [nums[0], nums[nums.length - 1]];
    if (value >= min && value <= max) return { status: 'good', label: 'Ly tuong' };
    const margin = (max - min) * 0.2;
    if (value >= min - margin && value <= max + margin) return { status: 'warning', label: 'Can theo doi' };
<<<<<<< HEAD
    return { status: 'danger', label: 'Ngoai nguong!' };
  };

=======
    return { status: 'danger', label: 'Ngoài ngưỡng!' };
  };

  const ChartCard = ({ title, icon: Icon, iconColor, chartKey, chartName, children }: {
    title: string; icon: any; iconColor: string; chartKey: string; chartName: string; children: React.ReactNode;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Icon className="w-5 h-5" style={{ color: iconColor }} /> {title}
        </h3>
        <button
          onClick={() => downloadChart(chartKey, chartName)}
          disabled={downloadingChart === chartKey}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          title="Tải biểu đồ thành ảnh PNG"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          {downloadingChart === chartKey ? 'Đang tải...' : 'Tải ảnh'}
        </button>
      </div>
      <div ref={chartRefs[chartKey] as any}>
        {children}
      </div>
    </div>
  );

>>>>>>> khanh
  return (
    <div className="space-y-6">
      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-green-500" />
<<<<<<< HEAD
          <span className="ml-3 text-gray-600">Dang tai du lieu...</span>
=======
          <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
>>>>>>> khanh
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
<<<<<<< HEAD
          Loi tai du lieu: {error}
=======
          Lỗi tải dữ liệu: {error}
>>>>>>> khanh
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
<<<<<<< HEAD
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
=======
            </div>
            <div className="relative px-6 lg:px-8 py-7 lg:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-white text-xl sm:text-2xl lg:text-3xl mb-1">Dashboard</h1>
                <p className="text-white/70 text-sm">Tổng quan hệ thống nông trại thông minh</p>
              </div>
              {canExportReports && (
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600/90 hover:bg-green-600 text-white rounded-xl backdrop-blur-sm transition-colors text-sm font-medium border border-white/20"
                  >
                    <Download className="w-4 h-4" /> Xuất báo cáo Excel
                  </button>
                  {showExportMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border z-20 py-1">
                        <button
                          onClick={exportExcel}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4 text-green-600" />
                          Xuất file Excel (.xlsx)
                        </button>
                        <div className="px-4 py-2 border-t border-gray-100">
                          <p className="text-[10px] text-gray-400">File Excel bao gồm 5 sheet: Tổng quan, Cánh đồng, Thiết bị, Cảnh báo, Lịch hẹn</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <CustomSelect value={selectedField} onChange={setSelectedField} options={[{ value: 'all', label: 'Tất cả cánh đồng' }, ...fields.map(f => ({ value: f.id, label: f.zoneCode ? `${f.zoneCode} - ${f.name}` : f.name }))]} />
            <CustomSelect value={selectedCrop} onChange={setSelectedCrop} options={[{ value: 'all', label: 'Tất cả giống cây' }, ...cropTypes.map(c => ({ value: c, label: c }))]} />
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
                          if (m.name === 'Nhiệt độ' && d.type === 'temperature') return true;
                          if (m.name === 'Độ ẩm không khí' && d.type === 'humidity') return true;
                          if (m.name === 'Độ ẩm đất' && d.type === 'soil_moisture') return true;
                          if (m.name === 'Ánh sáng' && d.type === 'light') return true;
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
                                  <p className="text-xs text-gray-400 mt-1 italic">Chua co cảm biến</p>
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
                        <p className="text-sm text-blue-800">Lời khuyên canh tác</p>
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
              <h3 className="text-gray-800 mb-3">Cam bien thời gian thực</h3>
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
                      temperature: 'Nhiệt độ', humidity: 'Độ ẩm không khí',
                      soil_moisture: 'Độ ẩm đất', light: 'Ánh sáng', ph: 'pH dat'
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
                  <h3 className="text-gray-800">Nhiệt độ</h3>
                  <span className="text-xs text-gray-400 ml-auto">{tempDevice?.name}</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={tempData}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
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
                  <h3 className="text-gray-800">Độ ẩm không khí</h3>
                  <span className="text-xs text-gray-400 ml-auto">{humDevice?.name}</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={humidityData}>
                    <defs>
                      <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
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
                  <h3 className="text-gray-800">Độ ẩm đất</h3>
                  <span className="text-xs text-gray-400 ml-auto">{soilDevice?.name}</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={soilData}>
                    <defs>
                      <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
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
                <p className="text-gray-500">Không có dữ liệu cảm biến cho bộ lọc hiện tại</p>
              </div>
            )}
          </div>

          {/* IoT Connection Status Panel */}
          <div className="farm-card-static p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-gray-800">Trạng thái kết nối IoT</h3>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium ${wsConnected ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                <span className="relative inline-flex">
                  <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  {wsConnected && <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-60" />}
                </span>
                {wsConnected ? <><Wifi className="w-3.5 h-3.5" /> Server: Đang kết nối</> : <><WifiOff className="w-3.5 h-3.5" /> Server: Mất kết nối</>}
              </div>
            </div>

            {/* Actuator Devices Status */}
            {(() => {
              const actuators = filteredDevices.filter(d => ['pump', 'valve', 'fan', 'control'].includes(d.type));
              if (actuators.length === 0) return (
                <p className="text-sm text-gray-400 text-center py-4">Không có thiết bị điều khiển nào</p>
              );
              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {actuators.map(d => {
                    const live = liveDevices[d.id] || d;
                    const isOn = live.lastValue === 1;
                    const isOnline = live.status === 'online';
                    const field = fields.find(f => f.id === d.fieldId);
                    const Icon = d.type === 'fan' ? Fan : d.type === 'valve' ? ToggleLeft : Power;
                    return (
                      <div key={d.id} className={`p-3 rounded-xl border text-center transition-all ${isOn && isOnline ? 'bg-green-50 border-green-200' : isOnline ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-100'}`}>
                        <div className="flex items-center justify-center mb-2 relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOn && isOnline ? 'bg-green-500' : isOnline ? 'bg-gray-300' : 'bg-red-300'}`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="absolute -top-0.5 -right-0.5 relative inline-flex">
                            <span className={`w-2.5 h-2.5 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-red-400'}`} />
                            {isOnline && isOn && <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-60" />}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 font-medium truncate">{d.name}</p>
                        {field?.zoneCode && <p className="text-[10px] text-green-600 font-semibold">{field.zoneCode}</p>}
                        <p className={`text-[10px] mt-1 font-medium ${isOnline ? (isOn ? 'text-green-600' : 'text-gray-500') : 'text-red-500'}`}>
                          {!isOnline ? 'Mất kết nối' : isOn ? 'Đang bật' : 'Đang tắt'}
                        </p>
>>>>>>> khanh
                      </div>
                    );
                  })}
                </div>
<<<<<<< HEAD
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
=======
              );
            })()}
          </div>

          {/* Recent alerts & activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="farm-card-static p-5">
              <h3 className="text-gray-800 mb-4">Cảnh báo gần đây</h3>
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
                  <p className="text-sm text-gray-400 text-center py-4">Không co canh bao cho canh dong nay</p>
                )}
              </div>
            </div>

            <div className="farm-card-static p-5">
              <h3 className="text-gray-800 mb-4">Nhật ký hoạt động</h3>
              <div className="space-y-3">
                {actionLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm text-gray-800">{log.action}: <span className="text-gray-600">{log.target}</span></p>
                        {log.triggeredBy === 'schedule' && <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-200">Lịch tự động</span>}
                        {log.triggeredBy === 'manual' && <span className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded-full border border-green-200">Thủ công</span>}
                        {log.status === 'fail' && <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-200">Thất bại</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{new Date(log.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Biểu đồ vận hành */}
          <h2 className="text-xl font-bold text-gray-900 mt-6">Phân tích Vận hành</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard title="Mức độ Cảnh báo" icon={AlertTriangle} iconColor="#ef4444" chartKey="alertChart" chartName="canh-bao">
              {alertTypeData.every(d => d.value === 0) ? (
                <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm bg-gray-50/50 rounded-xl">Chưa có dữ liệu cảnh báo</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={alertTypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value"
                      label={({ name, percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}>
                      {alertTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Trạng thái Lịch tự động" icon={Calendar} iconColor="#22c55e" chartKey="scheduleChart" chartName="lich-hen">
              {scheduleStatusData.every(d => d.value === 0) ? (
                <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm bg-gray-50/50 rounded-xl">Chưa có lịch tự động</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={scheduleStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value"
                      label={({ name, percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}>
                      {scheduleStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Tỷ lệ Tự động hóa" icon={Activity} iconColor="#8b5cf6" chartKey="actionChart" chartName="tu-dong-hoa">
              {actionLogData.every(d => d.value === 0) ? (
                <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm bg-gray-50/50 rounded-xl">Chưa có nhật ký hoạt động</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={actionLogData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {actionLogData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* Biểu đồ tài sản */}
          <h2 className="text-xl font-bold text-gray-900 mt-6">Phân tích Tài sản</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Trạng thái Thiết bị" icon={PieChartIcon} iconColor="#3b82f6" chartKey="deviceStatusChart" chartName="thiet-bi">
              {deviceStatusData.every(d => d.value === 0) ? (
                <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm bg-gray-50/50 rounded-xl">Chưa có dữ liệu thiết bị</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={deviceStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value"
                      label={({ name, value }) => value > 0 ? `${name} (${value})` : ''}>
                      {deviceStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Tình trạng Cánh đồng" icon={BarChart3} iconColor="#22c55e" chartKey="fieldStatusChart" chartName="canh-dong">
              {fieldStatusData.every(d => d.value === 0) ? (
                <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm bg-gray-50/50 rounded-xl">Chưa có dữ liệu cánh đồng</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={fieldStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {fieldStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
>>>>>>> khanh
        </>
      )}
    </div>
  );
<<<<<<< HEAD
}
=======
}

>>>>>>> khanh
