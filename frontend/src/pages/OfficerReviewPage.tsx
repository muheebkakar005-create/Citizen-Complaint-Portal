import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Complaint, ComplaintStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  ThumbsUp,
  Save,
  MessageSquare,
  ShieldCheck,
  Star,
  Trash2
} from 'lucide-react';

interface OfficerReviewPageProps {
  id: string;
  navigate: (path: string) => void;
}

export const OfficerReviewPage: React.FC<OfficerReviewPageProps> = ({ id, navigate }) => {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [status, setStatus] = useState<ComplaintStatus>('pending');
  const [officerRemark, setOfficerRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getComplaintById(id)
      .then(res => {
        if (mounted && res.success && res.complaint) {
          setComplaint(res.complaint);
          setStatus(res.complaint.status);
          setOfficerRemark(res.complaint.officerRemark || '');
        } else {
          setError('Complaint record not found.');
        }
      })
      .catch(() => {
        setError('Failed to load complaint for review.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    setSubmitting(true);
    setSuccessMsg(null);
    setError(null);

    try {
      const res = await api.updateComplaintStatus(complaint._id, status, officerRemark);
      if (res.success && res.complaint) {
        setComplaint(res.complaint);
        setSuccessMsg(`Incident status updated to "${status.toUpperCase()}".`);
      } else {
        setError(res.message || 'Failed to update complaint.');
      }
    } catch {
      setError('Network error saving officer review.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTicketId = (rawId: string) => {
    if (rawId.startsWith('cmp_')) {
      const num = rawId.replace('cmp_', '');
      return `#CP-${num.padStart(4, '0')}`;
    }
    return `#CP-${rawId.slice(-4).toUpperCase()}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <AlertCircle size={40} className="mx-auto text-rose-500" />
        <h2 className="text-lg font-bold text-slate-900">{error}</h2>
        <button
          onClick={() => navigate('/officer/dashboard')}
          className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider"
        >
          Return to Officer Dashboard
        </button>
      </div>
    );
  }

  if (!complaint) return null;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this complaint record?')) return;
    try {
      const res = await api.deleteComplaint(complaint._id);
      if (res.success) {
        navigate('/officer/dashboard');
      } else {
        alert(res.message || 'Failed to delete complaint.');
      }
    } catch {
      alert('Error deleting complaint.');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 space-y-6 font-sans">
      {/* Back to Console Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          id="review-back-btn"
          onClick={() => navigate('/officer/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Officer Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">
            Incident ID: <strong className="text-slate-800">{formatTicketId(complaint._id)}</strong>
          </span>
          <button
            id="officer-delete-btn"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 px-3 py-1.5 rounded-full shadow-xs transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Complaint Readout */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">
                  {formatTicketId(complaint._id)}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {complaint.category}
                </span>
                <PriorityBadge priority={complaint.priority} score={complaint.priorityScore} showScore size="sm" />
              </div>
              <StatusBadge status={complaint.status} size="md" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
              {complaint.title}
            </h1>

            <div className="space-y-1 text-xs text-slate-600">
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Problem Description</h3>
              <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>

            {/* Evidence Image */}
            {complaint.imageUrl && (
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Citizen Photo Attachment</h3>
                <div className="rounded-xl overflow-hidden border border-slate-200 max-h-72 bg-slate-50">
                  <img
                    src={complaint.imageUrl}
                    alt={complaint.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Reporting Metadata */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600 font-mono">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reporting Citizen</span>
                <p className="font-semibold text-slate-900 flex items-center gap-1 font-sans">
                  <User size={12} className="text-slate-400" />
                  {complaint.creatorName || 'Resident'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{complaint.creatorEmail || 'Verified Resident'}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Locality / Ward</span>
                <p className="font-semibold text-slate-900 flex items-center gap-1 font-sans">
                  <MapPin size={12} className="text-slate-400" />
                  {complaint.area}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Filed Date</span>
                <p className="font-medium text-slate-800 flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400" />
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Community Upvotes</span>
                <p className="font-bold text-teal-700 flex items-center gap-1">
                  <ThumbsUp size={12} />
                  {complaint.upvotes} Citizens Supported
                </p>
              </div>
            </div>

            {/* Citizen Feedback if resolved */}
            {complaint.feedbackGiven && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs text-emerald-950">
                <div className="flex items-center gap-1.5 font-bold">
                  <Star size={14} className="fill-emerald-600 text-emerald-600" />
                  <span>Citizen Rating: {complaint.feedbackRating} / 5.0 Stars</span>
                </div>
                {complaint.feedbackComment && (
                  <p className="text-emerald-900 italic">"{complaint.feedbackComment}"</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Officer Action Box */}
        <div className="space-y-4">
          <form
            onSubmit={handleUpdate}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Building2 size={15} className="text-teal-600" />
              <span>Update Incident Status</span>
            </div>

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Status Select */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Resolution Workflow Status
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-medium">
                  <input
                    type="radio"
                    name="incident_status"
                    value="pending"
                    checked={status === 'pending'}
                    onChange={() => setStatus('pending')}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Pending Review</span>
                  </span>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-medium">
                  <input
                    type="radio"
                    name="incident_status"
                    value="in-progress"
                    checked={status === 'in-progress'}
                    onChange={() => setStatus('in-progress')}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span>In Progress (Crew Dispatched)</span>
                  </span>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-medium">
                  <input
                    type="radio"
                    name="incident_status"
                    value="resolved"
                    checked={status === 'resolved'}
                    onChange={() => setStatus('resolved')}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Resolved (Repairs Complete)</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Officer Remarks Textarea */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Official Department Remarks
              </label>
              <textarea
                id="officer-remarks-input"
                rows={4}
                value={officerRemark}
                onChange={e => setOfficerRemark(e.target.value)}
                placeholder="Detail crew dispatch, contractor notes, completion timeline, or inspection findings..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 bg-slate-50"
              />
              <p className="text-[10px] text-slate-400 font-mono">
                These remarks are published on the citizen's complaint ticket.
              </p>
            </div>

            {/* Submit Button */}
            <button
              id="officer-save-review-btn"
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider shadow flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              <Save size={14} />
              <span>{submitting ? 'Updating System...' : 'Commit Status Update'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
