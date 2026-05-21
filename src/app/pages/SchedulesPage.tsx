import { ConfirmDialog } from '../components/ConfirmDialog';
import { CustomSelect } from '../components/CustomSelect';
import { useState, useEffect } from 'react';
import { scheduleApi, deviceApi, fieldApi, type Schedule, type Device, type Field } from '../api/client';
import { CalendarClock, Plus, Edit, Trash2, X, Power, PowerOff, Eye, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function SchedulesPage() {
  const { user } = useAuth();
  const isReadOnly = user?.role?.toUpperCase() === 'WORKER';
  const [scheduleList, setScheduleList] = useState<Schedule[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [form, setForm] = useState({ name: '', fieldId: '', deviceId: '', action: 'on' as 'on' | 'off', cronExpression: '', isActive: true });
  const [formError, setFormError] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterFieldId, setFilterFieldId] = useState('all');

  // State cho schedule builder
  const [scheduleType, setScheduleType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [hour, setHour] = useState('6');
  const [minute, setMinute] = useState('0');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Thứ 2-6
  const [dayOfMonth, setDayOfMonth] = useState('1');
  
  // State cho auto-off
  const [autoOff, setAutoOff] = useState(false);
  const [autoOffDuration, setAutoOffDuration] = useState<'15min' | '30min' | '1hour' | '2hour' | 'custom'>('30min');
  const [customOffHours, setCustomOffHours] = useState('0');
  const [customOffMinutes, setCustomOffMinutes] = useState('30');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [schedulesData, devicesData, fieldsData] = await Promise.all([
          scheduleApi.getAll().catch(() => []),
          deviceApi.getAll().catch(() => []),
          fieldApi.getAll().catch(() => []),
        ]);
        setScheduleList(schedulesData);
        setDevices(devicesData);
        setFields(fieldsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Lọc thiết bị: Bao gồm cả chữ 'control' hoặc 'CONTROL' từ DB
  const actuators = devices.filter(d => ['pump', 'valve', 'fan', 'control'].includes((d.type || '').toLowerCase()));

  // Hàm chuyển đổi schedule builder thành cron expression
  const buildCronExpression = () => {
    const h = hour.padStart(2, '0');
    const m = minute.padStart(2, '0');
    
    switch (scheduleType) {
      case 'daily':
        return `${m} ${h} * * *`; // Mỗi ngày
      case 'weekly':
        if (selectedDays.length === 0) return `${m} ${h} * * *`;
        return `${m} ${h} * * ${selectedDays.sort().join(',')}`; // Các thứ đã chọn
      case 'monthly':
        return `${m} ${h} ${dayOfMonth} * *`; // Ngày cụ thể mỗi tháng
      case 'custom':
        return form.cronExpression; // Nhập tay
      default:
        return `${m} ${h} * * *`;
    }
  };

  // Hàm tính thời gian tắt
  const calculateOffTime = () => {
    let offsetMinutes = 0;
    
    if (autoOffDuration === '15min') offsetMinutes = 15;
    else if (autoOffDuration === '30min') offsetMinutes = 30;
    else if (autoOffDuration === '1hour') offsetMinutes = 60;
    else if (autoOffDuration === '2hour') offsetMinutes = 120;
    else if (autoOffDuration === 'custom') {
      offsetMinutes = parseInt(customOffHours) * 60 + parseInt(customOffMinutes);
    }
    
    const startMinutes = parseInt(hour) * 60 + parseInt(minute);
    const endMinutes = (startMinutes + offsetMinutes) % 1440; // 1440 = 24*60
    
    const offHour = Math.floor(endMinutes / 60);
    const offMinute = endMinutes % 60;
    
    return {
      hour: offHour.toString().padStart(2, '0'),
      minute: offMinute.toString().padStart(2, '0'),
      offsetMinutes
    };
  };

  // Hàm build cron cho lịch tắt
  const buildOffCronExpression = () => {
    const { hour: offH, minute: offM } = calculateOffTime();
    
    switch (scheduleType) {
      case 'daily':
        return `${offM} ${offH} * * *`;
      case 'weekly':
        if (selectedDays.length === 0) return `${offM} ${offH} * * *`;
        return `${offM} ${offH} * * ${selectedDays.sort().join(',')}`;
      case 'monthly':
        return `${offM} ${offH} ${dayOfMonth} * *`;
      case 'custom':
        return form.cronExpression; // Không hỗ trợ auto-off cho custom
      default:
        return `${offM} ${offH} * * *`;
    }
  };

  // Hàm parse cron expression thành schedule builder (khi edit)
  const parseCronToBuilder = (cron: string) => {
    const parts = cron.split(' ');
    if (parts.length < 5) return;
    
    const [m, h, day, month, dow] = parts;
    setMinute(m);
    setHour(h);
    
    if (dow !== '*') {
      setScheduleType('weekly');
      setSelectedDays(dow.split(',').map(d => parseInt(d)));
    } else if (day !== '*') {
      setScheduleType('monthly');
      setDayOfMonth(day);
    } else {
      setScheduleType('daily');
    }
  };

  const openAdd = () => {
    if (isReadOnly) return;
    setEditingSchedule(null);
    setForm({ name: '', fieldId: fields[0]?.id || '', deviceId: '', action: 'on', cronExpression: '0 6 * * *', isActive: true });
    setScheduleType('daily');
    setHour('6');
    setMinute('0');
    setSelectedDays([1, 2, 3, 4, 5]);
    setDayOfMonth('1');
    setAutoOff(false);
    setAutoOffDuration('30min');
    setCustomOffHours('0');
    setCustomOffMinutes('30');
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (s: Schedule) => {
    if (isReadOnly) return;
    setEditingSchedule(s);
    setForm({ name: s.name, fieldId: s.fieldId || '', deviceId: s.deviceId || '', action: s.action as 'on' | 'off', cronExpression: s.cronExpression, isActive: s.isActive });
    parseCronToBuilder(s.cronExpression);
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (isReadOnly) return;
    if (!form.name) { setFormError('Vui lòng nhập tên lịch hẹn'); return; }
    if (!form.fieldId) { setFormError('Vui lòng chọn cánh đồng'); return; }
    if (!form.deviceId) { setFormError('Vui lòng chọn thiết bị'); return; }
    
    // Build cron expression từ schedule builder
    const cronExpression = scheduleType === 'custom' ? form.cronExpression : buildCronExpression();
    
    if (!cronExpression) { setFormError('Vui lòng cấu hình lịch trình'); return; }

    try {
      const payload = { ...form, cronExpression };
      
      if (editingSchedule) {
        const updated = await scheduleApi.update(editingSchedule.id, payload);
        setScheduleList(prev => prev.map(s => s.id === editingSchedule.id ? updated : s));
        if(selectedSchedule?.id === editingSchedule.id) setSelectedSchedule(updated);
      } else {
        // Tạo lịch BẬT
        const created = await scheduleApi.create(payload);
        setScheduleList(prev => [created, ...prev]);
        
        // Nếu có auto-off và action là 'on', tạo thêm lịch TẮT
        if (autoOff && form.action === 'on' && scheduleType !== 'custom') {
          const offCron = buildOffCronExpression();
          const { offsetMinutes } = calculateOffTime();
          
          const offPayload = {
            name: `${form.name} (Tự động tắt)`,
            fieldId: form.fieldId,
            deviceId: form.deviceId,
            action: 'off',
            cronExpression: offCron,
            isActive: true
          };
          
          const offSchedule = await scheduleApi.create(offPayload);
          setScheduleList(prev => [offSchedule, ...prev]);
          
          console.log(`Created auto-off schedule after ${offsetMinutes} minutes`);
        }
      }
      setShowModal(false);
    } catch (error) {
      console.error(error);
      setFormError('Lỗi khi lưu vào Database! Vui lòng khởi động lại server Node.js.');
    }
  };

  const toggleActive = async (id: string) => {
    if (isReadOnly) return;
    const s = scheduleList.find(x => x.id === id);
    if (!s) return;

    try {
      await scheduleApi.update(id, { ...s, isActive: !s.isActive }); 
      
      setScheduleList(prev => prev.map(x => x.id === id ? { ...x, isActive: !x.isActive } : x));
      
      if (selectedSchedule?.id === id) {
        setSelectedSchedule({ ...selectedSchedule, isActive: !s.isActive });
      }
    } catch(err) {
      console.error("Lỗi khi cập nhật lịch hẹn:", err);
      alert("Không thể lưu trạng thái lịch hẹn vào hệ thống!");
    }
  };

  const confirmDelete = async () => {
    if (isReadOnly) return;
    if (deleteTarget) {
      try {
        await scheduleApi.delete(deleteTarget); // Xóa khỏi DB
        setScheduleList(prev => prev.filter(s => s.id !== deleteTarget));
        if (selectedSchedule?.id === deleteTarget) setSelectedSchedule(null);
        setDeleteTarget(null);
      } catch(err) {
        console.error(err);
      }
    }
  };

  const parseCron = (cron: string) => {
    if(!cron) return 'N/A';
    const parts = cron.split(' ');
    if (parts.length >= 5) {
      const minute = parts[0].padStart(2, '0');
      const hour = parts[1].padStart(2, '0');
      const dayOfMonth = parts[2];
      const dayOfWeek = parts[4];
      let schedule = `${hour}:${minute}`;
      if (dayOfWeek !== '*') {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        schedule += ` ${dayOfWeek.split(',').map(d => days[parseInt(d)] || d).join(', ')}`;
      } else if (dayOfMonth !== '*') {
        schedule += ` ngày ${dayOfMonth}`;
      } else {
        schedule += ' hàng ngày';
      }
      return schedule;
    }
    return cron;
  };

  // Detảil view
  if (selectedSchedule) {
    const device = devices.find(d => d.id === selectedSchedule.deviceId);
    const field = fields.find(f => f.id === selectedSchedule.fieldId);
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedSchedule(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
        </button>
        <div className="farm-card-static p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedSchedule.action === 'on' ? 'bg-green-100' : 'bg-red-100'}`}>
                {selectedSchedule.action === 'on' ? <Power className="w-6 h-6 text-green-600" /> : <PowerOff className="w-6 h-6 text-red-600" />}
              </div>
              <div>
                <h2 className="text-gray-800">{selectedSchedule.name}</h2>
                <span className={`status-badge ${selectedSchedule.isActive ? 'active' : 'inactive'}`}>
                  {selectedSchedule.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                </span>
              </div>
            </div>
            {!isReadOnly && (
              <button onClick={() => toggleActive(selectedSchedule.id)} className={`w-12 h-7 rounded-full flex items-center px-0.5 transition-colors ${selectedSchedule.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${selectedSchedule.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { l: 'Thiết bị', v: device?.name || 'N/A' },
              { l: 'Cánh đồng', v: field?.name || 'N/A' },
              { l: 'Lịch trình', v: parseCron(selectedSchedule.cronExpression) },
              { l: 'Hành động', v: selectedSchedule.action === 'on' ? 'Bật thiết bị' : 'Tắt thiết bị' },
            ].map(item => (
              <div key={item.l} className="bg-[#f8faf8] rounded-xl p-4 border border-green-50">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider">{item.l}</p>
                <p className="text-sm text-gray-800 mt-1.5">{item.v}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#f8faf8] rounded-xl p-4 mb-6 border border-green-50">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">Cron Expression</p>
            <p className="text-sm text-gray-800 mt-1 font-mono">{selectedSchedule.cronExpression}</p>
            <p className="text-xs text-gray-400 mt-1">Ngày tạo: {new Date(selectedSchedule.createdAt).toLocaleDateString('vi-VN')}</p>
          </div>
          {!isReadOnly && (
            <div className="flex gap-3 pt-5 border-t border-gray-100">
              <button onClick={() => openEdit(selectedSchedule)} className="action-btn edit" style={{ width: 'auto', borderRadius: '50px', padding: '8px 20px', gap: '6px' }}>
                <Edit className="w-4 h-4" /> Sửa
              </button>
              <button onClick={() => setDeleteTarget(selectedSchedule.id)} className="action-btn delete" style={{ width: 'auto', borderRadius: '50px', padding: '8px 20px', gap: '6px' }}>
                <Trash2 className="w-4 h-4" /> Xóa
              </button>
            </div>
          )}
        </div>
        
        {/* Modal và Dialog vẫn hiển thị khi đang ở detail view */}
        {showModal && !isReadOnly && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="flex items-center justify-between mb-6">
                <h2>{editingSchedule ? 'Sửa lịch hẹn' : 'Thêm lịch hẹn'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{formError}</div>}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Tên lịch *</label>
                  <input value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setFormError(''); }} className="form-input" />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Cánh đồng *</label>
                  <CustomSelect
                    value={form.fieldId}
                    onChange={v => {
                      setForm(p => ({ ...p, fieldId: v, deviceId: '' }));
                      setFormError('');
                    }}
                    options={fields.map(f => ({ value: f.id, label: f.name }))}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Thiết bị *</label>
                  <CustomSelect
                    value={form.deviceId}
                    onChange={v => { setForm(p => ({ ...p, deviceId: v })); setFormError(''); }}
                    options={actuators.filter(d => d.fieldId === form.fieldId).map(d => ({ value: d.id, label: d.name }))}
                  />
                  {actuators.filter(d => d.fieldId === form.fieldId).length === 0 && form.fieldId !== '' && (
                    <p className="text-xs text-red-500 mt-1">Cánh đồng này không có thiết bị điều khiển nào!</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Hành động *</label>
                  <CustomSelect
                    value={form.action}
                    onChange={v => {
                      setForm(p => ({ ...p, action: v as 'on' | 'off' }));
                      if (v === 'off') setAutoOff(false);
                    }}
                    options={[
                      { value: 'on', label: 'Bật' },
                      { value: 'off', label: 'Tắt' },
                    ]}
                  />
                </div>

                {/* Auto-off option (chỉ hiện khi action = 'on') */}
                {form.action === 'on' && scheduleType !== 'custom' && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoOff}
                        onChange={e => setAutoOff(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">Tự động tắt sau một khoảng thời gian</span>
                    </label>

                    {autoOff && (
                      <div className="mt-3 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: '15min', label: '15 phút' },
                            { value: '30min', label: '30 phút' },
                            { value: '1hour', label: '1 giờ' },
                            { value: '2hour', label: '2 giờ' },
                            { value: 'custom', label: 'Tùy chỉnh' },
                          ].map(duration => (
                            <button
                              key={duration.value}
                              type="button"
                              onClick={() => setAutoOffDuration(duration.value as any)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                autoOffDuration === duration.value
                                  ? 'bg-blue-600 text-white shadow'
                                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                              }`}
                            >
                              {duration.label}
                            </button>
                          ))}
                        </div>

                        {autoOffDuration === 'custom' && (
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <label className="block text-xs text-gray-500 mb-1">Giờ</label>
                              <input
                                type="number"
                                min="0"
                                max="23"
                                value={customOffHours}
                                onChange={e => setCustomOffHours(e.target.value)}
                                className="form-input text-sm"
                              />
                            </div>
                            <span className="text-gray-400 mt-5">:</span>
                            <div className="flex-1">
                              <label className="block text-xs text-gray-500 mb-1">Phút</label>
                              <input
                                type="number"
                                min="0"
                                max="59"
                                value={customOffMinutes}
                                onChange={e => setCustomOffMinutes(e.target.value)}
                                className="form-input text-sm"
                              />
                            </div>
                          </div>
                        )}

                        <div className="p-2 bg-white rounded-lg border border-blue-200">
                          <p className="text-xs text-gray-600">
                            ⏰ Thiết bị sẽ tự động tắt lúc: <span className="font-semibold text-blue-600">{calculateOffTime().hour}:{calculateOffTime().minute}</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Schedule Builder */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <label className="block text-xs text-gray-700 font-semibold uppercase tracking-wider">Lịch trình *</label>
                  
                  {/* Chọn loại lịch với icon và mô tả */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { 
                        value: 'daily', 
                        label: 'Hàng ngày', 
                        icon: '📅',
                        desc: 'Chạy mỗi ngày vào giờ cố định'
                      },
                      { 
                        value: 'weekly', 
                        label: 'Hàng tuần', 
                        icon: '📆',
                        desc: 'Chọn các thứ trong tuần'
                      },
                      { 
                        value: 'monthly', 
                        label: 'Hàng tháng', 
                        icon: '🗓️',
                        desc: 'Chạy vào ngày cụ thể mỗi tháng'
                      },
                    ].map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setScheduleType(type.value as any)}
                        className={`p-3 rounded-xl text-left transition-all ${
                          scheduleType === type.value
                            ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-300'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{type.icon}</span>
                          <span className="font-semibold text-sm">{type.label}</span>
                        </div>
                        <p className={`text-xs ${scheduleType === type.value ? 'text-green-100' : 'text-gray-500'}`}>
                          {type.desc}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Link chuyển sang Custom mode */}
                  {scheduleType !== 'custom' && (
                    <button
                      type="button"
                      onClick={() => setScheduleType('custom')}
                      className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      ⚙️ Chế độ nâng cao (Nhập cron expression)
                    </button>
                  )}

                  {/* Nếu đang ở custom mode */}
                  {scheduleType === 'custom' && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">⚠️</span>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-yellow-800 mb-1">Chế độ nâng cao</p>
                          <p className="text-xs text-yellow-700">
                            Bạn đang sử dụng cron expression. Chỉ dành cho người dùng có kinh nghiệm.
                          </p>
                          <button
                            type="button"
                            onClick={() => setScheduleType('daily')}
                            className="text-xs text-blue-600 hover:underline mt-1"
                          >
                            ← Quay lại chế độ đơn giản
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chọn giờ phút */}
                  {scheduleType !== 'custom' && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">Thời gian thực hiện</label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Giờ</label>
                          <select
                            value={hour}
                            onChange={e => setHour(e.target.value)}
                            className="form-input text-sm"
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                            ))}
                          </select>
                        </div>
                        <span className="text-2xl text-gray-400 mt-5">:</span>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Phút</label>
                          <select
                            value={minute}
                            onChange={e => setMinute(e.target.value)}
                            className="form-input text-sm"
                          >
                            {Array.from({ length: 60 }, (_, i) => (
                              <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chọn thứ (nếu weekly) */}
                  {scheduleType === 'weekly' && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <label className="block text-xs text-gray-700 font-semibold mb-2">📆 Chọn các ngày trong tuần</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: 1, label: 'T2', full: 'Thứ 2' },
                          { value: 2, label: 'T3', full: 'Thứ 3' },
                          { value: 3, label: 'T4', full: 'Thứ 4' },
                          { value: 4, label: 'T5', full: 'Thứ 5' },
                          { value: 5, label: 'T6', full: 'Thứ 6' },
                          { value: 6, label: 'T7', full: 'Thứ 7' },
                          { value: 0, label: 'CN', full: 'Chủ nhật' },
                        ].map(day => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => {
                              if (selectedDays.includes(day.value)) {
                                setSelectedDays(selectedDays.filter(d => d !== day.value));
                              } else {
                                setSelectedDays([...selectedDays, day.value]);
                              }
                            }}
                            className={`w-12 h-12 rounded-full text-xs font-bold transition-all ${
                              selectedDays.includes(day.value)
                                ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-300'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-300'
                            }`}
                            title={day.full}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        💡 Chọn nhiều ngày để lịch chạy vào các ngày đó mỗi tuần
                      </p>
                    </div>
                  )}

                  {/* Chọn ngày (nếu monthly) */}
                  {scheduleType === 'monthly' && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <label className="block text-xs text-gray-700 font-semibold mb-2">🗓️ Chọn ngày trong tháng</label>
                      <select
                        value={dayOfMonth}
                        onChange={e => setDayOfMonth(e.target.value)}
                        className="form-input text-sm w-full"
                      >
                        {Array.from({ length: 31 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>Ngày {i + 1}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-600 mt-2">
                        💡 Lịch sẽ chạy vào ngày này mỗi tháng
                      </p>
                    </div>
                  )}

                  {/* Nhập cron tùy chỉnh */}
                  {scheduleType === 'custom' && (
                    <div className="p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                      <label className="block text-xs text-gray-700 font-semibold mb-2">⚙️ Cron Expression (Nâng cao)</label>
                      <input
                        value={form.cronExpression}
                        onChange={e => setForm(p => ({ ...p, cronExpression: e.target.value }))}
                        className="form-input text-sm font-mono"
                        placeholder="0 6 * * *"
                      />
                      <div className="mt-2 space-y-1 text-xs text-gray-600">
                        <p>📖 Format: <code className="bg-gray-200 px-1 rounded">phút giờ ngày tháng thứ</code></p>
                        <p>📝 Ví dụ:</p>
                        <ul className="ml-4 space-y-0.5">
                          <li>• <code className="bg-gray-200 px-1 rounded">0 6 * * *</code> = 06:00 hàng ngày</li>
                          <li>• <code className="bg-gray-200 px-1 rounded">*/30 * * * *</code> = Mỗi 30 phút</li>
                          <li>• <code className="bg-gray-200 px-1 rounded">0 */2 * * *</code> = Mỗi 2 giờ</li>
                        </ul>
                        <p className="mt-2">
                          🔗 <a href="https://crontab.guru" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Dùng crontab.guru để test
                          </a>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                    <p className="text-xs text-gray-600 font-semibold mb-2">✨ Xem trước lịch trình:</p>
                    <p className="text-base text-gray-900 font-bold mb-1">
                      {scheduleType === 'daily' && `📅 Mỗi ngày lúc ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`}
                      {scheduleType === 'weekly' && selectedDays.length > 0 && (
                        `📆 Các ngày ${selectedDays.sort().map(d => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d]).join(', ')} lúc ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
                      )}
                      {scheduleType === 'weekly' && selectedDays.length === 0 && '⚠️ Chưa chọn ngày nào'}
                      {scheduleType === 'monthly' && `🗓️ Ngày ${dayOfMonth} hàng tháng lúc ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`}
                      {scheduleType === 'custom' && (form.cronExpression ? `⚙️ ${form.cronExpression}` : '⚠️ Chưa nhập cron expression')}
                    </p>
                    <p className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded">
                      Cron: {scheduleType === 'custom' ? (form.cronExpression || '(chưa có)') : buildCronExpression()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-7">
                <button onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center">Hủy</button>
                <button onClick={handleSave} className="btn-primary flex-1 justify-center">Lưu</button>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog 
          open={!isReadOnly && !!deleteTarget} 
          title="Xóa lịch hẹn" 
          message="Bạn có chắc chắn muốn xóa lịch hẹn này? Thiết bị sẽ không tự động bật/tắt theo lịch này nữa." 
          onConfirm={confirmDelete} 
          onCancel={() => setDeleteTarget(null)} 
          confirmLabel="Xóa" 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Lịch hẹn</h1>
          <p>Đặt lịch tự động bật/tắt thiết bị theo từng khu vực</p>
        </div>
        {!isReadOnly && (
          <button onClick={openAdd} className="btn-primary">
            <Plus className="w-4 h-4" /> Thêm lịch
          </button>
        )}
      </div>

      {/* Filter theo khu vực */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterFieldId('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            filterFieldId === 'all' ? 'bg-green-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tất cả khu vực
        </button>
        {fields.map(f => (
          <button
            key={f.id}
            onClick={() => setFilterFieldId(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterFieldId === f.id ? 'bg-green-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.zoneCode ? `${f.zoneCode} - ${f.name}` : f.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scheduleList.filter(s => filterFieldId === 'all' || s.fieldId === filterFieldId).map(s => {
          const device = devices.find(d => d.id === s.deviceId);
          const field = fields.find(f => f.id === s.fieldId);
          return (
            <div key={s.id} className={`farm-card p-5 ${!s.isActive ? 'opacity-60' : ''} cursor-pointer`} onClick={() => setSelectedSchedule(s)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.action === 'on' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {s.action === 'on' ? <Power className="w-5 h-5 text-green-600" /> : <PowerOff className="w-5 h-5 text-red-600" />}
                  </div>
                  <div>
                    <p className="text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-500">{device?.name || 'N/A'}</p>
                  </div>
                </div>
                {!isReadOnly && (
                  <button onClick={e => { e.stopPropagation(); toggleActive(s.id); }} className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${s.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${s.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                <CalendarClock className="w-4 h-4" />
                <span>{parseCron(s.cronExpression)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {field?.zoneCode && (
                  <span className="px-1.5 py-0.5 bg-green-50 text-green-700 font-semibold rounded-full border border-green-200">
                    {field.zoneCode}
                  </span>
                )}
                <span>{field?.name || 'N/A'}</span>
                <span>• Hành động: {s.action === 'on' ? 'Bật' : 'Tắt'}</span>
              </div>
              {/* Chỉ giữ nút Xem, bỏ nút Sửa/Xóa */}
            </div>
          );
        })}
      </div>

      {showModal && !isReadOnly && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h2>{editingSchedule ? 'Sửa lịch hẹn' : 'Thêm lịch hẹn'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{formError}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Tên lịch *</label>
                <input value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setFormError(''); }} className="form-input" />
              </div>
              
              {/* Thêm chọn cánh đồng vào Form */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Cánh đồng *</label>
                <CustomSelect
                  value={form.fieldId}
                  onChange={v => {
                    setForm(p => ({ ...p, fieldId: v, deviceId: '' })); // Reset thiết bị khi đổi cánh đồng
                    setFormError('');
                  }}
                  options={fields.map(f => ({ value: f.id, label: f.name }))}
                />
              </div>

              {/* Danh sách thiết bị phụ thuộc vào cánh đồng đã chọn */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Thiết bị *</label>
                <CustomSelect
                  value={form.deviceId}
                  onChange={v => { setForm(p => ({ ...p, deviceId: v })); setFormError(''); }}
                  options={actuators.filter(d => d.fieldId === form.fieldId).map(d => ({ value: d.id, label: d.name }))}
                />
                {actuators.filter(d => d.fieldId === form.fieldId).length === 0 && form.fieldId !== '' && (
                  <p className="text-xs text-red-500 mt-1">Cánh đồng này không có thiết bị điều khiển nào!</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Hành động *</label>
                <CustomSelect
                  value={form.action}
                  onChange={v => {
                    setForm(p => ({ ...p, action: v as 'on' | 'off' }));
                    // Reset auto-off nếu chọn 'off'
                    if (v === 'off') setAutoOff(false);
                  }}
                  options={[
                    { value: 'on', label: 'Bật' },
                    { value: 'off', label: 'Tắt' },
                  ]}
                />
              </div>

              {/* Auto-off option (chỉ hiện khi action = 'on') */}
              {form.action === 'on' && scheduleType !== 'custom' && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoOff}
                      onChange={e => setAutoOff(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Tự động tắt sau một khoảng thời gian</span>
                  </label>

                  {autoOff && (
                    <div className="mt-3 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: '15min', label: '15 phút' },
                          { value: '30min', label: '30 phút' },
                          { value: '1hour', label: '1 giờ' },
                          { value: '2hour', label: '2 giờ' },
                          { value: 'custom', label: 'Tùy chỉnh' },
                        ].map(duration => (
                          <button
                            key={duration.value}
                            type="button"
                            onClick={() => setAutoOffDuration(duration.value as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              autoOffDuration === duration.value
                                ? 'bg-blue-600 text-white shadow'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            {duration.label}
                          </button>
                        ))}
                      </div>

                      {autoOffDuration === 'custom' && (
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">Giờ</label>
                            <input
                              type="number"
                              min="0"
                              max="23"
                              value={customOffHours}
                              onChange={e => setCustomOffHours(e.target.value)}
                              className="form-input text-sm"
                            />
                          </div>
                          <span className="text-gray-400 mt-5">:</span>
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">Phút</label>
                            <input
                              type="number"
                              min="0"
                              max="59"
                              value={customOffMinutes}
                              onChange={e => setCustomOffMinutes(e.target.value)}
                              className="form-input text-sm"
                            />
                          </div>
                        </div>
                      )}

                      <div className="p-2 bg-white rounded-lg border border-blue-200">
                        <p className="text-xs text-gray-600">
                          ⏰ Thiết bị sẽ tự động tắt lúc: <span className="font-semibold text-blue-600">{calculateOffTime().hour}:{calculateOffTime().minute}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Schedule Builder */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <label className="block text-xs text-gray-700 font-semibold uppercase tracking-wider">Lịch trình *</label>
                
                {/* Chọn loại lịch với icon và mô tả */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { 
                      value: 'daily', 
                      label: 'Hàng ngày', 
                      icon: '📅',
                      desc: 'Chạy mỗi ngày vào giờ cố định'
                    },
                    { 
                      value: 'weekly', 
                      label: 'Hàng tuần', 
                      icon: '📆',
                      desc: 'Chọn các thứ trong tuần'
                    },
                    { 
                      value: 'monthly', 
                      label: 'Hàng tháng', 
                      icon: '🗓️',
                      desc: 'Chạy vào ngày cụ thể mỗi tháng'
                    },
                  ].map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setScheduleType(type.value as any)}
                      className={`p-3 rounded-xl text-left transition-all ${
                        scheduleType === type.value
                          ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-300'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{type.icon}</span>
                        <span className="font-semibold text-sm">{type.label}</span>
                      </div>
                      <p className={`text-xs ${scheduleType === type.value ? 'text-green-100' : 'text-gray-500'}`}>
                        {type.desc}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Link chuyển sang Custom mode */}
                {scheduleType !== 'custom' && (
                  <button
                    type="button"
                    onClick={() => setScheduleType('custom')}
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    ⚙️ Chế độ nâng cao (Nhập cron expression)
                  </button>
                )}

                {/* Nếu đang ở custom mode */}
                {scheduleType === 'custom' && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">⚠️</span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-yellow-800 mb-1">Chế độ nâng cao</p>
                        <p className="text-xs text-yellow-700">
                          Bạn đang sử dụng cron expression. Chỉ dành cho người dùng có kinh nghiệm.
                        </p>
                        <button
                          type="button"
                          onClick={() => setScheduleType('daily')}
                          className="text-xs text-blue-600 hover:underline mt-1"
                        >
                          ← Quay lại chế độ đơn giản
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chọn giờ phút */}
                {scheduleType !== 'custom' && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Thời gian thực hiện</label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Giờ</label>
                        <select
                          value={hour}
                          onChange={e => setHour(e.target.value)}
                          className="form-input text-sm"
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                          ))}
                        </select>
                      </div>
                      <span className="text-2xl text-gray-400 mt-5">:</span>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Phút</label>
                        <select
                          value={minute}
                          onChange={e => setMinute(e.target.value)}
                          className="form-input text-sm"
                        >
                          {Array.from({ length: 60 }, (_, i) => (
                            <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chọn thứ (nếu weekly) */}
                {scheduleType === 'weekly' && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <label className="block text-xs text-gray-700 font-semibold mb-2">📆 Chọn các ngày trong tuần</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 1, label: 'T2', full: 'Thứ 2' },
                        { value: 2, label: 'T3', full: 'Thứ 3' },
                        { value: 3, label: 'T4', full: 'Thứ 4' },
                        { value: 4, label: 'T5', full: 'Thứ 5' },
                        { value: 5, label: 'T6', full: 'Thứ 6' },
                        { value: 6, label: 'T7', full: 'Thứ 7' },
                        { value: 0, label: 'CN', full: 'Chủ nhật' },
                      ].map(day => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => {
                            if (selectedDays.includes(day.value)) {
                              setSelectedDays(selectedDays.filter(d => d !== day.value));
                            } else {
                              setSelectedDays([...selectedDays, day.value]);
                            }
                          }}
                          className={`w-12 h-12 rounded-full text-xs font-bold transition-all ${
                            selectedDays.includes(day.value)
                              ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-300'
                              : 'bg-white text-gray-600 hover:bg-gray-100 border-2 border-gray-300'
                          }`}
                          title={day.full}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      💡 Chọn nhiều ngày để lịch chạy vào các ngày đó mỗi tuần
                    </p>
                  </div>
                )}

                {/* Chọn ngày (nếu monthly) */}
                {scheduleType === 'monthly' && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <label className="block text-xs text-gray-700 font-semibold mb-2">🗓️ Chọn ngày trong tháng</label>
                    <select
                      value={dayOfMonth}
                      onChange={e => setDayOfMonth(e.target.value)}
                      className="form-input text-sm w-full"
                    >
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>Ngày {i + 1}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-600 mt-2">
                      💡 Lịch sẽ chạy vào ngày này mỗi tháng
                    </p>
                  </div>
                )}

                {/* Nhập cron tùy chỉnh */}
                {scheduleType === 'custom' && (
                  <div className="p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                    <label className="block text-xs text-gray-700 font-semibold mb-2">⚙️ Cron Expression (Nâng cao)</label>
                    <input
                      value={form.cronExpression}
                      onChange={e => setForm(p => ({ ...p, cronExpression: e.target.value }))}
                      className="form-input text-sm font-mono"
                      placeholder="0 6 * * *"
                    />
                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      <p>📖 Format: <code className="bg-gray-200 px-1 rounded">phút giờ ngày tháng thứ</code></p>
                      <p>📝 Ví dụ:</p>
                      <ul className="ml-4 space-y-0.5">
                        <li>• <code className="bg-gray-200 px-1 rounded">0 6 * * *</code> = 06:00 hàng ngày</li>
                        <li>• <code className="bg-gray-200 px-1 rounded">*/30 * * * *</code> = Mỗi 30 phút</li>
                        <li>• <code className="bg-gray-200 px-1 rounded">0 */2 * * *</code> = Mỗi 2 giờ</li>
                      </ul>
                      <p className="mt-2">
                        🔗 <a href="https://crontab.guru" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Dùng crontab.guru để test
                        </a>
                      </p>
                    </div>
                  </div>
                )}

                {/* Preview */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                  <p className="text-xs text-gray-600 font-semibold mb-2">✨ Xem trước lịch trình:</p>
                  <p className="text-base text-gray-900 font-bold mb-1">
                    {scheduleType === 'daily' && `📅 Mỗi ngày lúc ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`}
                    {scheduleType === 'weekly' && selectedDays.length > 0 && (
                      `📆 Các ngày ${selectedDays.sort().map(d => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d]).join(', ')} lúc ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
                    )}
                    {scheduleType === 'weekly' && selectedDays.length === 0 && '⚠️ Chưa chọn ngày nào'}
                    {scheduleType === 'monthly' && `🗓️ Ngày ${dayOfMonth} hàng tháng lúc ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`}
                    {scheduleType === 'custom' && (form.cronExpression ? `⚙️ ${form.cronExpression}` : '⚠️ Chưa nhập cron expression')}
                  </p>
                  <p className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded">
                    Cron: {scheduleType === 'custom' ? (form.cronExpression || '(chưa có)') : buildCronExpression()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-7">
              <button onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center">Hủy</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center">Lưu</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!isReadOnly && !!deleteTarget} title="Xóa lịch hẹn" message="Bạn có chắc chắn muốn xóa lịch hẹn này? Thiết bị sẽ không tự động bật/tắt theo lịch này nữa." onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} confirmLabel="Xóa" />
    </div>
  );
}
