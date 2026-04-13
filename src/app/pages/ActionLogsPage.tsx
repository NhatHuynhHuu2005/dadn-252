import { useState, useMemo, useEffect } from 'react';
import { actionLogApi, userApi, type ActionLog, type User } from '../api/client';
import { Activity, Search, Filter, Calendar, FileText, Cpu, UserIcon, Zap, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CustomSelect } from '../components/CustomSelect';

export function ActionLogsPage() {
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'user' | 'device'>('user');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [logsData, usersData] = await Promise.all([
          actionLogApi.getAll().catch(() => []),
          userApi.getAll().catch(() => [])
        ]);
        setActionLogs(logsData);
        setUsers(usersData);
      } catch (err) {
        console.error('ActionLogsPage load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- PHÂN LOẠI NHẬT KÝ ---
  // Hành động do hệ thống tự động sinh ra sẽ có userId là 'SYSTEM'
  const userLogs = useMemo(() => actionLogs.filter(l => l.userId !== 'SYSTEM'), [actionLogs]);
  const deviceLogs = useMemo(() => actionLogs.filter(l => l.userId === 'SYSTEM'), [actionLogs]);
  const currentLogs = activeTab === 'user' ? userLogs : deviceLogs;

  const filtered = useMemo(() => {
    return currentLogs.filter(log => {
      if (activeTab === 'user' && filterUser !== 'all' && log.userId !== filterUser) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const actionMatch = log.action?.toLowerCase().includes(q);
        const targetMatch = log.target?.toLowerCase().includes(q);
        const detailsMatch = log.details?.toLowerCase().includes(q);
        if (!actionMatch && !targetMatch && !detailsMatch) return false;
      }
      if (filterDateFrom && new Date(log.createdAt) < new Date(filterDateFrom)) return false;
      if (filterDateTo) {
        const to = new Date(filterDateTo); 
        to.setHours(23, 59, 59);
        if (new Date(log.createdAt) > to) return false;
      }
      return true;
    });
  }, [currentLogs, searchQuery, filterUser, filterDateFrom, filterDateTo, activeTab]);

  const getUserName = (userId: string) => {
    if (userId === 'SYSTEM') return 'Hệ thống (Tự động)';
    const u = users.find(user => user.id === userId);
    return u ? u.fullName : userId;
  };

  // --- DỮ LIỆU BIỂU ĐỒ NGƯỜI DÙNG ---
  const userBarData = useMemo(() => {
    const byDate: Record<string, number> = {};
    userLogs.forEach(l => {
      if (!l.createdAt) return;
      const date = new Date(l.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      byDate[date] = (byDate[date] || 0) + 1;
    });
    return Object.entries(byDate).map(([date, count]) => ({ date, count })).reverse();
  }, [userLogs]);

  const userStats = useMemo(() => [
    { icon: UserIcon, label: 'Tổng hành động', value: userLogs.length, color: '#22c55e', bg: 'bg-green-50' },
    { icon: UserIcon, label: 'Người tham gia', value: new Set(userLogs.map(l => l.userId)).size, color: '#3b82f6', bg: 'bg-blue-50' },
    { icon: Zap, label: 'Bật/Tắt thiết bị', value: userLogs.filter(l => l.action?.toLowerCase().includes('bật') || l.action?.toLowerCase().includes('tắt')).length, color: '#f59e0b', bg: 'bg-yellow-50' },
    { icon: Activity, label: 'Thao tác khác', value: userLogs.filter(l => !l.action?.toLowerCase().includes('bật') && !l.action?.toLowerCase().includes('tắt')).length, color: '#8b5cf6', bg: 'bg-purple-50' },
  ], [userLogs]);

  // --- DỮ LIỆU BIỂU ĐỒ HỆ THỐNG ---
  const devicePieData = useMemo(() => {
    const byType: Record<string, number> = {};
    deviceLogs.forEach(l => {
      if (l.action?.toLowerCase().includes('lịch')) byType['Lịch hẹn'] = (byType['Lịch hẹn'] || 0) + 1;
      else if (l.action?.toLowerCase().includes('ngưỡng') || l.action?.toLowerCase().includes('tự động')) byType['Theo ngưỡng'] = (byType['Theo ngưỡng'] || 0) + 1;
      else byType['Cập nhật / Cảnh báo'] = (byType['Cập nhật / Cảnh báo'] || 0) + 1;
    });
    return Object.entries(byType).map(([name, value]) => ({ name, value }));
  }, [deviceLogs]);

  const deviceStats = useMemo(() => {
    const lichHen = deviceLogs.filter(l => l.action?.toLowerCase().includes('lịch')).length;
    const theoNguong = deviceLogs.filter(l => l.action?.toLowerCase().includes('ngưỡng') || l.action?.toLowerCase().includes('tự động')).length;
    const canhBao = deviceLogs.length - lichHen - theoNguong;
    return [
      { icon: Cpu, label: 'Tổng tự động', value: deviceLogs.length, color: '#3b82f6', bg: 'bg-blue-50' },
      { icon: AlertTriangle, label: 'Theo ngưỡng', value: theoNguong, color: '#22c55e', bg: 'bg-green-50' },
      { icon: Clock, label: 'Theo lịch hẹn', value: lichHen, color: '#3b82f6', bg: 'bg-blue-50' },
      { icon: Zap, label: 'Khác', value: canhBao, color: '#f59e0b', bg: 'bg-yellow-50' },
    ];
  }, [deviceLogs]);

  const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b'];

  const resetFilters = () => {
    setSearchQuery(''); setFilterUser('all'); setFilterDateFrom(''); setFilterDateTo('');
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Nhật ký hoạt động</h1>
          <p>Theo dõi các hoạt động của người dùng và hệ thống tự động</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-segment">
        <button
          onClick={() => { setActiveTab('user'); resetFilters(); }}
          className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
        >
          <UserIcon className="w-4 h-4" />
          Người dùng
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'user' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{userLogs.length}</span>
        </button>
        <button
          onClick={() => { setActiveTab('device'); resetFilters(); }}
          className={`tab-btn ${activeTab === 'device' ? 'active' : ''}`}
        >
          <Cpu className="w-4 h-4" />
          Hệ thống tự động
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'device' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>{deviceLogs.length}</span>
        </button>
      </div>

      {/* Chart + Stats side by side */}
      {!loading && (
        <div className="farm-card-static p-5">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-5 h-5 text-gray-500" />
            <h3 className="text-gray-800">
              {activeTab === 'user' ? 'Hoạt động người dùng theo ngày' : 'Phân loại hoạt động tự động'}
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Chart */}
            <div className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={260}>
                {activeTab === 'user' ? (
                  <BarChart data={userBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
                    <RechartsTooltip cursor={{fill: '#f9fafb'}} />
                    <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} name="Số lượng" />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={devicePieData}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {devicePieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
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
                    <p className="text-xl font-bold text-gray-800">{s.value}</p>
                    <p className="text-[11px] text-gray-500">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="farm-card-static p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1 font-medium">
          <Filter className="w-4 h-4" /> Bộ lọc và tìm kiếm
        </div>
        <div className="search-pill">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo hành động, đối tượng, chi tiết..."
          />
        </div>
        <div className="flex flex-wrap gap-3 items-start">
          {activeTab === 'user' && (
            <CustomSelect
              value={filterUser}
              onChange={setFilterUser}
              options={[
                { value: 'all', label: 'Tất cả người dùng' },
                ...users.map(u => ({ value: u.id, label: u.fullName }))
              ]}
              style={{ minWidth: '200px', width: 'auto' }}
            />
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Từ ngày</span>
            <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className="form-input" style={{ width: 'auto', minWidth: '140px' }} />
            <span className="text-xs text-gray-500 font-medium">đến</span>
            <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className="form-input" style={{ width: 'auto', minWidth: '140px' }} />
          </div>
          {(searchQuery || filterUser !== 'all' || filterDateFrom || filterDateTo) && (
            <button onClick={resetFilters} className="btn-ghost" style={{ padding: '8px 16px', color: '#dc2626', borderColor: '#fecaca' }}>
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Log list */}
      <div className="farm-card-static">
        <div className="px-5 py-3 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-500">{filtered.length} kết quả</span>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <FileText className="w-14 h-14" />
            <p className="text-gray-500 mt-3">Không tìm thấy nhật ký nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(log => {
              const isDevice = log.userId === 'SYSTEM';
              
              let iconBg = 'bg-emerald-50';
              let iconColor = 'text-emerald-600';
              let LogIcon: any = Activity;

              if (isDevice) {
                if (log.action?.toLowerCase().includes('lịch')) { iconBg = 'bg-amber-50'; iconColor = 'text-amber-600'; LogIcon = Clock; }
                else if (log.action?.toLowerCase().includes('ngưỡng')) { iconBg = 'bg-blue-50'; iconColor = 'text-blue-600'; LogIcon = Zap; }
                else { iconBg = 'bg-red-50'; iconColor = 'text-red-600'; LogIcon = AlertTriangle; }
              }

              return (
                <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <LogIcon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-gray-800">{log.action}</span>
                      <span className="text-xs text-gray-400">→</span>
                      <span className="text-sm font-medium text-gray-600">{log.target}</span>
                      {isDevice && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${iconBg} ${iconColor} font-medium`}>
                          Hệ thống tự động
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 font-mono bg-gray-100/50 p-2 rounded-lg mt-1 break-all border border-gray-100">
                      {log.details}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        {isDevice ? <Cpu className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                        {getUserName(log.userId)}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5" /> {new Date(log.createdAt).toLocaleString('vi-VN')}
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

