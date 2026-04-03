import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Leaf, Eye, EyeOff, ArrowRight, Loader } from 'lucide-react';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (success) {
      navigate('/');
    } else {
      setError('Sai ten dang nhap hoac mat khau!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2b0f] via-[#1a3a1a] to-[#0f2b0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#22c55e]/5 blur-3xl" />
      <div className="absolute bottom-[-150px] left-[-100px] w-[400px] h-[400px] rounded-full bg-[#4ade80]/5 blur-3xl" />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-[#4ade80] to-[#22c55e] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-500/20" style={{ animation: 'float 4s ease-in-out infinite' }}>
            <Leaf className="w-8 h-8 text-[#0f2b0f]" />
          </div>
          <h1 className="text-white text-3xl tracking-tight">Smart Farm</h1>
          <p className="text-white/40 mt-2 text-sm">He thong quan ly nong trai thong minh</p>
        </div>

        {/* Login card */}
        <div className="farm-card-static p-8" style={{ borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h2 className="text-gray-800 text-center mb-8">Dang nhap</h2>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center" style={{ animation: 'slideUp 0.2s ease' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider">Ten dang nhap</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="form-input"
                placeholder="Nhap ten dang nhap"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider">Mat khau</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="form-input pr-12"
                  placeholder="Nhap mat khau"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-3" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Dang nhap...
                </>
              ) : (
                <>
                  Dang nhap <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 p-4 bg-green-50/80 rounded-xl border border-green-100">
            <p className="text-xs text-green-700 mb-2 uppercase tracking-wider">Tai khoan demo</p>
            <div className="text-sm text-green-800 space-y-1.5">
              <p className="flex items-center gap-2"><span className="px-2 py-0.5 bg-purple-200 rounded-full text-[10px] uppercase tracking-wider text-purple-700">Admin</span> admin / admin123</p>
              <p className="flex items-center gap-2"><span className="px-2 py-0.5 bg-orange-100 rounded-full text-[10px] uppercase tracking-wider text-orange-700">Manager</span> manager / manager123</p>
              <p className="flex items-center gap-2"><span className="px-2 py-0.5 bg-blue-100 rounded-full text-[10px] uppercase tracking-wider text-blue-700">Worker</span> worker / worker123</p>
              <p className="flex items-center gap-2"><span className="px-2 py-0.5 bg-green-200 rounded-full text-[10px] uppercase tracking-wider">Farmer</span> farmer / farmer123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
