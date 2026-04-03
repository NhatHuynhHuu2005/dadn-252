import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { CustomSelect } from '../components/CustomSelect';
import { useState, useEffect } from 'react';
import { userApi, type User } from '../api/client';
import { Users, Plus, Edit, Trash2, X, Shield, UserIcon } from 'lucide-react';

export function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [userList, setUserList] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ username: '', email: '', fullName: '', password: '', role: 'farmer' as User['role'] });
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const users = await userApi.getAll();
        setUserList(users);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);


  if (currentUser?.role !== 'admin') {
    return (
      <div className="empty-state" style={{ paddingTop: '100px' }}>
        <Shield className="w-14 h-14" />
        <p>Ban khong co quyen truy cap trang nay</p>
      </div>
    );
  }

  const openAdd = () => {
    setEditingUser(null);
    setForm({ username: '', email: '', fullName: '', password: '', role: 'farmer' });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setForm({ username: u.username, email: u.email, fullName: u.fullName, password: '', role: u.role });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.username || !form.email || !form.fullName) {
      setFormError('Vui long dien day du thong tin bat buoc');
      return;
    }
    if (!editingUser && !form.password) {
      setFormError('Vui long nhap mat khau cho nguoi dung moi');
      return;
    }
    if (editingUser) {
      setUserList(prev => prev.map(u => u.id === editingUser.id ? {
        ...u, username: form.username, email: form.email, fullName: form.fullName, role: form.role,
        ...(form.password ? { password: form.password } : {})
      } : u));
    } else {
      setUserList(prev => [...prev, {
        id: `u${Date.now()}`, ...form, createdAt: new Date().toISOString()
      }]);
    }
    setShowModal(false);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      setUserList(prev => prev.filter(u => u.id !== deleteTarget));
      setDeleteTarget(null);
    }
  };

  const roleBadge = (role: string) => {
    const config: Record<string, { cls: string; label: string }> = {
      admin: { cls: 'bg-purple-100 text-purple-700', label: 'Quan tri vien' },
      manager: { cls: 'bg-orange-100 text-orange-700', label: 'Quan ly' },
      worker: { cls: 'bg-blue-100 text-blue-700', label: 'Tho cong' },
      farmer: { cls: 'bg-green-100 text-green-700', label: 'Nong dan' },
    };
    const c = config[role] || config.farmer;
    return <span className={`status-badge ${c.cls}`}>{c.label}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Quan ly nguoi dung</h1>
          <p>Quan ly tai khoan va phan quyen nguoi dung</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Them nguoi dung</span><span className="sm:hidden">Them</span>
        </button>
      </div>

      {/* User cards on mobile, table on desktop */}
      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {userList.map(u => (
          <div key={u.id} className="farm-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4ade80] to-[#22c55e] flex items-center justify-center shadow-sm">
                  <UserIcon className="w-4.5 h-4.5 text-[#0f2b0f]" />
                </div>
                <div>
                  <p className="text-sm text-gray-800">{u.fullName}</p>
                  <p className="text-xs text-gray-400">@{u.username}</p>
                </div>
              </div>
              {roleBadge(u.role)}
            </div>
            <div className="text-sm text-gray-500 mb-3">{u.email}</div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(u)} className="action-btn edit" title="Sua"><Edit className="w-4 h-4" /></button>
                <button
                  onClick={() => u.id !== currentUser?.id ? setDeleteTarget(u.id) : null}
                  className={`action-btn delete ${u.id === currentUser?.id ? 'opacity-30 !cursor-not-allowed' : ''}`}
                  title={u.id === currentUser?.id ? 'Khong the xoa chinh minh' : 'Xoa'}
                ><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block farm-card-static overflow-hidden p-4">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Nguoi dung</th>
              <th>Email</th>
              <th>Vai tro</th>
              <th>Ngay tao</th>
              <th style={{ textAlign: 'right' }}>Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {userList.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4ade80] to-[#22c55e] flex items-center justify-center shadow-sm">
                      <UserIcon className="w-4 h-4 text-[#0f2b0f]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">{u.fullName}</p>
                      <p className="text-xs text-gray-400">@{u.username}</p>
                    </div>
                  </div>
                </td>
                <td className="text-gray-600">{u.email}</td>
                <td>{roleBadge(u.role)}</td>
                <td className="text-gray-400">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(u)} className="action-btn edit" title="Sua">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => u.id !== currentUser?.id ? setDeleteTarget(u.id) : null}
                      className={`action-btn delete ${u.id === currentUser?.id ? 'opacity-30 !cursor-not-allowed' : ''}`}
                      title={u.id === currentUser?.id ? 'Khong the xoa chinh minh' : 'Xoa'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h2>{editingUser ? 'Sua nguoi dung' : 'Them nguoi dung'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{formError}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Ho ten *</label>
                <input value={form.fullName} onChange={e => { setForm(p => ({ ...p, fullName: e.target.value })); setFormError(''); }} className="form-input" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Ten dang nhap *</label>
                <input value={form.username} onChange={e => { setForm(p => ({ ...p, username: e.target.value })); setFormError(''); }} className="form-input" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Email *</label>
                <input type="email" value={form.email} onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setFormError(''); }} className="form-input" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">{editingUser ? 'Mat khau moi (bo trong neu khong doi)' : 'Mat khau *'}</label>
                <input type="password" value={form.password} onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setFormError(''); }} className="form-input" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Vai tro *</label>
                <CustomSelect
                  value={form.role}
                  onChange={v => setForm(p => ({ ...p, role: v as User['role'] }))}
                  options={[
                    { value: 'admin', label: 'Quan tri vien' },
                    { value: 'manager', label: 'Quan ly' },
                    { value: 'worker', label: 'Tho cong' },
                    { value: 'farmer', label: 'Nong dan' },
                  ]}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-7">
              <button onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center">Huy</button>
              <button onClick={handleSave} className="btn-primary flex-1 justify-center">Luu</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Xoa nguoi dung" message="Ban co chac chan muon xoa nguoi dung nay? Hanh dong nay khong the hoan tac." onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} confirmLabel="Xoa" />
    </div>
  );
}