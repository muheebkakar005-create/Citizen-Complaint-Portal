import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Complaint } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Logo } from '../components/Logo';
import {
  ArrowRight,
  FilePlus2,
  Compass,
  Search,
  MessageSquare,
  ShieldCheck,
  Users,
  ThumbsUp,
  MapPin,
  Calendar
} from 'lucide-react';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getComplaints({ sort: 'newest' })
      .then(res => {
        if (mounted && res.success) {
          setRecentComplaints(res.complaints.slice(0, 8));
        }
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const formatTicketId = (rawId: string) => {
    if (rawId.startsWith('cmp_')) {
      const num = rawId.replace('cmp_', '');
      return `#CP-${num.padStart(4, '0')}`;
    }
    return `#CP-${rawId.slice(-4).toUpperCase()}`;
  };

  return (
    <div className="w-full space-y-10 py-6 font-sans">
      {/* Hero Section - Government of Balochistan brand with responsive background */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl text-brand-dark p-6 sm:p-10 lg:p-14 shadow-2xl border border-brand-gold/30 bg-brand-cream/80 min-h-[480px] lg:min-h-[520px] flex items-center"
      >
        {/* Responsive Background Layer: Mobile = bg-mobile.jpg ONLY, PC = bg-pc.jpg */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          {/* Mobile Image: strictly for mobile UI (< md) */}
          <div
            className="block md:hidden w-full h-full bg-cover bg-top bg-no-repeat"
            style={{ backgroundImage: "url('/bg-mobile.jpg')" }}
          />
          {/* PC Desktop Image: strictly for PC / Desktop UI (>= md) */}
          <div
            className="hidden md:block w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/bg-pc.jpg')" }}
          />
          {/* Directional contrast gradients for guaranteed readability */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/10" />
          <div className="block md:hidden absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 to-white/30" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-5 bg-white/80 sm:bg-white/70 md:bg-white/80 lg:bg-transparent backdrop-blur-xs md:backdrop-blur-none p-5 sm:p-6 md:p-6 lg:p-0 rounded-2xl lg:rounded-none border border-white/60 lg:border-0 shadow-sm lg:shadow-none"
          >
            {/* Tagline strip */}
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-brand-green">
              <span className="w-6 h-[2px] bg-brand-gold"></span>
              <span>A Cleaner &bull; Safer &bull; Stronger Balochistan</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                <span className="text-brand-dark">Citizen Complaint</span>
                <br />
                <span className="text-brand-green">Portal</span>
              </h1>
              <p className="text-lg sm:text-2xl font-bold text-brand-dark pt-1">Your Voice Matters</p>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-brand-gold">
                Report &bull; Track &bull; Resolve
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-xl font-medium">
              Help us build a better Balochistan by reporting issues, tracking their progress in real-time, and being part of the change in your community.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <motion.button
                id="hero-report-btn"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(user ? '/complaints/new' : '/login')}
                className="px-6 py-3 rounded-full bg-brand-green-deep hover:bg-brand-green text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                <FilePlus2 size={16} />
                <span>Report a Complaint</span>
                <ArrowRight size={14} />
              </motion.button>

              <motion.button
                id="hero-browse-btn"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/complaints')}
                className="px-6 py-3 rounded-full bg-white hover:bg-brand-green/5 text-brand-green font-bold text-xs sm:text-sm uppercase tracking-wider border-2 border-brand-green shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Search size={16} />
                <span>Track Your Complaint</span>
              </motion.button>

              {!user && (
                <motion.button
                  id="hero-login-btn"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/login')}
                  className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-brand-green hover:text-brand-green-deep transition-colors cursor-pointer bg-white/70 hover:bg-white rounded-full border border-brand-green/30 shadow-xs"
                >
                  Sign In
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Right Column: Emblem showcase framing the Assembly architecture */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
            transition={{
              opacity: { duration: 0.45, delay: 0.15, ease: 'easeOut' },
              x: { duration: 0.45, delay: 0.15, ease: 'easeOut' },
              y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
            }}
            whileHover={{ scale: 1.02 }}
            className="lg:col-span-5 w-full flex flex-col items-center justify-center gap-4"
          >
            <div className="bg-white/85 border border-brand-gold/40 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 backdrop-blur-md">
              <Logo size="hero" showText={false} />
              <p className="text-xs font-bold uppercase tracking-widest text-brand-green text-center">
                Government of Balochistan
              </p>
              <div className="w-full grid grid-cols-2 gap-3 pt-2">
                <div className="bg-brand-green-deep text-white p-3 rounded-xl text-center shadow-sm">
                  <p className="text-lg font-bold">Report</p>
                  <p className="text-[10px] text-brand-gold-light uppercase tracking-wider">Register in minutes</p>
                </div>
                <div className="bg-brand-gold text-brand-dark p-3 rounded-xl text-center shadow-sm">
                  <p className="text-lg font-bold">Track</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold">Stay informed live</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Quick Services strip */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-brand-dark">Quick Services</h2>
          <p className="text-xs text-slate-500">Fast. Transparent. Citizen Focused.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: FilePlus2, title: 'Easy Registration', desc: 'Create your account in minutes', color: 'bg-brand-green-deep' },
            { icon: Search, title: 'Track Progress', desc: 'Stay informed in real-time', color: 'bg-blue-700' },
            { icon: ShieldCheck, title: 'Transparent Process', desc: 'Accountability & fairness', color: 'bg-brand-gold' },
            { icon: Users, title: 'Better Services', desc: 'For a stronger Balochistan', color: 'bg-emerald-700' }
          ].map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.06, duration: 0.3 }}
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' }}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 cursor-default transition-colors flex items-start gap-3"
            >
              <div className={`w-11 h-11 shrink-0 rounded-full ${feat.color} text-white flex items-center justify-center shadow-sm`}>
                <feat.icon size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{feat.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Complaints Preview Data Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Recent Complaints</h2>
            <p className="text-xs text-slate-400">Live feed of citizen complaints across Balochistan</p>
          </div>
          <motion.button
            id="view-all-complaints-btn"
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/complaints')}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 hover:text-brand-dark transition-colors cursor-pointer"
          >
            <span>View Public Feed</span>
            <ArrowRight size={13} />
          </motion.button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-44 rounded-2xl bg-white animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500">
            No complaints recorded yet. Be the first citizen to file an issue!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {recentComplaints.map((complaint, idx) => (
              <motion.div
                key={complaint._id}
                id={`recent-complaint-${complaint._id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.28, ease: 'easeOut' }}
                whileHover={{ y: -6, borderColor: '#c9a227', boxShadow: '0 14px 30px -8px rgba(11, 61, 44, 0.12), 0 4px 14px rgba(201, 162, 39, 0.15)' }}
                whileTap={{ scale: 0.985 }}
                onClick={() => navigate(`/complaints/${complaint._id}`)}
                className="p-5 rounded-2xl bg-white/95 backdrop-blur-xs border border-slate-200 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">
                        {formatTicketId(complaint._id)}
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {complaint.category}
                      </span>
                      <PriorityBadge priority={complaint.priority} score={complaint.priorityScore} size="sm" />
                    </div>
                    <StatusBadge status={complaint.status} size="sm" />
                  </div>

                  <h3 className="font-semibold text-slate-900 text-base group-hover:text-teal-700 transition-colors line-clamp-1">
                    {complaint.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {complaint.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                      <MapPin size={12} className="text-slate-400" />
                      {complaint.area}
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <Calendar size={12} />
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.88 }}
                    className="inline-flex items-center gap-1 font-bold text-slate-900 bg-brand-cyan/20 border border-brand-cyan/40 px-2.5 py-0.5 rounded-full text-xs font-mono transition-colors group-hover:bg-brand-gold/30"
                  >
                    <ThumbsUp size={11} className="text-teal-700" />
                    <span>{complaint.upvotes}</span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Demo Credentials Helper Card */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-brand-dark text-white p-6 border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm text-brand-cyan uppercase tracking-wider">
            <MessageSquare size={16} />
            <span>Fast Evaluation Credentials</span>
          </div>
          <p className="text-xs text-slate-300 font-light">
            Instant 1-click test credentials for both <strong>Citizen</strong> and <strong>Government Officer</strong> accounts on the sign-in terminal.
          </p>
        </div>
        <motion.button
          id="demo-banner-login-btn"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/login')}
          className="px-5 py-2.5 rounded-full bg-brand-cyan hover:bg-brand-gold-light text-brand-dark font-extrabold text-xs uppercase tracking-wider transition-colors shrink-0 shadow-md cursor-pointer"
        >
          Open Sign In
        </motion.button>
      </motion.section>
    </div>
  );
};
