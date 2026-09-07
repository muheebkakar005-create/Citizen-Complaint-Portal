import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Complaint } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  ThumbsUp,
  Star,
  Building2,
  User,
  ShieldAlert,
  Send,
  CheckCircle2,
  AlertCircle,
  Trash2
} from 'lucide-react';

interface ComplaintDetailsPageProps {
  id: string;
  navigate: (path: string) => void;
}

export const ComplaintDetailsPage: React.FC<ComplaintDetailsPageProps> = ({ id, navigate }) => {
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Upvote state
  const [upvoting, setUpvoting] = useState(false);

  // Feedback form state
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const fetchComplaint = () => {
    setLoading(true);
    api.getComplaintById(id)
      .then(res => {
        if (res.success && res.complaint) {
          setComplaint(res.complaint);
        } else {
          setError('Complaint record not found in municipal registry.');
        }
      })
      .catch(() => {
        setError('Network error loading complaint details.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleUpvote = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!complaint || upvoting) return;

    setUpvoting(true);
    try {
      const res = await api.upvoteComplaint(complaint._id);
      if (res.success && res.complaint) {
        setComplaint(res.complaint);
      } else {
        alert(res.message || 'Unable to register upvote.');
      }
    } catch {
      alert('Error registering upvote.');
    } finally {
      setUpvoting(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    setSubmittingFeedback(true);
    try {
      const res = await api.submitFeedback(complaint._id, rating, comment);
      if (res.success && res.complaint) {
        setComplaint(res.complaint);
        setFeedbackSuccess(true);
      } else {
        alert(res.message || 'Failed to submit feedback.');
      }
    } catch {
      alert('Network error submitting feedback.');
    } finally {
      setSubmittingFeedback(false);
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
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="h-96 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm">
          {error || 'Record does not exist.'}
        </div>
        <button
          onClick={() => navigate('/complaints')}
          className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider"
        >
          Return to Incident Feed
        </button>
      </div>
    );
  }

  const isOwner = user && complaint.createdBy === user.id;
  const isOfficer = user?.role === 'officer';
  const hasUpvoted = user && complaint.upvotedBy.includes(user.id);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this complaint?')) return;
    setDeleting(true);
    try {
      const res = await api.deleteComplaint(complaint._id);
      if (res.success) {
        navigate('/complaints');
      } else {
        alert(res.message || 'Failed to delete complaint.');
      }
    } catch {
      alert('Error deleting complaint.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 space-y-6 font-sans">
      {/* Back Button & Officer Console shortcut */}
      <div className="flex items-center justify-between gap-3">
        <button
          id="complaint-back-btn"
          onClick={() => navigate('/complaints')}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Incident Feed</span>
        </button>

        <div className="flex items-center gap-2">
          {(isOwner || isOfficer) && (
            <button
              id="complaint-delete-btn"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 px-3.5 py-1.5 rounded-full shadow-xs transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>{deleting ? 'Deleting...' : 'Delete Incident'}</span>
            </button>
          )}

          {isOfficer && (
            <button
              id="officer-review-link-btn"
              onClick={() => navigate(`/officer/complaints/${complaint._id}`)}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-teal-600 hover:bg-teal-700 px-4 py-1.5 rounded-full shadow-xs transition-colors cursor-pointer"
            >
              <Building2 size={13} />
              <span>Manage in Officer Console</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Detail Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Top Header Banner */}
        <div className="p-6 sm:p-8 space-y-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-slate-400">
                {formatTicketId(complaint._id)}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {complaint.category}
              </span>
              <PriorityBadge priority={complaint.priority} score={complaint.priorityScore} showScore size="md" />
              <StatusBadge status={complaint.status} size="md" />
            </div>

            {/* Upvote Button with Technical Theme styling */}
            <button
              id="details-upvote-btn"
              onClick={handleUpvote}
              disabled={upvoting || hasUpvoted}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all ${
                hasUpvoted
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                  : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
              }`}
            >
              <ThumbsUp size={14} className={hasUpvoted ? 'fill-emerald-600 text-emerald-600' : 'text-teal-600'} />
              <span className="font-mono">{complaint.upvotes} Upvotes</span>
              <span className="text-[10px]">
                {hasUpvoted ? '• Registered' : '• Support'}
              </span>
            </button>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
            {complaint.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400 font-mono pt-1">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <MapPin size={13} className="text-slate-400" />
              {complaint.area}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" />
              Filed {new Date(complaint.createdAt).toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-slate-400" />
              Updated {new Date(complaint.updatedAt).toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5">
              <User size={13} className="text-slate-400" />
              Reported by {complaint.creatorName || 'Resident Citizen'}
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Incident Description</h2>
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          {/* Evidence Image */}
          {complaint.imageUrl && (
            <div className="space-y-2">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submitted Photographic Evidence</h2>
              <div className="max-w-md rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                <img
                  src={complaint.imageUrl}
                  alt={complaint.title}
                  className="w-full max-h-96 object-cover"
                />
              </div>
            </div>
          )}

          {/* Priority Score Breakdown explanation */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldAlert size={14} className="text-teal-600" />
              <span>Dynamic Priority Calculation: {complaint.priorityScore} points ({complaint.priority})</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Calculation Logic: (Upvotes × 2) + Days Open. High priority incidents are routed immediately to emergency field squads.
            </p>
          </div>

          {/* Official Officer Remarks */}
          <div className="p-5 rounded-xl bg-slate-900 text-white space-y-2">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
              <Building2 size={14} />
              <span>Official Municipal Department Remarks</span>
            </div>
            {complaint.officerRemark ? (
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                "{complaint.officerRemark}"
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No officer remarks recorded yet. Assigned field inspectors will post progress and scheduling notes here.
              </p>
            )}
          </div>

          {/* Citizen Feedback Section */}
          {complaint.status === 'resolved' && (
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star size={16} className="fill-amber-400 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Citizen Resolution Feedback</h3>
                </div>
                {complaint.feedbackGiven && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                    <CheckCircle2 size={11} />
                    Verified Rating
                  </span>
                )}
              </div>

              {complaint.feedbackGiven ? (
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={16}
                        className={
                          star <= (complaint.feedbackRating || 0)
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300'
                        }
                      />
                    ))}
                    <span className="ml-2 text-xs font-bold text-slate-800 font-mono">
                      {complaint.feedbackRating} / 5.0 Stars
                    </span>
                  </div>
                  {complaint.feedbackComment ? (
                    <p className="text-xs text-slate-700 italic">
                      "{complaint.feedbackComment}"
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400">No written comment provided.</p>
                  )}
                </div>
              ) : isOwner ? (
                /* Feedback submission form for reporting citizen */
                <form
                  onSubmit={handleFeedbackSubmit}
                  className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-4"
                >
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                      Rate the Repair Quality
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Your rating feeds directly into the officer district satisfaction KPI and departmental review.
                    </p>
                  </div>

                  {feedbackSuccess && (
                    <div className="p-3 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 size={15} />
                      <span>Feedback recorded successfully. Thank you!</span>
                    </div>
                  )}

                  {/* 5-star interactive rating */}
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-slate-300 hover:scale-110 transition-transform"
                      >
                        <Star
                          size={22}
                          className={
                            star <= (hoverRating || rating)
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-300'
                          }
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono font-bold text-amber-950 ml-2">
                      {rating} / 5 Stars
                    </span>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1">
                      Citizen Feedback Remarks (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Was the problem resolved promptly and satisfactorily? Provide any details..."
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider shadow flex items-center gap-1.5 transition-colors disabled:opacity-60"
                  >
                    <Send size={13} />
                    <span>{submittingFeedback ? 'Recording...' : 'Submit Resolution Feedback'}</span>
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 italic">
                  Awaiting satisfaction feedback from reporting resident ({complaint.creatorName || 'Citizen'}).
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
