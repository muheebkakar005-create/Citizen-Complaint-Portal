import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Complaint, ComplaintCategory } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  FilePlus2,
  AlertTriangle,
  Upload,
  ThumbsUp,
  MapPin,
  Calendar,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface NewComplaintPageProps {
  navigate: (path: string) => void;
}

const CATEGORIES: ComplaintCategory[] = ['Road', 'Garbage', 'Water', 'Electricity', 'Other'];

const SAMPLE_AREAS = [
  'Downtown',
  'West End',
  'North Hills',
  'Metro Junction',
  'Riverdale',
  'Southside',
  'East Boulevard',
  'Market Complex'
];

export const NewComplaintPage: React.FC<NewComplaintPageProps> = ({ navigate }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Road');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Duplicate detection state
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [duplicates, setDuplicates] = useState<Complaint[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [bypassDuplicates, setBypassDuplicates] = useState(false);

  // Check duplicates whenever category and area change
  useEffect(() => {
    if (!area.trim() || area.trim().length < 3) {
      setDuplicates([]);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingDuplicates(true);
      try {
        const res = await api.checkDuplicates(category, area.trim());
        if (res.success && res.hasDuplicates) {
          setDuplicates(res.duplicates);
        } else {
          setDuplicates([]);
        }
      } catch (err) {
        console.error('Duplicate check error:', err);
      } finally {
        setCheckingDuplicates(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [category, area]);

  // Handle local file selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageUrl(base64);
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetPhoto = (url: string) => {
    setImageUrl(url);
    setImagePreview(url);
  };

  const submitComplaint = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.createComplaint({
        title: title.trim(),
        category,
        description: description.trim(),
        area: area.trim(),
        imageUrl: imageUrl.trim() || undefined
      });

      if (res.success && res.complaint) {
        navigate(`/complaints/${res.complaint._id}`);
      } else {
        setError(res.message || 'Failed to submit complaint.');
      }
    } catch {
      setError('Network error registering incident report.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bypassDuplicates && duplicates.length > 0) {
      setShowDuplicateModal(true);
      return;
    }
    submitComplaint();
  };

  const handleForceSubmit = () => {
    setBypassDuplicates(true);
    setShowDuplicateModal(false);
    submitComplaint();
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 space-y-6 font-sans">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-bold text-xs tracking-wider uppercase">
            <FilePlus2 size={15} />
            <span>Incident Reporting Terminal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            File New Civic Incident
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Automated Duplicate Detection • Dynamic Priority Routing • Transparent Resolution Tracking
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Duplicate Alert Card if duplicates found before submitting */}
      {duplicates.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <span>
              {duplicates.length} Similar Incident{duplicates.length > 1 ? 's' : ''} Already Registered in {area}
            </span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            A report in this category already exists in your ward. Upvoting the existing report increases its priority score faster without fragmenting field work.
          </p>

          <div className="space-y-2">
            {duplicates.slice(0, 2).map(dup => (
              <div
                key={dup._id}
                className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between gap-3 text-xs shadow-xs"
              >
                <div className="space-y-0.5 truncate">
                  <p className="font-semibold text-slate-900 truncate">{dup.title}</p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {dup.area} • {dup.upvotes} upvotes • Filed {new Date(dup.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/complaints/${dup._id}`)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-xs"
                >
                  <span>Upvote</span>
                  <ExternalLink size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Reporting Form */}
      <form onSubmit={handleFormSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Title */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            Complaint Title <span className="text-red-500">*</span>
          </label>
          <input
            id="complaint-title-input"
            type="text"
            required
            minLength={5}
            maxLength={120}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Severe crater pothole on Main Avenue"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white text-slate-800 transition-colors"
          />
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            Be concise and specific (5–120 characters)
          </span>
        </div>

        {/* Category & Area 2-column */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Service Category <span className="text-red-500">*</span>
            </label>
            <select
              id="complaint-category-select"
              value={category}
              onChange={e => setCategory(e.target.value as ComplaintCategory)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white text-slate-800 font-medium"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Area / Locality / Ward <span className="text-red-500">*</span>
            </label>
            <input
              id="complaint-area-input"
              type="text"
              required
              minLength={2}
              maxLength={60}
              value={area}
              onChange={e => setArea(e.target.value)}
              placeholder="e.g., Downtown, West End, Metro Junction"
              list="area-suggestions"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white text-slate-800 transition-colors"
            />
            <datalist id="area-suggestions">
              {SAMPLE_AREAS.map(a => (
                <option key={a} value={a} />
              ))}
            </datalist>
            {checkingDuplicates && (
              <span className="text-[10px] text-teal-600 font-mono mt-1 flex items-center gap-1">
                Checking existing neighborhood reports...
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            Detailed Incident Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="complaint-description-input"
            required
            rows={4}
            minLength={10}
            maxLength={1000}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the severity, exact landmark, how long the issue has persisted, and any safety hazards..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white text-slate-800 leading-relaxed transition-colors"
          />
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            Provide key details such as landmarks and safety hazards (min 10 characters)
          </span>
        </div>

        {/* Image Attachment (Optional) */}
        <div className="space-y-3">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Evidence Photo Attachment (Optional)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Upload Photo File</label>
              <div className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50">
                <input
                  id="complaint-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="complaint-file-upload" className="cursor-pointer block space-y-1">
                  <Upload size={22} className="mx-auto text-slate-400" />
                  <p className="text-xs font-semibold text-slate-700">Click or Drag Image</p>
                  <p className="text-[10px] text-slate-400 font-mono">PNG, JPG, WebP up to 5MB</p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Or Paste Image URL</label>
              <input
                id="complaint-image-url-input"
                type="url"
                value={imageUrl.startsWith('data:') ? '' : imageUrl}
                onChange={e => {
                  setImageUrl(e.target.value);
                  setImagePreview(e.target.value);
                }}
                placeholder="https://images.example.com/pothole.jpg"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white text-slate-800"
              />

              <div className="mt-2 text-[10px] text-slate-500 font-mono">
                <span>Quick demo presets:</span>
                <div className="flex gap-1.5 mt-1">
                  <button
                    type="button"
                    onClick={() => handlePresetPhoto('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[9px] text-slate-700 border border-slate-200"
                  >
                    Road crater
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetPhoto('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=60')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[9px] text-slate-700 border border-slate-200"
                  >
                    Garbage bin
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetPhoto('https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=60')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[9px] text-slate-700 border border-slate-200"
                  >
                    Water pipe
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          {imagePreview && (
            <div className="mt-2 relative inline-block">
              <img
                src={imagePreview}
                alt="Preview evidence"
                className="w-32 h-24 object-cover rounded-xl border border-slate-300 shadow-sm"
              />
              <button
                type="button"
                onClick={() => {
                  setImageUrl('');
                  setImagePreview('');
                }}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center shadow"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/complaints')}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800"
          >
            Cancel & Return
          </button>

          <button
            id="complaint-submit-btn"
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider shadow flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            <CheckCircle2 size={15} />
            <span>{submitting ? 'Submitting Report...' : 'Submit Incident Report'}</span>
          </button>
        </div>
      </form>

      {/* Duplicate Confirmation Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Similar Complaint Detected</h3>
                <p className="text-xs text-slate-500">
                  A matching complaint in {category} already exists in {area}.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              To expedite resolution and prevent municipal resource fragmentation, we recommend upvoting the existing complaint instead of filing a duplicate.
            </p>

            {duplicates[0] && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{duplicates[0].title}</span>
                  <StatusBadge status={duplicates[0].status} size="sm" />
                </div>
                <p className="text-slate-600 line-clamp-2">{duplicates[0].description}</p>
                <div className="flex items-center gap-3 text-slate-500 text-[10px] font-mono pt-1">
                  <span>{duplicates[0].area}</span>
                  <span>•</span>
                  <span className="text-teal-600 font-bold">{duplicates[0].upvotes} upvotes</span>
                  <span>•</span>
                  <PriorityBadge priority={duplicates[0].priority} size="sm" />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-slate-100">
              {duplicates[0] && (
                <button
                  type="button"
                  onClick={() => navigate(`/complaints/${duplicates[0]._id}`)}
                  className="w-full sm:w-auto px-4 py-2 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <ThumbsUp size={13} />
                  <span>Upvote Existing</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleForceSubmit}
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs uppercase tracking-wider"
              >
                Submit Anyway
              </button>
              <button
                type="button"
                onClick={() => setShowDuplicateModal(false)}
                className="w-full sm:w-auto px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
