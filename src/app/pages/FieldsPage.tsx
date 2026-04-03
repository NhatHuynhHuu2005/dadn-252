import { ConfirmDialog } from '../components/ConfirmDialog';
import { CustomSelect } from '../components/CustomSelect';
import { useState, useRef, useEffect } from 'react';
import { fieldApi, deviceApi, type Field, type Device } from '../api/client';
import { MapPin, Plus, Edit, Trash2, Cpu, X, Eye, ChevronLeft, ImageIcon, Upload, Link, XCircle, Check } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const sampleImages = [
  { label: 'Ruong lua', url: 'https://images.unsplash.com/photo-1655903724829-37b3cd3d4ab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800' },
  { label: 'Vuon rau', url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800' },
  { label: 'Nha kinh', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800' },
  { label: 'Ca chua', url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800' },
  { label: 'Dong co', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800' },
  { label: 'Trang trai', url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800' },
];

export function FieldsPage() {
  const [fieldList, setFieldList] = useState<Field[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [form, setForm] = useState({ name: '', location: '', area: '', cropType: '', status: 'active' as Field['status'], image: '' });
  const [formError, setFormError] = useState('');
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [imageInputMode, setImageInputMode] = useState<'gallery' | 'url' | 'upload'>('gallery');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [fieldsData, devicesData] = await Promise.all([
          fieldApi.getAll(),
          deviceApi.getAll(),
        ]);
        setFieldList(fieldsData);
        setDevices(devicesData);
      } catch (err) {
        console.error('FieldsPage load error', err);
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const openAdd = () => {
    setEditingField(null);
    setForm({ name: '', location: '', area: '', cropType: '', status: 'active', image: '' });
    setFormError('');
    setImageInputMode('gallery');
    setShowModal(true);
  };

  const openEdit = (f: Field) => {
    setEditingField(f);
    setForm({ name: f.name, location: f.location, area: String(f.area), cropType: f.cropType, status: f.status, image: f.image || '' });
    setFormError('');
    setImageInputMode(f.image ? 'url' : 'gallery');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.location || !form.cropType) {
      setFormError('Vui long dien day du thong tin bat buoc (Ten, Vi tri, Loai cay trong)');
      return;
    }
    if (editingField) {
      const updated = { ...editingField, ...form, area: parseFloat(form.area) || 0, image: form.image || undefined };
      setFieldList(prev => prev.map(f => f.id === editingField.id ? updated : f));
      if (selectedField?.id === editingField.id) setSelectedField(updated);
    } else {
      const newField: Field = {
        id: `f${Date.now()}`, ...form, area: parseFloat(form.area) || 0, userId: 'u1', createdAt: new Date().toISOString(), image: form.image || undefined
      };
      setFieldList(prev => [...prev, newField]);
    }
    setShowModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(p => ({ ...p, image: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      setFieldList(prev => prev.filter(f => f.id !== deleteTarget));
      setDeleteTarget(null);
      if (selectedField?.id === deleteTarget) setSelectedField(null);
    }
  };

  const statusBadge = (status: string) => {
    const cls: Record<string, string> = { active: 'active', inactive: 'inactive', harvesting: 'harvesting' };
    const labels: Record<string, string> = { active: 'Hoat dong', inactive: 'Tam dung', harvesting: 'Thu hoach' };
    return <span className={`status-badge ${cls[status]}`}>{labels[status]}</span>;
  };

  // --- Image section for modal ---
  const renderImageSection = () => (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Hinh anh (tuy chon)</label>

      {/* Current image preview */}
      {form.image && (
        <div className="relative mb-3 rounded-xl overflow-hidden border border-gray-200">
          <ImageWithFallback src={form.image} alt="Preview" className="w-full h-36 object-cover" />
          <button
            type="button"
            onClick={() => setForm(p => ({ ...p, image: '' }))}
            className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors"
          >
            <XCircle className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      {/* Mode tabs */}
      <div className="flex gap-1 mb-3 bg-gray-100 p-1 rounded-xl">
        {([
          { mode: 'gallery' as const, icon: ImageIcon, label: 'Mau' },
          { mode: 'url' as const, icon: Link, label: 'URL' },
          { mode: 'upload' as const, icon: Upload, label: 'Tai len' },
        ]).map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            type="button"
            onClick={() => setImageInputMode(mode)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition-all ${imageInputMode === mode ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Gallery */}
      {imageInputMode === 'gallery' && (
        <div className="grid grid-cols-3 gap-2">
          {sampleImages.map(img => {
            const isSelected = form.image === img.url;
            return (
              <button
                key={img.url}
                type="button"
                onClick={() => setForm(p => ({ ...p, image: isSelected ? '' : img.url }))}
                className={`relative rounded-xl overflow-hidden h-20 border-2 transition-all ${isSelected ? 'border-green-500 ring-2 ring-green-200' : 'border-transparent hover:border-gray-300'}`}
              >
                <ImageWithFallback src={img.url} alt={img.label} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1">
                  <span className="text-[10px] text-white">{img.label}</span>
                </div>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* URL input */}
      {imageInputMode === 'url' && (
        <div>
          <input
            value={form.image.startsWith('data:') ? '' : form.image}
            onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
            className="form-input"
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-gray-400 mt-1">Dan duong dan URL cua hinh anh</p>
        </div>
      )}

      {/* File upload */}
      {imageInputMode === 'upload' && (
        <div>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 hover:bg-green-50/50 transition-all flex flex-col items-center gap-2 text-gray-500"
          >
            <Upload className="w-6 h-6" />
            <span className="text-sm">Bam de chon hinh anh</span>
            <span className="text-[10px] text-gray-400">JPG, PNG, WEBP</span>
          </button>
        </div>
      )}
    </div>
  );

  // --- Shared modal ---
  const renderModal = () => {
    if (!showModal) return null;
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '520px' }}>
          <div className="flex items-center justify-between mb-6">
            <h2>{editingField ? 'Sua canh dong' : 'Them canh dong'}</h2>
            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{formError}</div>
          )}
          <div className="space-y-4">
            {([['name', 'Ten *'], ['location', 'Vi tri *'], ['area', 'Dien tich (ha)'], ['cropType', 'Loai cay trong *']] as const).map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">{label}</label>
                <input value={(form as any)[key]} onChange={e => { setForm(prev => ({ ...prev, [key]: e.target.value })); setFormError(''); }} className="form-input" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Trang thai</label>
              <CustomSelect
                value={form.status}
                onChange={v => setForm(prev => ({ ...prev, status: v as Field['status'] }))}
                options={[
                  { value: 'active', label: 'Hoat dong' },
                  { value: 'inactive', label: 'Tam dung' },
                  { value: 'harvesting', label: 'Thu hoach' },
                ]}
              />
            </div>
            {renderImageSection()}
          </div>
          <div className="flex gap-3 mt-7">
            <button onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center">Huy</button>
            <button onClick={handleSave} className="btn-primary flex-1 justify-center">Luu</button>
          </div>
        </div>
      </div>
    );
  };

  // Detail view
  if (selectedField) {
    const fieldDevices = devices.filter(d => d.fieldId === selectedField.id);
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedField(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Quay lai danh sach
        </button>

        <div className="farm-card-static overflow-hidden">
          {/* Hero image area */}
          <div className="h-56 relative bg-gradient-to-br from-green-50 to-emerald-50">
            {selectedField.image ? (
              <>
                <ImageWithFallback src={selectedField.image} alt={selectedField.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <button
                    onClick={() => openEdit(selectedField)}
                    className="px-3 py-1.5 bg-white/90 backdrop-blur rounded-lg text-xs text-gray-700 hover:bg-white shadow flex items-center gap-1.5 transition-all"
                  >
                    <Edit className="w-3 h-3" /> Doi anh
                  </button>
                  <button
                    onClick={() => {
                      const updated = { ...selectedField, image: undefined };
                      setFieldList(prev => prev.map(f => f.id === selectedField.id ? updated : f));
                      setSelectedField(updated);
                    }}
                    className="px-3 py-1.5 bg-white/90 backdrop-blur rounded-lg text-xs text-red-600 hover:bg-red-50 shadow flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 className="w-3 h-3" /> Xoa anh
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <ImageIcon className="w-10 h-10 text-gray-300" />
                <button
                  onClick={() => openEdit(selectedField)}
                  className="btn-outline"
                  style={{ padding: '8px 20px' }}
                >
                  <ImageIcon className="w-4 h-4" /> Them hinh anh
                </button>
              </div>
            )}
            <div className="absolute top-4 right-4">{statusBadge(selectedField.status)}</div>
          </div>

          <div className="p-6">
            <h1 className="text-gray-800 mb-2">{selectedField.name}</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {[
                { l: 'Vi tri', v: selectedField.location, icon: <MapPin className="w-3.5 h-3.5 text-gray-400" /> },
                { l: 'Dien tich', v: `${selectedField.area} ha` },
                { l: 'Loai cay trong', v: selectedField.cropType },
                { l: 'Ngay tao', v: new Date(selectedField.createdAt).toLocaleDateString('vi-VN') },
              ].map(item => (
                <div key={item.l} className="bg-[#f8faf8] rounded-xl p-4 border border-green-50">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">{item.l}</p>
                  <p className="text-sm text-gray-800 mt-1.5 flex items-center gap-1">{item.icon}{item.v}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-gray-800 mb-3">Thiet bi ({fieldDevices.length})</h3>
              {fieldDevices.length === 0 ? (
                <p className="text-sm text-gray-400">Chua co thiet bi nao trong canh dong nay</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fieldDevices.map(d => (
                    <div key={d.id} className="flex items-center gap-3 p-3.5 bg-[#f8faf8] rounded-xl border border-green-50 transition-all hover:shadow-sm">
                      <span className={`w-2.5 h-2.5 rounded-full ${d.status === 'online' ? 'bg-green-500 shadow-sm shadow-green-300' : d.status === 'offline' ? 'bg-gray-300' : 'bg-red-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{d.name}</p>
                        <p className="text-xs text-gray-500">{d.type} {d.lastValue !== undefined ? `- ${d.lastValue}${d.unit}` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
              <button onClick={() => openEdit(selectedField)} className="action-btn edit" style={{ width: 'auto', borderRadius: '50px', padding: '8px 20px', gap: '6px' }}>
                <Edit className="w-4 h-4" /> Sua
              </button>
              <button onClick={() => setDeleteTarget(selectedField.id)} className="action-btn delete" style={{ width: 'auto', borderRadius: '50px', padding: '8px 20px', gap: '6px' }}>
                <Trash2 className="w-4 h-4" /> Xoa
              </button>
            </div>
          </div>
        </div>

        <ConfirmDialog
          open={!!deleteTarget}
          title="Xoa canh dong"
          message="Ban co chac chan muon xoa canh dong nay? Tat ca thiet bi lien quan cung se bi anh huong."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          confirmLabel="Xoa"
        />

        {renderModal()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Canh dong</h1>
          <p>Quan ly cac canh dong va khu vuc canh tac</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> Them canh dong
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {fieldList.map(f => {
          const fieldDevices = devices.filter(d => d.fieldId === f.id);
          return (
            <div key={f.id} className="farm-card overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-green-50 to-emerald-50 relative cursor-pointer" onClick={() => setSelectedField(f)}>
                {f.image ? (
                  <ImageWithFallback src={f.image} alt={f.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-3 right-3">{statusBadge(f.status)}</div>
              </div>
              <div className="p-5">
                <h3 className="text-gray-800 cursor-pointer hover:text-green-600 transition-colors" onClick={() => setSelectedField(f)}>{f.name}</h3>
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                  <MapPin className="w-3.5 h-3.5" /> {f.location}
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span>{f.area} ha</span>
                  <span>{f.cropType}</span>
                  <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> {fieldDevices.length}</span>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button onClick={() => setSelectedField(f)} className="action-btn view" title="Xem"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => openEdit(f)} className="action-btn edit" title="Sua"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(f.id)} className="action-btn delete" title="Xoa"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xoa canh dong"
        message="Ban co chac chan muon xoa canh dong nay? Hanh dong nay khong the hoan tac."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Xoa"
      />

      {renderModal()}
    </div>
  );
}
