import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Logo } from '../components/Logo';
import { ShieldCheck, User, Building2, LogIn, AlertCircle, Sparkles } from 'lucide-react';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await api.login({ email, password });
      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        if (res.user.role === 'officer') {
          navigate('/officer/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch {
      setError('Unable to reach authentication server. Please check your network.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setSubmitting(true);

    try {
      const res = await api.login({ email: demoEmail, password: demoPass });
      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        if (res.user.role === 'officer') {
          navigate('/officer/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.message || 'Failed to authenticate demo user.');
      }
    } catch {
      setError('Connection error during demo sign-in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 font-sans">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Header with Official Emblem */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo size="md" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 uppercase tracking-tight">System Authentication Terminal</h1>
          <p className="text-xs text-slate-500 font-mono">
            Citizen telemetry credentials & district officer console login
          </p>
        </div>

        {/* Demo Fast Logins */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            <Sparkles size={12} className="text-teal-700" />
            <span>Fast Evaluation Credentials:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              id="quick-login-citizen-btn"
              type="button"
              onClick={() => handleQuickLogin('sarah.citizen@example.com', 'Citizen@123')}
              disabled={submitting}
              className="px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <User size={12} className="text-teal-700" />
              <span>Citizen Demo</span>
            </button>
            <button
              id="quick-login-officer-btn"
              type="button"
              onClick={() => handleQuickLogin('officer@citygov.gov', 'Officer@123')}
              disabled={submitting}
              className="px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-brand-dark hover:bg-slate-800 text-brand-cyan border border-brand-cyan/40 shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Building2 size={12} className="text-brand-cyan" />
              <span>Officer Demo</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-brand-pink/10 border border-brand-pink/30 text-brand-pink text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-brand-pink" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              Registered Email Address
            </label>
            <input
              id="login-email-input"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="operator@citygov.gov or citizen@example.com"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-cyan outline-none bg-slate-50 focus:bg-white text-slate-800 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              Password
            </label>
            <input
              id="login-password-input"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-cyan outline-none bg-slate-50 focus:bg-white text-slate-800 transition-colors"
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-full bg-brand-cyan hover:bg-[#00c2bf] text-brand-dark font-black text-xs uppercase tracking-wider shadow-md hover:shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
          >
            <LogIn size={14} />
            <span>{submitting ? 'Verifying...' : 'Authenticate'}</span>
          </button>
        </form>

        {/* Register Prompt */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>New citizen resident? </span>
          <button
            onClick={() => navigate('/signup')}
            className="font-bold text-teal-700 hover:text-brand-pink uppercase tracking-wider cursor-pointer"
          >
            Register Account
          </button>
        </div>
      </div>
    </div>
  );
};
