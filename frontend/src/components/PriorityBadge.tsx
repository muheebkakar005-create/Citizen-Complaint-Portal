import React from 'react';
import { PriorityLevel } from '../types';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  score,
  showScore = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1'
  };

  const getDetails = () => {
    switch (priority) {
      case 'CRITICAL':
        return {
          classes: 'bg-brand-pink/15 text-brand-pink border-brand-pink/40',
          label: 'Critical'
        };
      case 'HIGH':
        return {
          classes: 'bg-rose-100 text-brand-pink border-brand-pink/30',
          label: 'High'
        };
      case 'MEDIUM':
        return {
          classes: 'bg-brand-cyan/15 text-slate-800 border-brand-cyan/40',
          label: 'Medium'
        };
      case 'LOW':
      default:
        return {
          classes: 'bg-slate-200 text-slate-700 border-slate-300',
          label: 'Low'
        };
    }
  };

  const { classes, label } = getDetails();

  return (
    <span
      id={`priority-badge-${label.toLowerCase()}`}
      className={`inline-flex items-center font-black uppercase rounded tracking-wider border shrink-0 ${classes} ${sizeClasses[size]}`}
    >
      <span>{label}</span>
      {showScore && score !== undefined && (
        <span className="ml-1 text-[9px] font-mono font-medium opacity-85 border-l border-current/40 pl-1">
          {score}pt
        </span>
      )}
    </span>
  );
};
