import { ConfirmDialog } from '../components/ConfirmDialog';
import { useState, useEffect, useMemo } from 'react';
import { alertApi, deviceApi, type Alert, type Device } from '../api/client';
import { AlertTriangle, Bell, CheckCheck, Trash2, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export function AlertsPage() {
  const [alertList, setAlertList] = useState<Alert[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'warning' | 'critical' | 'info'>('all');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [alertsData, devicesData] = await Promise.all([
          alertApi.getAll().catch(() => []),
          deviceApi.getAll().catch(() => []),
        ]);
        setAlertList(alertsData);
        setDevices(devicesData);
      } catch (err) {
        console.error('AlertsPage load error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- DỮ LIỆU CHO MINI DASHBOARD ---
  const stats = useMemo(() => {
    const unread = alertList.filter(a => !a.isRead).length;
    const critical = alertList.filter(a => a.type === 'critical').length;
    const warning = alertList.filter(a => a.type === 'warning').length;
    return [
      { label: 'Chưa đọc', value: unread, color: '#3b82f6', bg: 'bg-blue-50' },
      { label: 'Nghiêm trọng', value: critical, color: '#ef4444', bg: 'bg-red-50' },
      { label: 'Cảnh báo', value: warning, color: '#f59e0b', bg: 'bg-yellow-50' },
    ];
  }, [alertList]);

  const alertTimeline = useMemo(() => {
    const days: Record<string, { date: string; critical: number; warning: number; info: number }> = {};
    const now = new Date();
    // Tạo mốc 7 ngày gần nhất
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      days[key] = { date: key, critical: 0, warning: 0, info: 0 };
    }
    
    // Đếm số lượng theo từng ngày
    alertList.forEach(a => {
      if (!a.createdAt) return;
      const key = new Date(a.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      if (days[key]) {
        if (a.type === 'critical') days[key].critical++;
        else if (a.type === 'warning') days[key].warning++;
        else days[key].info++;
      }
    });
    return Object.values(days);
  }, [alertList]);
  // ----------------------------------

  // --- GỌI API ĐỂ CẬP NHẬT DATABASE THỰC TẾ ---
  const markRead = async (id: string) => {
    try {
      await alertApi.markAsRead(id); // Gọi API cập nhật DB
      setAlertList(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc", error);
    }
  };

  // Tìm hàm này và sửa lại:
const markAllRead = async () => {
  try {
    await alertApi.markAllRead(); // Gọi API tối ưu cập nhật toàn bộ 1 lần
    setAlertList(prev => prev.map(a => ({ ...a, isRead: true })));
  } catch (error) {
    console.error("Lỗi khi đánh dấu tất cả đã đọc", error);
  }
};

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        await alertApi.delete(deleteTarget); // Gọi API xóa khỏi DB
        setAlertList(prev => prev.filter(a => a.id !== deleteTarget));
        setDeleteTarget(null);
      } catch (error) {
        console.error("Lỗi khi xóa cảnh báo", error);
      }
    }
  };
  // ----------------------------------

  const filtered = alertList.filter(a => {
    if (filter === 'unread') return !a.isRead;
    if (filter === 'all') return true;
    return a.type === filter;
  });

  const unreadCount = alertList.filter(a => !a.isRead).length;

  const typeConfig: Record<string, { bg: string; icon: string; label: string }> = {
    critical: { bg: 'bg-red-50 border-red-200', icon: 'text-red-500', label: 'Nghiêm trọng' },
    warning: { bg: 'bg-yellow-50 border-yellow-200', icon: 'text-yellow-500', label: 'Cảnh báo' },
    info: { bg: 'bg-blue-50 border-blue-200', icon: 'text-blue-500', label: 'Thông tin' },
  };

  const filterLabels: Record<string, string> = { all: 'Tất cả', unread: 'Chưa đọc', critical: 'Nghiêm trọng', warning: 'Cảnh báo', info: 'Thông tin' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Cảnh báo</h1>
          <p>{unreadCount} cảnh báo chưa đọc</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={markAllRead} className="btn-ghost">
            <CheckCheck className="w-4 h-4" /> Đã đọc tất cả
          </button>
        </div>
      </div>

      {/* MINI DASHBOARD */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex flex-col gap-4">
            {stats.map(s => (
               <div key={s.label} className="farm-card-static p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <AlertTriangle className="w-6 h-6" style={{ color: s.color }} />
                  </div>
               </div>
            ))}
          </div>

          <div className="lg:col-span-2 farm-card-static p-6">
             <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
               <Activity className="w-5 h-5 text-gray-400" /> Tần suất cảnh báo (7 ngày qua)
             </h3>
             <ResponsiveContainer width="100%" height={220}>
               <BarChart data={alertTimeline} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                 <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#9ca3af" />
                 <YAxis tick={{fontSize: 12}} stroke="#9ca3af" allowDecimals={false} />
                 <RechartsTooltip cursor={{fill: '#f9fafb'}} />
                 <Legend verticalAlign="top" height={36} />
                 <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Nghiêm trọng" />
                 <Bar dataKey="warning" stackId="a" fill="#f59e0b" name="Cảnh báo" />
                 <Bar dataKey="info" stackId="a" fill="#3b82f6" name="Thông tin" radius={[4,4,0,0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 pt-2">
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
            <p>Không có cảnh báo nào</p>
          </div>
        ) : filtered.map(a => {
          const config = typeConfig[a.type] || typeConfig.info;
          const device = devices.find(d => d.id === a.deviceId);
          return (
            <div key={a.id} className={`farm-card flex items-start gap-4 p-4 border ${config.bg} ${!a.isRead ? 'ring-2 ring-green-300 ring-offset-1' : ''}`}>
              <AlertTriangle className={`w-5 h-5 mt-0.5 ${config.icon} shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{a.message}</p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="text-xs text-gray-500 font-medium">Thiết bị: {device?.name || 'N/A'}</span>
                  <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!a.isRead && (
                  <button onClick={() => markRead(a.id)} className="action-btn view" style={{ width: 30, height: 30 }} title="Đã đọc">
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => setDeleteTarget(a.id)} className="action-btn delete" style={{ width: 30, height: 30 }} title="Xóa">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog open={!!deleteTarget} title="Xóa cảnh báo" message="Bạn có chắc chắn muốn xóa cảnh báo này?" onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} confirmLabel="Xóa" />
    </div>
  );
}

