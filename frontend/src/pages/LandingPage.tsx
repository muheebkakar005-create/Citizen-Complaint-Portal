import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Complaint } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Logo } from '../components/Logo';
import {
  ShieldAlert,
  ArrowRight,
  FilePlus2,
  Compass,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Building,
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
      {/* Hero Section - Technical Brand Dark Theme Full Width */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl bg-brand-dark text-white p-6 sm:p-10 lg:p-12 shadow-xl border border-slate-700"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
            className="lg:col-span-8 space-y-5"
          >
            {/* Prominent Emblem / Identity Banner */}
            <div className="flex flex-wrap items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan text-xs font-mono uppercase tracking-wider"
              >
                <ShieldAlert size={14} className="text-brand-cyan" />
                <span>Civic Incident Grid & Operations Infrastructure</span>
              </motion.div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-pink/15 border border-brand-pink/30 text-brand-pink text-[11px] font-mono font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-ping"></span>
                <span>District Node Live</span>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                Report. <span className="text-brand-cyan">Prioritize.</span> <span className="text-brand-pink">Resolve.</span>
              </h1>
              <p className="text-xs sm:text-sm font-mono text-slate-400">
                Official Municipal Civic Grievance & Public Redressal Network
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed max-w-2xl">
              A high-fidelity civic telemetry platform where residents register local infrastructure problems, duplicate detections avoid wasted municipal resources, and AI daily briefings optimize field crew dispatch.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <motion.button
                id="hero-report-btn"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(user ? '/complaints/new' : '/login')}
                className="px-6 py-3 rounded-full bg-brand-cyan hover:bg-[#00c2bf] text-brand-dark font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <FilePlus2 size={16} />
                <span>Report Incident</span>
              </motion.button>

              <motion.button
                id="hero-browse-btn"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/complaints')}
                className="px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-brand-light font-semibold text-xs uppercase tracking-wider border border-slate-600 hover:border-brand-cyan shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Compass size={16} className="text-brand-cyan" />
                <span>Explore Incident Grid</span>
              </motion.button>

              {!user && (
                <motion.button
                  id="hero-login-btn"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/login')}
                  className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-brand-cyan transition-colors cursor-pointer"
                >
                  Sign In
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Right Column: Live Civic Telemetry Widget with Official Emblem */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
            whileHover={{ y: -3 }}
            className="lg:col-span-4 w-full bg-slate-900/90 border border-slate-700/90 rounded-xl p-5 font-mono text-xs text-slate-300 space-y-4 shadow-2xl transition-shadow"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Logo size="sm" showText={false} />
                <span className="text-brand-cyan font-bold tracking-widest text-[11px] uppercase">Telemetry Status</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                <p className="text-[10px] text-slate-400 uppercase">Avg SLA</p>
                <p className="text-lg font-bold text-white">48h</p>
                <p className="text-[9px] text-emerald-400">92% On-Target</p>
              </div>
              <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                <p className="text-[10px] text-slate-400 uppercase">AI Triage</p>
                <p className="text-lg font-bold text-brand-cyan">Automated</p>
                <p className="text-[9px] text-slate-400">Dynamic Score</p>
              </div>
              <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                <p className="text-[10px] text-slate-400 uppercase">Deduplication</p>
                <p className="text-lg font-bold text-white">100%</p>
                <p className="text-[9px] text-slate-400">Ward Matching</p>
              </div>
              <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
                <p className="text-[10px] text-slate-400 uppercase">Escalation</p>
                <p className="text-lg font-bold text-brand-pink">Priority-Based</p>
                <p className="text-[9px] text-brand-cyan font-semibold">Citizen Upvotes</p>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800">
              <span className="text-slate-300">District Protocol v2.4</span>
              <span className="text-brand-cyan font-semibold">Officer Auto-Briefing</span>
            </div>
          </motion.div>
        </div>

        {/* Decorative backdrop symbol */}
        <div className="absolute right-[-40px] bottom-[-40px] opacity-10 pointer-events-none">
          <Logo size="lg" showText={false} />
        </div>
      </motion.section>

      {/* 4 Feature Points - Technical Grid Style */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            tag: 'Duplicate Engine',
            title: 'Ward Deduplication',
            desc: 'Real-time clustering alerts users if a pothole or streetlight issue in their ward has already been reported.'
          },
          {
            tag: 'Priority Scoring',
            title: 'Dynamic Priority Formula',
            desc: 'Formula (Upvotes × 2) + Days ensures aging issues and heavily-backed incidents naturally escalate.'
          },
          {
            tag: 'AI Synthesis',
            title: 'Officer Daily Briefings',
            desc: 'Automated Gemini 2.5 summaries isolate emergency hotspots, workload bottlenecks, and district metrics.'
          },
          {
            tag: 'Accountability',
            title: '5-Star Feedback Loop',
            desc: 'Citizens rate repair quality directly, holding municipal agencies accountable to public satisfaction scores.'
          }
        ].map((feat, idx) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.06, duration: 0.3 }}
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' }}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 cursor-default transition-colors"
          >
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{feat.tag}</div>
            <p className="text-sm font-bold text-slate-900">{feat.title}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Recent Complaints Preview Data Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Recent Community Incidents</h2>
            <p className="text-xs text-slate-400 font-mono">Live feed of citizen tickets across municipal wards</p>
          </div>
          <motion.button
            id="view-all-complaints-btn"
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/complaints')}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 hover:text-brand-dark transition-colors cursor-pointer"
          >
            <span>View Public Registry</span>
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
                transition={{ delay: idx * 0.04, duration: 0.25 }}
                whileHover={{ y: -5, borderColor: '#08D9D6', boxShadow: '0 8px 24px rgba(8,217,214,0.12)' }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/complaints/${complaint._id}`)}
                className="p-5 rounded-2xl bg-white border border-slate-200 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
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

                  <div className="inline-flex items-center gap-1 font-bold text-slate-900 bg-brand-cyan/20 border border-brand-cyan/40 px-2.5 py-0.5 rounded-full text-xs font-mono">
                    <ThumbsUp size={11} className="text-teal-700" />
                    <span>{complaint.upvotes}</span>
                  </div>
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
          className="px-5 py-2.5 rounded-full bg-brand-cyan hover:bg-[#00c2bf] text-brand-dark font-extrabold text-xs uppercase tracking-wider transition-colors shrink-0 shadow-md cursor-pointer"
        >
          Open Sign In
        </motion.button>
      </motion.section>
    </div>
  );
};
