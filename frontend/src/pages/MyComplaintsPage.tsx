import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Complaint, ComplaintStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  ListTodo,
  FilePlus2,
  Calendar,
  Clock,
  MapPin,
  ThumbsUp,
  Star,
  ArrowRight,
  Filter
} from 'lucide-react';

interface MyComplaintsPageProps {
  navigate: (path: string) => void;
}

export const MyComplaintsPage: React.FC<MyComplaintsPageProps> = ({ navigate }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | ComplaintStatus>('All');

  useEffect(() => {
    let mounted = true;
    api.getMyComplaints()
      .then(res => {
        if (mounted && res.success) {
          setComplaints(res.complaints);
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

  const filteredComplaints = complaints.filter(c => {
    if (statusFilter === 'All') return true;
    return c.status === statusFilter;
  });

  const formatTicketId = (rawId: string) => {
    if (rawId.startsWith('cmp_')) {
      const num = rawId.replace('cmp_', '');
      return `#CP-${num.padStart(4, '0')}`;
    }
    return `#CP-${rawId.slice(-4).toUpperCase()}`;
  };

  return (
    <div className="space-y-6 py-6 font-sans">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-bold text-xs tracking-wider uppercase">
            <ListTodo size={15} />
            <span>Citizen Incident Registry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            My Submitted Complaints
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Personal Audit Trail • Track Status Transitions & Municipal Field Remarks
          </p>
        </div>

        <button
          onClick={() => navigate('/complaints/new')}
          className="px-4 py-2 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider shadow flex items-center gap-2 transition-colors self-start sm:self-auto shrink-0"
        >
          <FilePlus2 size={14} />
          <span>Report New Problem</span>
        </button>
      </div>

      {/* Filter Tabs in Technical Style */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <Filter size={15} className="text-slate-400 shrink-0 mr-1" />
        {(['All', 'pending', 'in-progress', 'resolved'] as const).map(tab => {
          const count = tab === 'All' ? complaints.length : complaints.filter(c => c.status === tab).length;
          const isActive = statusFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab === 'in-progress' ? 'In Progress' : tab}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List / Data Grid */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 rounded-xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3 shadow-sm">
          <ListTodo size={36} className="mx-auto text-slate-400" />
          <p className="font-semibold text-slate-800">No records found under this status filter.</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Switch filter tabs above or file a new incident report with the municipality.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComplaints.map(complaint => (
            <div
              key={complaint._id}
              onClick={() => navigate(`/complaints/${complaint._id}`)}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="space-y-2 w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-slate-400">
                    {formatTicketId(complaint._id)}
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {complaint.category}
                  </span>
                  <PriorityBadge priority={complaint.priority} score={complaint.priorityScore} showScore size="sm" />
                  <StatusBadge status={complaint.status} size="sm" />
                  {complaint.status === 'resolved' && !complaint.feedbackGiven && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center gap-1">
                      <Star size={10} className="fill-amber-500 text-amber-500" />
                      Feedback Pending
                    </span>
                  )}
                  {complaint.feedbackGiven && complaint.feedbackRating && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1 font-mono">
                      <Star size={10} className="fill-emerald-600 text-emerald-600" />
                      Rated {complaint.feedbackRating}/5
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-700 transition-colors line-clamp-1">
                  {complaint.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {complaint.description}
                </p>

                {complaint.officerRemark && (
                  <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                    <strong className="text-slate-900 font-semibold">Department Remark:</strong> {complaint.officerRemark}
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-400 font-mono pt-1 flex-wrap">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <MapPin size={12} className="text-slate-400" />
                    {complaint.area}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-slate-400" />
                    Filed {new Date(complaint.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-slate-400" />
                    Updated {new Date(complaint.updatedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-full">
                    <ThumbsUp size={11} />
                    {complaint.upvotes} upvotes
                  </span>
                </div>
              </div>

              <div className="self-end md:self-center shrink-0 flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-teal-600 group-hover:text-teal-800 tracking-wider flex items-center gap-1">
                  <span>Manage Ticket</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
