import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Complaint, ComplaintCategory, PriorityLevel, ComplaintStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  Compass,
  Search,
  Filter,
  ThumbsUp,
  MapPin,
  Calendar,
  ArrowUpDown,
  FilePlus2,
  X,
  AlertCircle
} from 'lucide-react';

interface PublicFeedPageProps {
  navigate: (path: string) => void;
}

const CATEGORIES: ('All' | ComplaintCategory)[] = ['All', 'Road', 'Garbage', 'Water', 'Electricity', 'Other'];
const STATUSES: ('All' | ComplaintStatus)[] = ['All', 'pending', 'in-progress', 'resolved'];
const PRIORITIES: ('All' | PriorityLevel)[] = ['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export const PublicFeedPage: React.FC<PublicFeedPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | ComplaintCategory>('All');
  const [status, setStatus] = useState<'All' | ComplaintStatus>('All');
  const [priority, setPriority] = useState<'All' | PriorityLevel>('All');
  const [area, setArea] = useState('All');
  const [sort, setSort] = useState<'priority' | 'upvotes' | 'newest'>('priority');

  const [upvotingIds, setUpvotingIds] = useState<Set<string>>(new Set());

  // Fetch complaints
  const fetchComplaints = () => {
    setLoading(true);
    api.getComplaints({
      search: search.trim() || undefined,
      category: category !== 'All' ? category : undefined,
      status: status !== 'All' ? status : undefined,
      priority: priority !== 'All' ? priority : undefined,
      area: area !== 'All' ? area : undefined,
      sort
    })
      .then(res => {
        if (res.success) {
          setComplaints(res.complaints);
        } else {
          setError('Failed to fetch public complaints feed.');
        }
      })
      .catch(() => {
        setError('Network error fetching complaint feed.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchComplaints();
  }, [category, status, priority, area, sort]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchComplaints();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Distinct areas from loaded data
  const availableAreas = useMemo(() => {
    const set = new Set<string>();
    complaints.forEach(c => {
      if (c.area) set.add(c.area);
    });
    return Array.from(set).sort();
  }, [complaints]);

  // Upvoting handler
  const handleUpvote = async (e: React.MouseEvent, complaintId: string) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    if (upvotingIds.has(complaintId)) return;

    setUpvotingIds(prev => new Set(prev).add(complaintId));

    try {
      const res = await api.upvoteComplaint(complaintId);
      if (res.success && res.complaint) {
        setComplaints(prev =>
          prev.map(c => (c._id === complaintId ? (res.complaint as Complaint) : c))
        );
      } else {
        alert(res.message || 'Unable to register upvote.');
      }
    } catch {
      alert('Error connecting to upvote service.');
    } finally {
      setUpvotingIds(prev => {
        const next = new Set(prev);
        next.delete(complaintId);
        return next;
      });
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setStatus('All');
    setPriority('All');
    setArea('All');
    setSort('priority');
  };

  const formatTicketId = (rawId: string) => {
    if (rawId.startsWith('cmp_')) {
      const num = rawId.replace('cmp_', '');
      return `#CP-${num.padStart(4, '0')}`;
    }
    return `#CP-${rawId.slice(-4).toUpperCase()}`;
  };

  const hasActiveFilters = search || category !== 'All' || status !== 'All' || priority !== 'All' || area !== 'All';

  return (
    <div className="space-y-6 py-6 font-sans">
      {/* Page Title & Hero Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-bold text-xs tracking-wider uppercase">
            <Compass size={15} />
            <span>Civic Incident Grid & Transparency Feed</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Community Complaint Directory
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Active Records Database • Real-Time Community Upvoting & Priority Tracking
          </p>
        </div>

        <button
          onClick={() => navigate(user ? '/complaints/new' : '/login')}
          className="px-4 py-2 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider shadow flex items-center gap-2 transition-colors self-start md:self-auto shrink-0"
        >
          <FilePlus2 size={14} />
          <span>Report Incident</span>
        </button>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        {/* Search input + Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="feed-search-input"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search records by title, description, or neighborhood..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown size={14} className="text-slate-400" />
            <select
              id="feed-sort-select"
              value={sort}
              onChange={e => setSort(e.target.value as any)}
              className="px-3 py-1.5 rounded-full border-none bg-slate-100 text-xs font-semibold focus:ring-2 focus:ring-teal-500 text-slate-700 outline-none"
            >
              <option value="priority">Sort: Highest Priority</option>
              <option value="upvotes">Sort: Most Upvoted</option>
              <option value="newest">Sort: Newest Filed</option>
            </select>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Category
            </label>
            <select
              id="feed-category-filter"
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-md border-none bg-slate-100 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Status
            </label>
            <select
              id="feed-status-filter"
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-md border-none bg-slate-100 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Priority Level
            </label>
            <select
              id="feed-priority-filter"
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-md border-none bg-slate-100 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            >
              {PRIORITIES.map(pri => (
                <option key={pri} value={pri}>
                  {pri === 'All' ? 'All Priorities' : pri}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Locality / Area
            </label>
            <select
              id="feed-area-filter"
              value={area}
              onChange={e => setArea(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border-none bg-slate-100 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            >
              <option value="All">All Areas</option>
              {availableAreas.map(a => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-mono">
            <span>
              Matches: <strong>{complaints.length}</strong> active tickets
            </span>
            <button
              onClick={clearFilters}
              className="text-xs font-bold uppercase tracking-wider text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <X size={12} />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Complaints Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-44 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3">
          <Filter size={36} className="mx-auto text-slate-400" />
          <p className="font-semibold text-slate-800">No civic complaints match the active query.</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your search query or selecting 'All' across categories and wards.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {complaints.map((complaint, idx) => {
            const hasVoted = user && complaint.upvotedBy.includes(user.id);
            const isUpvoting = upvotingIds.has(complaint._id);

            return (
              <motion.div
                key={complaint._id}
                id={`complaint-card-${complaint._id}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.035, 0.35), duration: 0.22 }}
                whileHover={{ y: -4, borderColor: '#08D9D6', boxShadow: '0 8px 24px rgba(8,217,214,0.12)' }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/complaints/${complaint._id}`)}
                className="p-5 rounded-2xl bg-white border border-slate-200 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">
                        {formatTicketId(complaint._id)}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {complaint.category}
                      </span>
                      <PriorityBadge priority={complaint.priority} score={complaint.priorityScore} showScore size="sm" />
                    </div>
                    <StatusBadge status={complaint.status} size="sm" />
                  </div>

                  <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-teal-700 transition-colors">
                    {complaint.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {complaint.description}
                  </p>

                  {complaint.officerRemark && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <strong className="text-slate-900 font-semibold">Officer Remark:</strong> {complaint.officerRemark}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
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

                  {/* Upvote Button with Technical Theme styling and motion */}
                  <motion.button
                    id={`upvote-btn-${complaint._id}`}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={e => handleUpvote(e, complaint._id)}
                    disabled={isUpvoting || hasVoted}
                    title={hasVoted ? 'You already upvoted this' : 'Upvote this complaint'}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      hasVoted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                        : 'bg-brand-cyan/15 text-teal-800 hover:bg-brand-cyan/25 border border-brand-cyan/40'
                    }`}
                  >
                    <ThumbsUp
                      size={13}
                      className={`${hasVoted ? 'fill-emerald-600 text-emerald-600' : 'text-teal-700'} ${isUpvoting ? 'animate-bounce' : ''}`}
                    />
                    <span className="font-mono">{complaint.upvotes}</span>
                    <span className="hidden sm:inline text-[10px]">
                      {hasVoted ? 'Voted' : 'Upvote'}
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
