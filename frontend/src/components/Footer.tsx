import React from 'react';
import { Logo } from './Logo';
import { MapPin, PhoneCall, Mail, Shield, Globe, ExternalLink } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 bg-brand-dark border-t border-brand-gold/30 text-slate-300 text-xs font-sans mt-auto">
      {/* Main footer body */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="cursor-pointer select-none" onClick={() => navigate('/')}>
              <Logo size="sm" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An official platform for citizens of Balochistan to report civic issues, track their resolution, and hold departments accountable.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50 text-[10px] uppercase font-bold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                System Online
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Home', path: '/' },
                { label: 'Public Complaint Feed', path: '/complaints' },
                { label: 'Report an Issue', path: '/complaints/new' },
                { label: 'My Complaints', path: '/complaints/mine' },
                { label: 'Sign In', path: '/login' },
                { label: 'Register', path: '/signup' },
              ].map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-slate-400 hover:text-brand-gold transition-colors duration-200 text-xs font-medium cursor-pointer flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand-gold/40 group-hover:bg-brand-gold transition-colors shrink-0" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Categories */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Service Categories</h4>
            <ul className="space-y-2">
              {[
                'Roads & Footpaths',
                'Garbage & Waste',
                'Water & Pipelines',
                'Power & Streetlights',
                'Public Structures',
                'Health & Sanitation',
                'Tree & Environment',
              ].map((cat) => (
                <li key={cat} className="text-slate-400 text-xs flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0" />
                  {cat}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Info */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-slate-400">
                <PhoneCall size={13} className="text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-300">Helpline</p>
                  <p>1800-CIVIC-OPS</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-slate-400">
                <Mail size={13} className="text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-300">Email</p>
                  <p>support@balochistan.gov.pk</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-slate-400">
                <MapPin size={13} className="text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-300">Headquarters</p>
                  <p>Civil Secretariat, Quetta,<br />Balochistan, Pakistan</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-slate-400">
                <Globe size={13} className="text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-300">Official Website</p>
                  <a
                    href="https://balochistan.gov.pk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-gold hover:underline flex items-center gap-1"
                  >
                    balochistan.gov.pk <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-brand-gold/10 bg-black/20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-[11px]">
            &copy; {year} Government of Balochistan &mdash; Citizen Complaint Portal. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Shield size={11} className="text-brand-gold" />
              <span>Official Government Platform</span>
            </div>
            <span className="text-slate-700">|</span>
            <span>Version 2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
