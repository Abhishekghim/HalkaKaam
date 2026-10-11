'use client';

import React from 'react';
import { ShieldCheck, Zap, Star, CheckCircle2, Clock } from 'lucide-react';
import { JobStatus } from '../../types';

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
  lang?: 'en' | 'ne';
  showLabel?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  className = '',
  size = 'sm',
  lang = 'en',
  showLabel = true,
}) => {
  const isSm = size === 'sm';
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success-border)] select-none ${
        isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      } ${className}`}
      title="Verified with Nepal Government Citizenship / NID"
    >
      <ShieldCheck className={isSm ? 'w-3 h-3 text-[var(--success)]' : 'w-3.5 h-3.5 text-[var(--success)]'} />
      {showLabel && <span>{lang === 'ne' ? 'प्रमाणित' : 'Verified'}</span>}
    </span>
  );
};

export const UrgentBadge: React.FC<{ className?: string; lang?: 'en' | 'ne' }> = ({
  className = '',
  lang = 'en',
}) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full bg-[var(--accent-fill)] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs select-none ${className}`}
  >
    <Zap className="w-3 h-3 text-white fill-white" />
    <span>{lang === 'ne' ? 'जरुरी' : 'Urgent'}</span>
  </span>
);

export const FeaturedBadge: React.FC<{ className?: string; lang?: 'en' | 'ne' }> = ({
  className = '',
  lang = 'en',
}) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning-border)] px-2 py-0.5 text-[11px] font-bold select-none ${className}`}
  >
    <Star className="w-3 h-3 fill-[var(--star)] text-[var(--star)]" />
    <span>{lang === 'ne' ? 'फिचर' : 'Featured'}</span>
  </span>
);

export const JobStatusBadge: React.FC<{ status: JobStatus; lang?: 'en' | 'ne'; className?: string }> = ({
  status,
  lang = 'en',
  className = '',
}) => {
  switch (status) {
    case 'open':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary-border)] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
          <span>{lang === 'ne' ? 'खुला' : 'Open'}</span>
        </span>
      );
    case 'assigned':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning-border)] ${className}`}>
          <Clock className="w-3 h-3 text-[var(--warning)]" />
          <span>{lang === 'ne' ? 'भइरहेको' : 'In Progress'}</span>
        </span>
      );
    case 'done':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success-border)] ${className}`}>
          <CheckCircle2 className="w-3 h-3 text-[var(--success)]" />
          <span>{lang === 'ne' ? 'सम्पन्न' : 'Completed'}</span>
        </span>
      );
    case 'closed':
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--surface-2)] text-[var(--fg-muted)] border border-[var(--line)] ${className}`}>
          <span>{lang === 'ne' ? 'बन्द' : 'Closed'}</span>
        </span>
      );
  }
};

