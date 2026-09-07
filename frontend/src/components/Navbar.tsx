import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import {
  FilePlus2,
  ListTodo,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Compass,
  Building2,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isCitizen = user?.role === 'citizen';
  const isOfficer = user?.role === 'officer';

  const getInitials = (name?: string) => {
    if (!name) return 'CP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-brand-dark border-b border-slate-700/80 text-brand-light shadow-md">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo with Official User Emblem */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => handleNav('/')}>
            <Logo size="sm" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-home-btn"
              onClick={() => handleNav('/')}
              className={`px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                currentPath === '/'
                  ? 'bg-brand-cyan/15 text-brand-cyan border-b-2 border-brand-cyan font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Home
            </button>

            <button
              id="nav-feed-btn"
              onClick={() => handleNav('/complaints')}
              className={`px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentPath === '/complaints'
                  ? 'bg-brand-cyan/15 text-brand-cyan border-b-2 border-brand-cyan font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Compass size={14} className="text-brand-cyan" />
              <span>Public Feed</span>
            </button>

            {isCitizen && (
              <>
                <button
                  id="nav-citizen-dashboard-btn"
                  onClick={() => handleNav('/dashboard')}
                  className={`px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
                    currentPath === '/dashboard'
                      ? 'bg-brand-cyan/15 text-brand-cyan border-b-2 border-brand-cyan font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <LayoutDashboard size={14} />
                  <span>Citizen Console</span>
                </button>

                <button
                  id="nav-report-btn"
                  onClick={() => handleNav('/complaints/new')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                    currentPath === '/complaints/new'
                      ? 'bg-brand-cyan text-brand-dark ring-2 ring-brand-cyan/50 font-black'
                      : 'bg-brand-cyan hover:bg-[#00c2bf] text-brand-dark hover:shadow-md'
                  }`}
                >
                  <FilePlus2 size={13} />
                  <span>Report Incident</span>
                </button>

                <button
                  id="nav-my-complaints-btn"
                  onClick={() => handleNav('/complaints/mine')}
                  className={`px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
                    currentPath === '/complaints/mine'
                      ? 'bg-brand-cyan/15 text-brand-cyan border-b-2 border-brand-cyan font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <ListTodo size={14} />
                  <span>My Records</span>
                </button>
              </>
            )}

            {isOfficer && (
              <button
                id="nav-officer-dashboard-btn"
                onClick={() => handleNav('/officer/dashboard')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                  currentPath.startsWith('/officer')
                    ? 'bg-brand-pink text-white ring-2 ring-brand-pink/50 font-black'
                    : 'bg-brand-pink hover:bg-[#e02656] text-white hover:shadow-md'
                }`}
              >
                <Building2 size={14} />
                <span>Officer Dashboard</span>
              </button>
            )}
          </nav>

          {/* User Auth Section Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-700">
                {/* User avatar and technical role info */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-brand-cyan/40 flex items-center justify-center text-xs font-mono font-bold text-brand-cyan shadow-xs">
                    {getInitials(user.name)}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5">
                      <span className="truncate max-w-[120px]">{user.name}</span>
                    </div>
                    <p className="text-[10px] text-brand-cyan font-mono leading-tight">
                      {isOfficer ? 'Officer/District-HQ' : 'Verified Resident'}
                    </p>
                  </div>
                </div>

                <button
                  id="nav-logout-btn"
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-brand-pink hover:bg-slate-800 rounded transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-login-btn"
                  onClick={() => handleNav('/login')}
                  className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  id="nav-signup-btn"
                  onClick={() => handleNav('/signup')}
                  className="px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider bg-brand-cyan hover:bg-[#00c2bf] text-brand-dark rounded-full shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck size={14} />
                  <span>Citizen Register</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="nav-mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-dark border-b border-slate-700 px-4 pt-2 pb-6 space-y-2">
          {user && (
            <div className="p-3 mb-2 rounded bg-slate-800/90 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-700 text-brand-cyan font-mono text-xs font-bold flex items-center justify-center border border-brand-cyan/30">
                  {getInitials(user.name)}
                </div>
                <div>
                  <p className="font-semibold text-xs text-white">{user.name}</p>
                  <p className="text-[10px] text-brand-cyan font-mono">{user.email}</p>
                </div>
              </div>
              <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
                {user.role}
              </span>
            </div>
          )}

          <button
            onClick={() => handleNav('/')}
            className="w-full text-left px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Home
          </button>
          <button
            onClick={() => handleNav('/complaints')}
            className="w-full text-left px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
          >
            <Compass size={14} className="text-brand-cyan" />
            <span>Public Incident Feed</span>
          </button>

          {isCitizen && (
            <>
              <button
                onClick={() => handleNav('/dashboard')}
                className="w-full text-left px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
              >
                <LayoutDashboard size={14} />
                <span>Citizen Dashboard</span>
              </button>
              <button
                onClick={() => handleNav('/complaints/new')}
                className="w-full text-left px-3 py-2 rounded text-xs font-bold uppercase tracking-wider text-brand-cyan hover:bg-slate-800 flex items-center gap-2"
              >
                <FilePlus2 size={14} />
                <span>Report Incident</span>
              </button>
              <button
                onClick={() => handleNav('/complaints/mine')}
                className="w-full text-left px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
              >
                <ListTodo size={14} />
                <span>My Complaints</span>
              </button>
            </>
          )}

          {isOfficer && (
            <button
              onClick={() => handleNav('/officer/dashboard')}
              className="w-full text-left px-3 py-2 rounded text-xs font-bold uppercase tracking-wider text-brand-pink hover:bg-slate-800 flex items-center gap-2"
            >
              <Building2 size={14} />
              <span>Officer Operations Console</span>
            </button>
          )}

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider text-brand-pink hover:bg-rose-950/30 flex items-center gap-2"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNav('/login')}
                  className="w-full py-2 text-center text-xs font-bold uppercase tracking-wider text-slate-300 bg-slate-800 rounded"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('/signup')}
                  className="w-full py-2 text-center text-xs font-bold uppercase tracking-wider text-brand-dark bg-brand-cyan rounded-full"
                >
                  Register Citizen Account
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
