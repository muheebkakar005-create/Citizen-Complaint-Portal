import React from 'react';
import { Logo } from './Logo';
import { ShieldCheck, MapPin, PhoneCall, Mail, HeartHandshake } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-brand-dark border-t border-slate-700/80 text-slate-400 text-xs mt-auto font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="cursor-pointer select-none" onClick={() => navigate('/')}>
              <Logo size="sm" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Municipal telemetry platform for civic infrastructure repairs, automated duplicate clustering, and AI daily briefings.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-brand-cyan font-mono pt-1 uppercase">
              <span>● System Node: District-HQ Active</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-200">Terminal Links</h4>
            <ul className="space-y-1.5 text-xs font-medium">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-brand-cyan transition-colors cursor-pointer">
                  System Overview
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/complaints')} className="hover:text-brand-cyan transition-colors cursor-pointer">
                  Incident Grid
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/complaints/new')} className="hover:text-brand-cyan transition-colors cursor-pointer">
                  Report Incident
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-brand-cyan transition-colors cursor-pointer">
                  Operator Sign In
                </button>
              </li>
            </ul>
          </div>

          {/* Civic Services Covered */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-200">Service Categories</h4>
            <ul className="space-y-1.5 text-xs text-slate-300 font-mono text-[11px]">
              <li>Roads & Footpaths</li>
              <li>Garbage & Waste</li>
              <li>Water & Pipelines</li>
              <li>Power & Streetlights</li>
              <li>Public Structures</li>
            </ul>
          </div>

          {/* Emergency & Municipal Contact */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-200">Operations Center</h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <PhoneCall size={13} className="text-brand-cyan shrink-0" />
                <span>24/7 Helpline: 1800-CIVIC-OPS</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail size={13} className="text-brand-cyan shrink-0" />
                <span>ops@municipalgrid.gov</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin size={13} className="text-brand-cyan shrink-0" />
                <span>District HQ, Civic Center</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4 font-mono">
          <p>© {new Date().getFullYear()} Municipal Corporation. All incident records publicly auditable.</p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-800 text-brand-cyan border border-brand-cyan/30 text-[10px] uppercase font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
              Grid Live
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
