import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Compass,
  Plus,
  ListTodo,
  LayoutDashboard,
  Building2,
  ShieldCheck,
  User,
  LogIn
} from 'lucide-react';

interface MobileBottomNavProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentPath, navigate }) => {
  const { user } = useAuth();

  const isCitizen = user?.role === 'citizen';
  const isOfficer = user?.role === 'officer';
  const isAdmin = user?.role === 'admin';

  // Determine destination for "My Activity / Dashboard" tab
  let dashboardPath = '/login';
  let dashboardLabel = 'Console';
  let DashboardIcon = LayoutDashboard;

  if (isCitizen) {
    dashboardPath = '/complaints/mine';
    dashboardLabel = 'My Records';
    DashboardIcon = ListTodo;
  } else if (isOfficer) {
    dashboardPath = '/officer/dashboard';
    dashboardLabel = 'Officer';
    DashboardIcon = Building2;
  } else if (isAdmin) {
    dashboardPath = '/admin/dashboard';
    dashboardLabel = 'Admin';
    DashboardIcon = ShieldCheck;
  }

  const isHomeActive = currentPath === '/';
  const isFeedActive = currentPath === '/complaints';
  const isReportActive = currentPath === '/complaints/new';
  const isDashActive =
    currentPath === dashboardPath ||
    (isOfficer && currentPath.startsWith('/officer')) ||
    (isAdmin && currentPath.startsWith('/admin')) ||
    (isCitizen && currentPath === '/dashboard');
  const isAuthActive = currentPath === '/login' || currentPath === '/signup';

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-dark/95 backdrop-blur-lg border-t border-slate-700/80 shadow-[0_-8px_25px_rgba(0,0,0,0.35)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Home */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => navigate('/')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            isHomeActive
              ? 'text-brand-cyan'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Home size={19} strokeWidth={isHomeActive ? 2.5 : 2} />
            {isHomeActive && (
              <motion.span
                layoutId="mobileNavDot"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-cyan rounded-full"
              />
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight mt-1">Home</span>
        </motion.button>

        {/* 2. Feed */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => navigate('/complaints')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            isFeedActive
              ? 'text-brand-cyan'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Compass size={19} strokeWidth={isFeedActive ? 2.5 : 2} />
            {isFeedActive && (
              <motion.span
                layoutId="mobileNavDot"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-cyan rounded-full"
              />
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight mt-1">Explore</span>
        </motion.button>

        {/* 3. Center Elevated Report Button */}
        <div className="relative -top-3.5 flex flex-col items-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(user ? '/complaints/new' : '/login')}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer border-2 ${
              isReportActive
                ? 'bg-brand-gold text-brand-dark border-white shadow-brand-gold/40'
                : 'bg-brand-cyan hover:bg-brand-gold text-brand-dark border-slate-900 shadow-brand-cyan/40'
            }`}
            title="Report Civic Issue"
          >
            <Plus size={24} strokeWidth={3} />
          </motion.button>
          <span className="text-[9px] font-black uppercase tracking-wider text-brand-cyan mt-0.5">
            Report
          </span>
        </div>

        {/* 4. Dashboard / Records */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => navigate(dashboardPath)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            isDashActive
              ? 'text-brand-cyan'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <DashboardIcon size={19} strokeWidth={isDashActive ? 2.5 : 2} />
            {isDashActive && (
              <motion.span
                layoutId="mobileNavDot"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-cyan rounded-full"
              />
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight mt-1">{dashboardLabel}</span>
        </motion.button>

        {/* 5. Account / Profile */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => navigate(user ? (isCitizen ? '/dashboard' : dashboardPath) : '/login')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            isAuthActive
              ? 'text-brand-cyan'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            {user ? (
              <div className="w-5 h-5 rounded-full bg-brand-cyan/20 border border-brand-cyan/50 text-brand-cyan text-[10px] font-mono font-black flex items-center justify-center">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            ) : (
              <LogIn size={19} strokeWidth={isAuthActive ? 2.5 : 2} />
            )}
            {isAuthActive && (
              <motion.span
                layoutId="mobileNavDot"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-cyan rounded-full"
              />
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight mt-1">
            {user ? 'Account' : 'Sign In'}
          </span>
        </motion.button>
      </div>
    </nav>
  );
};
