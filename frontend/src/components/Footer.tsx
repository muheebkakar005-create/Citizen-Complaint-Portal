import React from 'react';
import { Logo } from './Logo';
<<<<<<< HEAD
import { MapPin, PhoneCall, Mail } from 'lucide-react';
=======
import { ShieldCheck, MapPin, PhoneCall, Mail, HeartHandshake } from 'lucide-react';
>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
<<<<<<< HEAD
    <footer className="bg-brand-dark border-t border-brand-gold/20 text-slate-300 text-xs mt-auto font-sans">
=======
    <footer className="bg-brand-dark border-t border-slate-700/80 text-slate-400 text-xs mt-auto font-sans">
>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="cursor-pointer select-none" onClick={() => navigate('/')}>
              <Logo size="sm" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
<<<<<<< HEAD
              An official platform for citizens of Balochistan to report civic issues, track their resolution, and hold departments accountable.
            </p>
=======
              Municipal telemetry platform for civic infrastructure repairs, automated duplicate clustering, and AI daily briefings.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-brand-cyan font-mono pt-1 uppercase">
              <span>● System Node: District-HQ Active</span>
            </div>
>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
<<<<<<< HEAD
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold-light">Quick Links</h4>
            <ul className="space-y-1.5 text-xs font-medium">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-brand-gold transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/complaints')} className="hover:text-brand-gold transition-colors cursor-pointer">
                  Public Complaint Feed
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/complaints/new')} className="hover:text-brand-gold transition-colors cursor-pointer">
                  Report a Complaint
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-brand-gold transition-colors cursor-pointer">
                  Sign In
=======
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
>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32
                </button>
              </li>
            </ul>
          </div>

          {/* Civic Services Covered */}
          <div className="space-y-2.5">
<<<<<<< HEAD
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold-light">Service Categories</h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
=======
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-200">Service Categories</h4>
            <ul className="space-y-1.5 text-xs text-slate-300 font-mono text-[11px]">
>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32
              <li>Roads & Footpaths</li>
              <li>Garbage & Waste</li>
              <li>Water & Pipelines</li>
              <li>Power & Streetlights</li>
              <li>Public Structures</li>
            </ul>
          </div>

          {/* Emergency & Municipal Contact */}
          <div className="space-y-2.5">
<<<<<<< HEAD
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold-light">Contact</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <PhoneCall size={13} className="text-brand-gold shrink-0" />
                <span>Helpline: 1800-CIVIC-OPS</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail size={13} className="text-brand-gold shrink-0" />
                <span>support@balochistan.gov.pk</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin size={13} className="text-brand-gold shrink-0" />
                <span>Government of Balochistan</span>
=======
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
>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32
              </div>
            </div>
          </div>
        </div>

<<<<<<< HEAD
        <div className="border-t border-brand-gold/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>&copy; {new Date().getFullYear()} Government of Balochistan. Your Voice, Our Priority.</p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-800 text-brand-gold border border-brand-gold/30 text-[10px] uppercase font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse"></span>
              Portal Active
=======
        <div className="border-t border-slate-700 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4 font-mono">
          <p>© {new Date().getFullYear()} Municipal Corporation. All incident records publicly auditable.</p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-800 text-brand-cyan border border-brand-cyan/30 text-[10px] uppercase font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
              Grid Live
>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
