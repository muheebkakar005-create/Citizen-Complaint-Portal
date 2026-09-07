import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Complaint, ComplaintCategory, PriorityLevel, ComplaintStatus, OfficerStats, SatisfactionStats } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  RotateCw,
  Search,
  Download,
  AlertTriangle,
  Star
} from 'lucide-react';

interface OfficerDashboardProps {
  navigate: (path: string) => void;
}

const CATEGORIES: ('All' | ComplaintCategory)[] = ['All', 'Road', 'Garbage', 'Water', 'Electricity', 'Other'];
const STATUSES: ('All' | ComplaintStatus)[] = ['All', 'pending', 'in-progress', 'resolved'];
const PRIORITIES: ('All' | PriorityLevel)[] = ['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({ navigate }) => {
  const { user } = useAuth();

  // State
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<OfficerStats | null>(null);
  const [satisfaction, setSatisfaction] = useState<SatisfactionStats | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);
  const [generatedAt, setGeneratedAt] = useState<string>('');

  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Table Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | ComplaintCategory>('All');
  const [status, setStatus] = useState<'All' | ComplaintStatus>('All');
  const [priority, setPriority] = useState<'All' | PriorityLevel>('All');
  const [area, setArea] = useState('All');

  // Load briefing & stats
  const fetchBriefing = async () => {
    setLoadingBriefing(true);
    try {
      const res = await api.getOfficerSummary();
      if (res.success) {
        setAiSummary(res.summary);
        setIsAiGenerated(res.isAiGenerated);
        setGeneratedAt(res.generatedAt);
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Error fetching briefing:', err);
    } finally {
      setLoadingBriefing(false);
    }
  };

  // Load satisfaction
  const fetchSatisfaction = async () => {
    try {
      const res = await api.getSatisfactionStats();
      if (res.success) {
        setSatisfaction(res);
      }
    } catch (err) {
      console.error('Error fetching satisfaction stats:', err);
    }
  };

  // Load complaints for table
  const fetchTableComplaints = () => {
    setLoadingComplaints(true);
    api.getComplaints({
      search: search.trim() || undefined,
      category: category !== 'All' ? category : undefined,
      status: status !== 'All' ? status : undefined,
      priority: priority !== 'All' ? priority : undefined,
      area: area !== 'All' ? area : undefined,
      sort: 'priority'
    })
      .then(res => {
        if (res.success) {
          setComplaints(res.complaints);
        } else {
          setError('Failed to fetch table records.');
        }
      })
      .catch(() => {
        setError('Network error fetching officer table.');
      })
      .finally(() => {
        setLoadingComplaints(false);
      });
  };

  useEffect(() => {
    fetchBriefing();
    fetchSatisfaction();
  }, []);

  useEffect(() => {
    fetchTableComplaints();
  }, [category, status, priority, area]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTableComplaints();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Export CSV handler
  const handleExportCsv = () => {
    const url = api.getExportUrl({
      search: search.trim() || undefined,
      category: category !== 'All' ? category : undefined,
      status: status !== 'All' ? status : undefined,
      priority: priority !== 'All' ? priority : undefined,
      area: area !== 'All' ? area : undefined
    });
    const token = localStorage.getItem('token');
    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.blob())
      .then(blob => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `municipal_complaints_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(err => {
        alert('Failed to download CSV export.');
        console.error(err);
      });
  };

  // Format ID for technical display
  const formatTicketId = (rawId: string) => {
    if (rawId.startsWith('cmp_')) {
      const num = rawId.replace('cmp_', '');
      return `#CP-${num.padStart(4, '0')}`;
    }
    return `#CP-${rawId.slice(-4).toUpperCase()}`;
  };

  return (
    <div className="space-y-6 py-6 font-sans">
      {/* Top Header / Navbar Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping"></div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-800 uppercase tracking-tight">
                Complaint Oversight
              </h1>
              <span className="text-slate-400">/</span>
              <span className="text-xs sm:text-sm text-slate-500 font-mono">District Operations Monitor</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Active Officer: <span className="text-slate-700 font-semibold">{user?.name || 'Chief Officer'}</span> (Admin/District-HQ)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search input with rounded-full technical styling */}
          <div className="relative flex-1 md:w-64">
            <Search size={14} className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search records..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none"
            />
          </div>

          <button
            id="officer-refresh-briefing-btn"
            onClick={() => {
              fetchBriefing();
              fetchSatisfaction();
              fetchTableComplaints();
            }}
            disabled={loadingBriefing}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
            title="Refresh Briefing & Data"
          >
            <RotateCw size={14} className={loadingBriefing ? 'animate-spin text-teal-600' : ''} />
          </button>

          {/* Export CSV Button */}
          <button
            id="officer-export-csv-btn"
            onClick={handleExportCsv}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-colors shrink-0"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* AI Briefing & Quick Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Briefing Card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: -3 }}
          className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden flex flex-col justify-between space-y-4"
        >
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-brand-cyan text-slate-900 text-[10px] font-black uppercase rounded tracking-wider">
                  AI BRIEFING
                </span>
                <span className="text-[11px] text-slate-300/80 font-mono">
                  {isAiGenerated ? 'Gemini 2.5 Flash' : 'Synthesized Analytics'}
                </span>
              </div>
              {generatedAt && (
                <span className="text-[11px] text-slate-400 italic">
                  Generated {new Date(generatedAt).toLocaleTimeString()}
                </span>
              )}
            </div>

            {loadingBriefing ? (
              <div className="space-y-2 py-3">
                <div className="h-4 bg-indigo-800/40 rounded w-full animate-pulse" />
                <div className="h-4 bg-indigo-800/40 rounded w-4/5 animate-pulse" />
              </div>
            ) : (
              <p className="text-sm sm:text-base leading-relaxed font-light text-slate-100">
                {aiSummary || 'Synthesizing civic incident intelligence...'}
              </p>
            )}
          </div>

          {/* District Highlights Bar */}
          {stats && (
            <div className="relative z-10 pt-3 border-t border-slate-700/60 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Primary Hotspot:</span>
                <span className="text-brand-cyan font-medium">
                  {stats.hotspotAreas[0]?.area || 'Downtown'} ({stats.hotspotAreas[0]?.count || 0} issues)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Top Department:</span>
                <span className="text-brand-cyan font-medium">
                  {stats.topCategories[0]?.category || 'Road'} ({stats.topCategories[0]?.count || 0} issues)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Critical Queue:</span>
                <span className="text-brand-pink font-medium font-mono">
                  {stats.critical} Critical Incidents
                </span>
              </div>
            </div>
          )}

          {/* Background Decorative Icon */}
          <svg className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-10 text-white pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
          </svg>
        </motion.div>

        {/* 4 Stats Grid Cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.25 }}
            whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center transition-all cursor-default"
          >
            <div className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">New Reports</div>
            <div className="text-2xl font-bold text-slate-900">{stats?.newToday ?? 0}</div>
            <div className="text-[10px] text-emerald-500 font-bold mt-0.5">Filed last 24h</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.25 }}
            whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center transition-all cursor-default"
          >
            <div className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Critical</div>
            <div className="text-2xl font-bold text-brand-pink">{stats?.critical ?? 0}</div>
            <div className="text-[10px] text-brand-pink font-bold mt-0.5">Urgent Risk Queue</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.25 }}
            whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center transition-all cursor-default"
          >
            <div className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Resolved</div>
            <div className="text-2xl font-bold text-emerald-600">{stats?.resolved ?? 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{stats?.resolvedThisWeek ?? 0} this week</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.25 }}
            whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center transition-all cursor-default"
          >
            <div className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Satisfaction</div>
            <div className="text-2xl font-bold text-teal-700">
              {satisfaction?.averageSatisfaction || '4.5'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Citizen Rating / 5.0</div>
          </motion.div>
        </div>
      </div>

      {/* Escalated Low-Rated Notice (if any) */}
      {satisfaction && satisfaction.lowRatedComplaints.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 space-y-2">
          <div className="flex items-center gap-2 text-red-800 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle size={15} className="text-red-600" />
            <span>Escalated Unsatisfactory Resolution Flag</span>
          </div>
          <div className="space-y-2">
            {satisfaction.lowRatedComplaints.map(item => (
              <div
                key={item._id}
                className="p-3 bg-white rounded-xl border border-red-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.title}</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-black text-[10px] uppercase">
                      {item.rating}★ Rating
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5 italic">
                    Citizen remark: "{item.comment || 'Citizen indicated dissatisfaction with repair'}"
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/officer/complaints/${item._id}`)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold uppercase tracking-wider shrink-0 shadow-xs"
                >
                  Inspect Ticket
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complaints Table Section - Priority Queue Data Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {/* Table Toolbar */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Priority Queue</h2>
            <div className="flex items-center gap-2">
              <select
                id="officer-filter-category"
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="text-xs border-none bg-slate-100 rounded-md py-1 px-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-700"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>

              <select
                id="officer-filter-status"
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="text-xs border-none bg-slate-100 rounded-md py-1 px-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-700"
              >
                <option value="All">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                id="officer-filter-priority"
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="text-xs border-none bg-slate-100 rounded-md py-1 px-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-700"
              >
                {PRIORITIES.map(pri => (
                  <option key={pri} value={pri}>
                    {pri === 'All' ? 'All Priorities' : pri}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <span className="text-[11px] text-slate-500 uppercase font-bold tracking-tight">
            Displaying {complaints.length} of {stats?.totalComplaints || complaints.length} Records
          </span>
        </div>

        {/* Technical Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Complaint Title</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upvotes</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loadingComplaints ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 font-mono">
                    Querying municipal registry...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No complaints match current priority filters.
                  </td>
                </tr>
              ) : (
                complaints.map(c => (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`/officer/complaints/${c._id}`)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 text-xs font-mono text-slate-400 whitespace-nowrap">
                      {formatTicketId(c._id)}
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-teal-700 transition-colors line-clamp-1">
                        {c.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {c.area} • Filed {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} score={c.priorityScore} showScore size="sm" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-slate-700">{c.upvotes}</span>
                        <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"></path>
                        </svg>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/officer/complaints/${c._id}`)}
                        className="text-[10px] font-black uppercase text-teal-600 hover:text-teal-800 tracking-wider transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
