import React from 'react';
import { ComplaintStatus } from '../types';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold'
  };

  switch (status) {
    case 'pending':
      return (
        <span
          id={`badge-status-${status}`}
          className={`inline-flex items-center rounded-full bg-amber-50/80 text-amber-700 border border-amber-200/70 ${sizeClasses[size]}`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
          <span>Pending</span>
        </span>
      );
    case 'in-progress':
      return (
        <span
          id={`badge-status-${status}`}
          className={`inline-flex items-center rounded-full bg-indigo-50/80 text-indigo-700 border border-indigo-200/70 ${sizeClasses[size]}`}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
          <span>In Progress</span>
        </span>
      );
    case 'resolved':
      return (
        <span
          id={`badge-status-${status}`}
          className={`inline-flex items-center rounded-full bg-emerald-50/80 text-emerald-700 border border-emerald-200/70 ${sizeClasses[size]}`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
          <span>Resolved</span>
        </span>
      );
    default:
      return (
        <span
          id="badge-status-unknown"
          className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses[size]}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
          <span>{status}</span>
        </span>
      );
  }
};
