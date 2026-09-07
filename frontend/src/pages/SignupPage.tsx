import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Logo } from '../components/Logo';
import { UserCheck, AlertCircle } from 'lucide-react';

interface SignupPageProps {
  navigate: (path: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ navigate }) => {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.signup({ name, email, password, confirmPassword });
      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed. Please review your input.');
      }
    } catch {
      setError('Failed to reach registration server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 font-sans">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo size="md" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Citizen Resident Registration</h1>
          <p className="text-xs text-slate-500 font-mono">
            Create verified credentials to file civic incidents, upvote local problems, and rate repairs
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-brand-pink/10 border border-brand-pink/30 text-brand-pink text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-brand-pink" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Full Legal Name</label>
            <input
              id="signup-name-input"
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Jane Doe"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-cyan outline-none bg-slate-50 focus:bg-white text-slate-800 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Email Address</label>
            <input
              id="signup-email-input"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g., resident@example.com"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-cyan outline-none bg-slate-50 focus:bg-white text-slate-800 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Create Password (Min 6 chars)</label>
            <input
              id="signup-password-input"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-cyan outline-none bg-slate-50 focus:bg-white text-slate-800 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Confirm Password</label>
            <input
              id="signup-confirm-password-input"
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-cyan outline-none bg-slate-50 focus:bg-white text-slate-800 transition-colors"
            />
          </div>

          <button
            id="signup-submit-btn"
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-full bg-brand-cyan hover:bg-[#00c2bf] text-brand-dark font-black text-xs uppercase tracking-wider shadow-md hover:shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
          >
            <span>{submitting ? 'Creating Account...' : 'Register Account'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Already registered? </span>
          <button
            onClick={() => navigate('/login')}
            className="font-bold text-teal-700 hover:text-brand-pink uppercase tracking-wider cursor-pointer"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
};
