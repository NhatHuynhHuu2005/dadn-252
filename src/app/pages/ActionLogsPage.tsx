import { useState, useMemo, useEffect } from 'react';
import { actionLogApi, userApi, type ActionLog, type User } from '../api/client';
import { Activity, Search, Filter, Calendar, User as UserIconLib, FileText, Cpu, UserIcon, Zap, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CustomSelect } from '../components/CustomSelect';

export function ActionLogsPage() {
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
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

  const filtered = useMemo(() => {
    return currentLogs.filter(log => {
      if (activeTab === 'user' && filterUser !== 'all' && log.userId !== filterUser) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
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
      const date = new Date(l.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      byDate[date] = (byDate[date] || 0) + 1;
    });
    return Object.entries(byDate).map(([date, count]) => ({ date, count })).reverse();
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

  const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b'];

  const resetFilters = () => {
    setSearchQuery(''); setFilterUser('all'); setFilterAction('all'); setFilterDateFrom(''); setFilterDateTo('');
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Nhat ky hoat dong</h1>
          <p>Theo doi cac hoat dong cua nguoi dung va thiet bi trong he thong</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-segment">
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
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'device' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>{deviceLogs.length}</span>
        </button>
      </div>

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
        <div className="search-pill">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tim kiem theo hanh dong, doi tuong, chi tiet..."
          />
        </div>
        {/* Row 2: Filters */}
        <div className="flex flex-wrap gap-3 items-start">
          {activeTab === 'user' && (
            <CustomSelect
              value={filterUser}
              onChange={setFilterUser}
              options={[
                { value: 'all', label: 'Tat ca nguoi dung' },
                ...users.map(u => ({ value: u.id, label: u.fullName }))
              ]}
              style={{ minWidth: '180px', width: 'auto' }}
            />
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400">Tu</span>
            <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className="form-input" style={{ width: 'auto', minWidth: '140px' }} />
            <span className="text-xs text-gray-400">den</span>
            <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className="form-input" style={{ width: 'auto', minWidth: '140px' }} />
          </div>
          {(searchQuery || filterUser !== 'all' || filterDateFrom || filterDateTo) && (
            <button onClick={resetFilters} className="btn-ghost" style={{ padding: '8px 16px', color: '#dc2626', borderColor: '#fecaca' }}>
              Xoa bo loc
            </button>
          )}
        </div>
      </div>

      {/* Log list */}
      <div className="farm-card-static">
        <div className="px-5 py-3 border-b border-gray-100">
          <span className="text-sm text-gray-500">{filtered.length} ket qua</span>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <FileText className="w-14 h-14" />
            <p className="text-gray-500">Khong tim thay nhat ky nao</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(log => {
              const isDevice = log.category === 'device';
              const isSchedule = log.action.includes('Lich hen');
              const isThreshold = log.action.includes('Tu dong');
              const isWarning = log.action.includes('Canh bao');

              let iconBg = 'bg-emerald-50';
              let iconColor = 'text-emerald-600';
              let LogIcon: any = Activity;

              if (isDevice) {
                if (isSchedule) { iconBg = 'bg-amber-50'; iconColor = 'text-amber-600'; LogIcon = Clock; }
                else if (isThreshold) { iconBg = 'bg-blue-50'; iconColor = 'text-blue-600'; LogIcon = Zap; }
                else if (isWarning) { iconBg = 'bg-red-50'; iconColor = 'text-red-600'; LogIcon = AlertTriangle; }
                else { iconBg = 'bg-blue-50'; iconColor = 'text-blue-600'; LogIcon = Cpu; }
              }

              return (
                <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <LogIcon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
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
}