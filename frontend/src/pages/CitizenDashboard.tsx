import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Complaint } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  FilePlus2,
  ListTodo,
  Compass,
  Clock,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  Star,
  MapPin,
  Calendar,
  ArrowRight
} from 'lucide-react';

interface CitizenDashboardProps {
  navigate: (path: string) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getMyComplaints()
      .then(res => {
        if (mounted && res.success) {
          setMyComplaints(res.complaints);
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

  const total = myComplaints.length;
  const pending = myComplaints.filter(c => c.status === 'pending').length;
  const inProgress = myComplaints.filter(c => c.status === 'in-progress').length;
  const resolved = myComplaints.filter(c => c.status === 'resolved').length;

  const pendingFeedbackList = myComplaints.filter(c => c.status === 'resolved' && !c.feedbackGiven);

  const formatTicketId = (rawId: string) => {
    if (rawId.startsWith('cmp_')) {
      const num = rawId.replace('cmp_', '');
      return `#CP-${num.padStart(4, '0')}`;
    }
    return `#CP-${rawId.slice(-4).toUpperCase()}`;
  };

  return (
    <div className="space-y-6 py-6 font-sans">
      {/* Welcome Technical Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-teal-400 text-slate-900 text-[10px] font-black uppercase tracking-wider">
            <span>Verified Citizen Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome, {user?.name || 'Resident'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-light leading-relaxed">
            Monitor real-time incident reports, review public officer remarks, and provide post-resolution satisfaction ratings.
          </p>
        </div>

        {/* Quick Actions in Technical Theme */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            id="dashboard-report-btn"
            onClick={() => navigate('/complaints/new')}
            className="px-4 py-2 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold uppercase tracking-wider shadow flex items-center gap-2 transition-colors"
          >
            <FilePlus2 size={15} />
            <span>Report Incident</span>
          </button>
          <button
            id="dashboard-my-complaints-btn"
            onClick={() => navigate('/complaints/mine')}
            className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <ListTodo size={15} />
            <span>My Records ({total})</span>
          </button>
          <button
            id="dashboard-browse-btn"
            onClick={() => navigate('/complaints')}
            className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <Compass size={15} className="text-teal-400" />
            <span>Incident Feed</span>
          </button>
        </div>

        {/* Decorative backdrop symbol */}
        <svg className="absolute right-[-10px] bottom-[-10px] w-40 h-40 opacity-10 text-white pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2zm4 8h-2V7h2v10z"></path>
        </svg>
      </div>

      {/* Pending Citizen Feedback Banner */}
      {pendingFeedbackList.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Star size={18} className="fill-amber-500 text-amber-500" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-amber-950 uppercase tracking-wide">
                Resolution Feedback Requested ({pendingFeedbackList.length} ticket{pendingFeedbackList.length > 1 ? 's' : ''})
              </p>
              <p className="text-xs text-amber-800">
                A recent complaint was marked resolved. Rate the repair quality to update the municipal satisfaction score.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/complaints/${pendingFeedbackList[0]._id}`)}
            className="px-4 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider shrink-0 transition-colors"
          >
            Rate Resolution
          </button>
        </div>
      )}

      {/* Statistics Cards - Technical Grid Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Total Filed</div>
          <div className="text-2xl font-bold text-slate-900">{total}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Resident incident logs</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Pending Review</div>
          <div className="text-2xl font-bold text-amber-600">{pending}</div>
          <div className="text-[10px] text-amber-500 font-medium mt-0.5">Awaiting assignment</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">In Progress</div>
          <div className="text-2xl font-bold text-indigo-600">{inProgress}</div>
          <div className="text-[10px] text-indigo-500 font-medium mt-0.5">Active crew dispatch</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Resolved</div>
          <div className="text-2xl font-bold text-emerald-600">{resolved}</div>
          <div className="text-[10px] text-emerald-500 font-medium mt-0.5">Repairs completed</div>
        </div>
      </div>

      {/* Your Recent Filed Complaints Data Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Your Active Complaints Registry</h2>
            <p className="text-xs text-slate-400 font-mono">Live incident status & department remark tracking</p>
          </div>
          {myComplaints.length > 0 && (
            <button
              onClick={() => navigate('/complaints/mine')}
              className="text-xs font-bold uppercase tracking-wider text-teal-600 hover:text-teal-800 flex items-center gap-1"
            >
              <span>View All Records</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : myComplaints.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 space-y-3">
            <AlertCircle size={32} className="mx-auto text-slate-400" />
            <p className="text-sm font-medium text-slate-700">No complaints filed under this citizen account.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Spot a pothole, broken streetlight, or garbage backlog? File a report to alert municipal teams.
            </p>
            <button
              onClick={() => navigate('/complaints/new')}
              className="px-4 py-2 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold uppercase tracking-wider shadow"
            >
              Report Incident Now
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myComplaints.slice(0, 5).map(complaint => (
              <div
                key={complaint._id}
                onClick={() => navigate(`/complaints/${complaint._id}`)}
                className="p-4 rounded-xl bg-slate-50/60 hover:bg-white border border-slate-200 hover:border-teal-500/50 hover:shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-slate-400">
                      {formatTicketId(complaint._id)}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      {complaint.category}
                    </span>
                    <PriorityBadge priority={complaint.priority} score={complaint.priorityScore} size="sm" />
                    <StatusBadge status={complaint.status} size="sm" />
                    {complaint.status === 'resolved' && !complaint.feedbackGiven && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center gap-1">
                        <Star size={10} className="fill-amber-600 text-amber-600" />
                        Rating Required
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-slate-900 text-sm group-hover:text-teal-700 transition-colors line-clamp-1">
                    {complaint.title}
                  </h3>

                  {complaint.officerRemark && (
                    <div className="text-xs text-slate-600 bg-white px-2.5 py-1.5 rounded-md border border-slate-200">
                      <strong className="text-slate-900">Officer Remark:</strong> {complaint.officerRemark}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono pt-0.5">
                    <span className="flex items-center gap-1 text-slate-600">
                      <MapPin size={11} />
                      {complaint.area}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      Filed {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-teal-600 font-bold">
                      <ThumbsUp size={11} />
                      {complaint.upvotes}
                    </span>
                  </div>
                </div>

                <div className="self-end sm:self-center shrink-0">
                  <span className="text-[10px] font-black uppercase text-teal-600 group-hover:text-teal-800 tracking-wider flex items-center gap-1">
                    <span>Manage</span>
                    <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
