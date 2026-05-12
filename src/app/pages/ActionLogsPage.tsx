<<<<<<< HEAD
import { useState, useMemo, useEffect } from 'react';
import { actionLogApi, userApi, type ActionLog, type User } from '../api/client';
import { Activity, Search, Filter, Calendar, User as UserIconLib, FileText, Cpu, UserIcon, Zap, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
=======
import { useState, useMemo, useEffect, useCallback } from 'react';
import { actionLogApi, userApi, deviceApi, fieldApi, type ActionLog, type User, type Device, type Field } from '../api/client';
import { Activity, Search, Filter, Calendar, FileText, Cpu, UserIcon, Zap, Clock, AlertTriangle, Download, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
>>>>>>> khanh
import { CustomSelect } from '../components/CustomSelect';

export function ActionLogsPage() {
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState<'user' | 'device'>('user');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [logsData, usersData] = await Promise.all([actionLogApi.getAll(), userApi.getAll()]);
        setActionLogs(logsData);
        setUsers(usersData);
      } catch (err) {
        console.error('ActionLogsPage load error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load action logs');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const userLogs = useMemo(() => actionLogs.filter(l => l.category === 'user'), []);
  const deviceLogs = useMemo(() => actionLogs.filter(l => l.category === 'device'), []);
  const currentLogs = activeTab === 'user' ? userLogs : deviceLogs;

  const actionTypes = useMemo(() => [...new Set(currentLogs.map(l => l.action))], [currentLogs]);

=======
  const [devices, setDevices] = useState<Device[]>([]);
  const [fields, setFields] = useState<Field[]>([]);

  const [activeTab, setActiveTab] = useState<'user' | 'device'>('user');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterField, setFilterField] = useState('all');
  const [filterDevice, setFilterDevice] = useState('all');
  const [filterTriggeredBy, setFilterTriggeredBy] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const [logsData, usersData, devicesData, fieldsData] = await Promise.all([
        actionLogApi.getAll(500, {
          fieldId: filterField !== 'all' ? filterField : undefined,
          deviceId: filterDevice !== 'all' ? filterDevice : undefined,
          triggeredBy: filterTriggeredBy !== 'all' ? filterTriggeredBy : undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          from: filterDateFrom || undefined,
          to: filterDateTo || undefined,
        }).catch(() => []),
        userApi.getAll().catch(() => []),
        deviceApi.getAll().catch(() => []),
        fieldApi.getAll().catch(() => []),
      ]);
      setActionLogs(logsData);
      setUsers(usersData);
      setDevices(devicesData);
      setFields(fieldsData);
    } catch (err) {
      console.error('ActionLogsPage load error:', err);
    } finally {
      setLoading(false);
    }
  }, [filterField, filterDevice, filterTriggeredBy, filterStatus, filterDateFrom, filterDateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // --- PHÂN LOẠI NHẬT KÝ ---
  const userLogs = useMemo(() => actionLogs.filter(l => l.userId !== 'SYSTEM' && l.category !== 'device'), [actionLogs]);
  const deviceLogs = useMemo(() => actionLogs.filter(l => l.userId === 'SYSTEM' || l.category === 'device'), [actionLogs]);
  const currentLogs = activeTab === 'user' ? userLogs : deviceLogs;

>>>>>>> khanh
  const filtered = useMemo(() => {
    return currentLogs.filter(log => {
      if (activeTab === 'user' && filterUser !== 'all' && log.userId !== filterUser) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
<<<<<<< HEAD
        if (!log.action.toLowerCase().includes(q) && !log.target.toLowerCase().includes(q) && !log.details.toLowerCase().includes(q)) return false;
      }
      if (filterDateFrom && new Date(log.createdAt) < new Date(filterDateFrom)) return false;
      if (filterDateTo) {
        const to = new Date(filterDateTo); to.setHours(23, 59, 59);
        if (new Date(log.createdAt) > to) return false;
      }
      return true;
    });
  }, [currentLogs, searchQuery, filterUser, filterDateFrom, filterDateTo, activeTab]);

  const getUserName = (userId: string) => {
    if (userId === 'system') return 'He thong';
    return users.find(u => u.id === userId)?.fullName || userId;
  };

  // --- User tab: bar chart data ---
  const userBarData = useMemo(() => {
    const byDate: Record<string, number> = {};
    userLogs.forEach(l => {
=======
        if (
          !log.action?.toLowerCase().includes(q) &&
          !log.target?.toLowerCase().includes(q) &&
          !log.details?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [currentLogs, searchQuery, filterUser, activeTab]);

  const getUserName = (userId: string) => {
    if (userId === 'SYSTEM') return 'Hệ thống (Tự động)';
    const u = users.find(user => user.id === userId);
    return u ? u.fullName : userId;
  };

  const getDeviceName = (deviceId?: string) => {
    if (!deviceId) return null;
    return devices.find(d => d.id === deviceId)?.name;
  };

  const getFieldName = (fieldId?: string) => {
    if (!fieldId) return null;
    const f = fields.find(f => f.id === fieldId);
    return f?.zoneCode ? `${f.zoneCode} - ${f.name}` : f?.name;
  };

  // --- BIỂU ĐỒ ---
  const userBarData = useMemo(() => {
    const byDate: Record<string, number> = {};
    filtered.forEach(l => {
      if (!l.createdAt) return;
>>>>>>> khanh
      const date = new Date(l.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      byDate[date] = (byDate[date] || 0) + 1;
    });
    return Object.entries(byDate).map(([date, count]) => ({ date, count })).reverse();
<<<<<<< HEAD
  }, [userLogs]);

  // --- User tab: stats ---
  const userStats = useMemo(() => [
    { icon: UserIcon, label: 'Tong hanh dong', value: userLogs.length, color: '#22c55e', bg: 'bg-green-50' },
    { icon: User, label: 'Nguoi tham gia', value: new Set(userLogs.map(l => l.userId)).size, color: '#3b82f6', bg: 'bg-blue-50' },
    { icon: Zap, label: 'Bat/Tat thiet bi', value: userLogs.filter(l => l.action.includes('Bat') || l.action.includes('Tat')).length, color: '#f59e0b', bg: 'bg-yellow-50' },
    { icon: Activity, label: 'Cau hinh & sua doi', value: userLogs.filter(l => !l.action.includes('Bat') && !l.action.includes('Tat')).length, color: '#8b5cf6', bg: 'bg-purple-50' },
  ], [userLogs]);

  // --- Device tab: pie chart data ---
  const devicePieData = useMemo(() => {
    const byType: Record<string, number> = {};
    deviceLogs.forEach(l => {
      if (l.action.includes('Lich hen')) byType['Lich hen'] = (byType['Lich hen'] || 0) + 1;
      else if (l.action.includes('Tu dong')) byType['Theo nguong'] = (byType['Theo nguong'] || 0) + 1;
      else byType['Canh bao'] = (byType['Canh bao'] || 0) + 1;
    });
    return Object.entries(byType).map(([name, value]) => ({ name, value }));
  }, [deviceLogs]);

  // --- Device tab: stats (synced with pie chart: Theo nguong, Lich hen, Canh bao) ---
  const deviceStats = useMemo(() => {
    const theoNguong = deviceLogs.filter(l => l.action.includes('Tu dong')).length;
    const lichHen = deviceLogs.filter(l => l.action.includes('Lich hen')).length;
    const canhBao = deviceLogs.filter(l => !l.action.includes('Tu dong') && !l.action.includes('Lich hen')).length;
    return [
      { icon: Cpu, label: 'Tong tu dong', value: deviceLogs.length, color: '#3b82f6', bg: 'bg-blue-50' },
      { icon: AlertTriangle, label: 'Theo nguong', value: theoNguong, color: '#22c55e', bg: 'bg-green-50' },
      { icon: Clock, label: 'Theo lich hen', value: lichHen, color: '#3b82f6', bg: 'bg-blue-50' },
      { icon: Zap, label: 'Canh bao', value: canhBao, color: '#f59e0b', bg: 'bg-yellow-50' },
    ];
  }, [deviceLogs]);
=======
  }, [filtered]);

  const userStats = useMemo(() => [
    { icon: UserIcon, label: 'Tổng hành động', value: filtered.length, color: '#22c55e', bg: 'bg-green-50' },
    { icon: UserIcon, label: 'Người tham gia', value: new Set(filtered.map(l => l.userId)).size, color: '#3b82f6', bg: 'bg-blue-50' },
    { icon: CheckCircle, label: 'Thành công', value: filtered.filter(l => !l.status || l.status === 'success').length, color: '#10b981', bg: 'bg-emerald-50' },
    { icon: XCircle, label: 'Thất bại', value: filtered.filter(l => l.status === 'fail').length, color: '#ef4444', bg: 'bg-red-50' },
  ], [filtered]);

  const devicePieData = useMemo(() => {
    const byType: Record<string, number> = {};
    filtered.forEach(l => {
      const key = l.triggeredBy === 'schedule' ? 'Theo lịch hẹn'
        : l.triggeredBy === 'threshold' ? 'Theo ngưỡng'
        : l.action?.toLowerCase().includes('lịch') ? 'Theo lịch hẹn'
        : l.action?.toLowerCase().includes('ngưỡng') ? 'Theo ngưỡng'
        : 'Hệ thống khác';
      byType[key] = (byType[key] || 0) + 1;
    });
    return Object.entries(byType).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const deviceStats = useMemo(() => [
    { icon: Cpu, label: 'Tổng tự động', value: filtered.length, color: '#3b82f6', bg: 'bg-blue-50' },
    { icon: Clock, label: 'Theo lịch hẹn', value: filtered.filter(l => l.triggeredBy === 'schedule' || l.action?.toLowerCase().includes('lịch')).length, color: '#22c55e', bg: 'bg-green-50' },
    { icon: AlertTriangle, label: 'Theo ngưỡng', value: filtered.filter(l => l.triggeredBy === 'threshold' || l.action?.toLowerCase().includes('ngưỡng')).length, color: '#f59e0b', bg: 'bg-yellow-50' },
    { icon: CheckCircle, label: 'Thành công', value: filtered.filter(l => !l.status || l.status === 'success').length, color: '#10b981', bg: 'bg-emerald-50' },
  ], [filtered]);
>>>>>>> khanh

  const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b'];

  const resetFilters = () => {
<<<<<<< HEAD
    setSearchQuery(''); setFilterUser('all'); setFilterAction('all'); setFilterDateFrom(''); setFilterDateTo('');
=======
    setSearchQuery(''); setFilterUser('all'); setFilterField('all');
    setFilterDevice('all'); setFilterTriggeredBy('all'); setFilterStatus('all');
    setFilterDateFrom(''); setFilterDateTo('');
  };

  // --- XUẤT CSV ---
  const exportCSV = () => {
    const rows = [
      ['Thời gian', 'Hành động', 'Đối tượng', 'Chi tiết', 'Khu vực', 'Thiết bị', 'Kích hoạt bởi', 'Trạng thái', 'Người dùng'],
      ...filtered.map(log => [
        new Date(log.createdAt).toLocaleString('vi-VN'),
        log.action,
        log.target,
        log.details,
        getFieldName(log.fieldId) || '',
        getDeviceName(log.deviceId) || '',
        log.triggeredBy === 'manual' ? 'Thủ công'
          : log.triggeredBy === 'schedule' ? 'Lịch tự động'
          : log.triggeredBy === 'threshold' ? 'Theo ngưỡng'
          : log.userId === 'SYSTEM' ? 'Hệ thống' : 'Thủ công',
        log.status === 'fail' ? 'Thất bại' : 'Thành công',
        getUserName(log.userId),
      ].map(v => `"${String(v || '').replace(/"/g, '""')}"`))
    ];
    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nhat-ky-${activeTab === 'user' ? 'nguoi-dung' : 'he-thong'}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
>>>>>>> khanh
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="page-header" style={{ marginBottom: 0 }}>
<<<<<<< HEAD
          <h1>Nhat ky hoat dong</h1>
          <p>Theo doi cac hoat dong cua nguoi dung va thiet bi trong he thong</p>
=======
          <h1>Nhật ký hoạt động</h1>
          <p>Theo dõi các hoạt động của người dùng và hệ thống tự động</p>
>>>>>>> khanh
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-segment">
<<<<<<< HEAD
        <button
          onClick={() => { setActiveTab('user'); resetFilters(); }}
          className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
        >
          <UserIcon className="w-4 h-4" />
          Nguoi dung
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'user' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{userLogs.length}</span>
        </button>
        <button
          onClick={() => { setActiveTab('device'); resetFilters(); }}
          className={`tab-btn ${activeTab === 'device' ? 'active' : ''}`}
        >
          <Cpu className="w-4 h-4" />
          Thiet bi tu dong
=======
        <button onClick={() => { setActiveTab('user'); }} className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}>
          <UserIcon className="w-4 h-4" />
          Nhật ký người dùng
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'user' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{userLogs.length}</span>
        </button>
        <button onClick={() => { setActiveTab('device'); }} className={`tab-btn ${activeTab === 'device' ? 'active' : ''}`}>
          <Cpu className="w-4 h-4" />
          Nhật ký hệ thống tự động
>>>>>>> khanh
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'device' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>{deviceLogs.length}</span>
        </button>
      </div>

<<<<<<< HEAD
      {/* Chart + Stats side by side */}
      <div className="farm-card-static p-5">
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-5 h-5 text-gray-500" />
          <h3 className="text-gray-800">
            {activeTab === 'user' ? 'Hoat dong nguoi dung theo ngay' : 'Phan loai hoat dong tu dong'}
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Chart */}
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={260}>
              {activeTab === 'user' ? (
                <BarChart data={userBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} name="So luong" />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={devicePieData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {devicePieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {(activeTab === 'user' ? userStats : deviceStats).map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#f8faf8] rounded-xl border border-green-50">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xl text-gray-800">{s.value}</p>
                  <p className="text-[11px] text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search and filters - 2 rows */}
      <div className="farm-card-static p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Filter className="w-4 h-4" /> Bo loc va tim kiem
        </div>
        {/* Row 1: Search */}
=======
      {/* Search and filters */}
      <div className="farm-card-static p-5 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Filter className="w-4 h-4" /> Bộ lọc dữ liệu
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchLogs} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Làm mới
            </button>
            <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-3.5 h-3.5" /> Xuất CSV
            </button>
          </div>
        </div>

        {/* Search */}
>>>>>>> khanh
        <div className="search-pill">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
<<<<<<< HEAD
            placeholder="Tim kiem theo hanh dong, doi tuong, chi tiet..."
          />
        </div>
        {/* Row 2: Filters */}
        <div className="flex flex-wrap gap-3 items-start">
=======
            placeholder="Tìm kiếm theo hành động, đối tượng, chi tiết..."
          />
        </div>

        {/* Filter row 1: field, device, user */}
        <div className="flex flex-wrap gap-3">
          <CustomSelect
            value={filterField}
            onChange={v => { setFilterField(v); setFilterDevice('all'); }}
            options={[
              { value: 'all', label: 'Tất cả khu vực' },
              ...fields.map(f => ({ value: f.id, label: f.zoneCode ? `${f.zoneCode} - ${f.name}` : f.name }))
            ]}
            style={{ minWidth: '180px', width: 'auto' }}
          />
          <CustomSelect
            value={filterDevice}
            onChange={setFilterDevice}
            options={[
              { value: 'all', label: 'Tất cả thiết bị' },
              ...(filterField === 'all' ? devices : devices.filter(d => d.fieldId === filterField))
                .map(d => ({ value: d.id, label: d.name }))
            ]}
            style={{ minWidth: '180px', width: 'auto' }}
          />
>>>>>>> khanh
          {activeTab === 'user' && (
            <CustomSelect
              value={filterUser}
              onChange={setFilterUser}
              options={[
<<<<<<< HEAD
                { value: 'all', label: 'Tat ca nguoi dung' },
                ...users.map(u => ({ value: u.id, label: u.fullName }))
=======
                { value: 'all', label: 'Tất cả người dùng' },
                ...users.filter(u => u.id !== 'SYSTEM').map(u => ({ value: u.id, label: u.fullName }))
>>>>>>> khanh
              ]}
              style={{ minWidth: '180px', width: 'auto' }}
            />
          )}
<<<<<<< HEAD
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400">Tu</span>
            <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className="form-input" style={{ width: 'auto', minWidth: '140px' }} />
            <span className="text-xs text-gray-400">den</span>
            <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className="form-input" style={{ width: 'auto', minWidth: '140px' }} />
          </div>
          {(searchQuery || filterUser !== 'all' || filterDateFrom || filterDateTo) && (
            <button onClick={resetFilters} className="btn-ghost" style={{ padding: '8px 16px', color: '#dc2626', borderColor: '#fecaca' }}>
              Xoa bo loc
=======
          {activeTab === 'device' && (
            <CustomSelect
              value={filterTriggeredBy}
              onChange={setFilterTriggeredBy}
              options={[
                { value: 'all', label: 'Tất cả loại kích hoạt' },
                { value: 'schedule', label: 'Theo lịch hẹn' },
                { value: 'threshold', label: 'Theo ngưỡng' },
              ]}
              style={{ minWidth: '180px', width: 'auto' }}
            />
          )}
          <CustomSelect
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'success', label: 'Thành công' },
              { value: 'fail', label: 'Thất bại' },
            ]}
            style={{ minWidth: '160px', width: 'auto' }}
          />
        </div>

        {/* Date range */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Từ ngày</span>
          <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className="form-input" style={{ width: 'auto', minWidth: '140px' }} />
          <span className="text-xs text-gray-500 font-medium">đến</span>
          <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className="form-input" style={{ width: 'auto', minWidth: '140px' }} />
          {(searchQuery || filterUser !== 'all' || filterField !== 'all' || filterDevice !== 'all' || filterTriggeredBy !== 'all' || filterStatus !== 'all' || filterDateFrom || filterDateTo) && (
            <button onClick={resetFilters} className="btn-ghost" style={{ padding: '8px 16px', color: '#dc2626', borderColor: '#fecaca' }}>
              Xóa bộ lọc
>>>>>>> khanh
            </button>
          )}
        </div>
      </div>

<<<<<<< HEAD
      {/* Log list */}
      <div className="farm-card-static">
        <div className="px-5 py-3 border-b border-gray-100">
          <span className="text-sm text-gray-500">{filtered.length} ket qua</span>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <FileText className="w-14 h-14" />
            <p className="text-gray-500">Khong tim thay nhat ky nao</p>
=======
      {/* Chart + Stats */}
      {!loading && (
        <div className="farm-card-static p-5">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-5 h-5 text-gray-500" />
            <h3 className="text-gray-800">
              {activeTab === 'user' ? 'Hoạt động người dùng theo ngày' : 'Phân loại hoạt động tự động'}
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={220}>
                {activeTab === 'user' ? (
                  <BarChart data={userBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
                    <RechartsTooltip cursor={{ fill: '#f9fafb' }} />
                    <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} name="Số lượng" />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie data={devicePieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                      {devicePieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              {(activeTab === 'user' ? userStats : deviceStats).map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[#f8faf8] rounded-xl border border-green-50">
                  <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-800">{s.value}</p>
                    <p className="text-[11px] text-gray-500">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Log list */}
      <div className="farm-card-static">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">{filtered.length} kết quả</span>
        </div>
        {loading ? (
          <div className="empty-state py-16">
            <RefreshCw className="w-10 h-10 animate-spin text-green-400" />
            <p className="text-gray-400 mt-3">Đang tải nhật ký...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <FileText className="w-14 h-14" />
            <p className="text-gray-500 mt-3">Không tìm thấy nhật ký nào</p>
            <p className="text-xs text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc khoảng thời gian</p>
>>>>>>> khanh
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(log => {
<<<<<<< HEAD
              const isDevice = log.category === 'device';
              const isSchedule = log.action.includes('Lich hen');
              const isThreshold = log.action.includes('Tu dong');
              const isWarning = log.action.includes('Canh bao');
=======
              const isDevice = log.userId === 'SYSTEM' || log.category === 'device';
              const isManual = !isDevice && (log.triggeredBy === 'manual' || !log.triggeredBy);
              const isSchedule = log.triggeredBy === 'schedule' || log.action?.toLowerCase().includes('lịch');
              const isThreshold = log.triggeredBy === 'threshold' || log.action?.toLowerCase().includes('ngưỡng');
              const isFail = log.status === 'fail';
>>>>>>> khanh

              let iconBg = 'bg-emerald-50';
              let iconColor = 'text-emerald-600';
              let LogIcon: any = Activity;

              if (isDevice) {
                if (isSchedule) { iconBg = 'bg-amber-50'; iconColor = 'text-amber-600'; LogIcon = Clock; }
                else if (isThreshold) { iconBg = 'bg-blue-50'; iconColor = 'text-blue-600'; LogIcon = Zap; }
<<<<<<< HEAD
                else if (isWarning) { iconBg = 'bg-red-50'; iconColor = 'text-red-600'; LogIcon = AlertTriangle; }
                else { iconBg = 'bg-blue-50'; iconColor = 'text-blue-600'; LogIcon = Cpu; }
              }
=======
                else { iconBg = 'bg-purple-50'; iconColor = 'text-purple-600'; LogIcon = Cpu; }
              }
              if (isFail) { iconBg = 'bg-red-50'; iconColor = 'text-red-500'; LogIcon = XCircle; }

              const fieldName = getFieldName(log.fieldId);
              const deviceName = getDeviceName(log.deviceId);
>>>>>>> khanh

              return (
                <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <LogIcon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
<<<<<<< HEAD
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-800">{log.action}</span>
                      <span className="text-xs text-gray-400">→</span>
                      <span className="text-sm text-gray-600">{log.target}</span>
                      {isDevice && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSchedule ? 'bg-amber-100 text-amber-700' : isWarning ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {isSchedule ? 'Lich hen' : isWarning ? 'Canh bao' : 'Nguong'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        {isDevice ? <Cpu className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {getUserName(log.userId)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" /> {new Date(log.createdAt).toLocaleString('vi-VN')}
=======
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-gray-800">{log.action}</span>
                      <span className="text-xs text-gray-400">→</span>
                      <span className="text-sm font-medium text-gray-600">{log.target}</span>

                      {/* Triggered By Badge */}
                      {isDevice ? (
                        isSchedule ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium border border-amber-200 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> Lịch tự động
                          </span>
                        ) : isThreshold ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200 flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5" /> Theo ngưỡng
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium border border-purple-200 flex items-center gap-0.5">
                            <Cpu className="w-2.5 h-2.5" /> Hệ thống
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium border border-green-200 flex items-center gap-0.5">
                          <UserIcon className="w-2.5 h-2.5" /> Thủ công
                        </span>
                      )}

                      {/* Status Badge */}
                      {isFail ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium border border-red-200 flex items-center gap-0.5">
                          <XCircle className="w-2.5 h-2.5" /> Thất bại
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium border border-emerald-200 flex items-center gap-0.5">
                          <CheckCircle className="w-2.5 h-2.5" /> Thành công
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 font-mono bg-gray-100/50 p-2 rounded-lg mt-1 break-all border border-gray-100">
                      {log.details}
                    </p>

                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      {fieldName && (
                        <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full border border-green-100 font-medium">
                          {fieldName}
                        </span>
                      )}
                      {deviceName && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Cpu className="w-3 h-3" /> {deviceName}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        {isDevice ? <Cpu className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                        {getUserName(log.userId)}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5" /> {new Date(log.createdAt).toLocaleString('vi-VN')}
>>>>>>> khanh
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> khanh
