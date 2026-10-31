import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeSelector from '../components/common/ThemeSelector';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please provide both username and password');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Top right Theme Selector */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeSelector compact={false} />
      </div>

      {/* Dynamic Background Glows */}
      <div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ backgroundColor: 'var(--accent-color)' }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ backgroundColor: 'var(--accent-hover)' }}
      />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div
            className="inline-flex p-3 rounded-2xl shadow-xl mb-2 transition-transform hover:scale-105"
            style={{
              background: 'var(--accent-gradient)',
              boxShadow: '0 8px 24px var(--accent-glow)',
            }}
          >
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            AttendFlow
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Next-Gen Multi-Factor Attendance & Verification System
          </p>
        </div>

        {/* Login Card */}
        <div
          className="glass-panel rounded-3xl p-8 border shadow-2xl space-y-6"
          style={{
            backgroundColor: 'var(--bg-glass)',
            borderColor: 'var(--border-color)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Username or Employee ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin / hr / emp001"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--input-text)',
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--input-text)',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl text-white text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
              style={{
                background: 'var(--accent-gradient)',
                boxShadow: '0 8px 20px -4px var(--accent-glow)',
              }}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t space-y-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
              <span>Quick Test Accounts</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="p-2 rounded-xl border font-medium text-center transition hover:scale-102"
                style={{
                  backgroundColor: 'var(--bg-glass-card)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="font-bold" style={{ color: 'var(--accent-color)' }}>Admin</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>admin123</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('hr', 'hr123')}
                className="p-2 rounded-xl border font-medium text-center transition hover:scale-102"
                style={{
                  backgroundColor: 'var(--bg-glass-card)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="font-bold text-emerald-500">HR</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>hr123</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('emp001', 'emp123')}
                className="p-2 rounded-xl border font-medium text-center transition hover:scale-102"
                style={{
                  backgroundColor: 'var(--bg-glass-card)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="font-bold text-purple-500">Employee</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>emp123</div>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>
          Powered by Geofence • Biometrics • Dynamic Rotating QR
        </p>
      </div>
    </div>
  );
};

export default Login;
