'use client';

import React, { useState } from 'react';
import { Job } from '../types';
import { useApp } from '../context/AppContext';
import {
  Star,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Send,
  ShieldCheck,
} from 'lucide-react';

interface ReviewModalProps {
  type: 'workerReview' | 'hostReview' | 'report';
  job: Job;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ type, job }) => {
  const {
    t,
    lang,
    userById,
    submitWorkerReview,
    submitHostReview,
    showToast,
    closeSheet,
  } = useApp();

  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);
  const [comment, setComment] = useState('');

  const assignedBid = job.bids.find((x) => x.id === job.assignedBidId);
  const worker = userById(assignedBid?.workerId || '');
  const host = userById(job.hostId);

  const handleWorkerReviewSubmit = () => {
    if (!a || !b || !c) {
      showToast(t('rate_all'));
      return;
    }
    submitWorkerReview(job.id, a, b, c, comment);
  };

  const handleHostReviewSubmit = () => {
    if (!a || !b || !c) {
      showToast(t('rate_all'));
      return;
    }
    submitHostReview(job.id, a, b, c, comment);
  };

  const handleReportSubmit = () => {
    showToast(lang === 'ne' ? 'तपाईंको गुनासो दर्ता भयो। सहयोग टोलीले समीक्षा गर्नेछ।' : 'Report received. Support team will review shortly.');
    closeSheet();
  };

  const renderStarPicker = (val: number, setVal: (n: number) => void) => {
    return (
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setVal(n)}
            aria-label={`${n} stars`}
            className="p-1 rounded-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                n <= val
                  ? 'fill-amber-400 text-amber-400 drop-shadow-2xs'
                  : 'text-[var(--line)] hover:text-amber-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (type === 'report') {
    return (
      <div className="space-y-4 py-1 text-[var(--fg)]">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--line)] pr-8">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] text-[var(--accent-text)] border border-[var(--accent)]/30 flex items-center justify-center flex-none">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-[var(--fg)]">
              {t('report_issue')}
            </h2>
            <p className="text-xs text-[var(--fg-muted)]">{job.title}</p>
          </div>
        </div>

        <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
          {lang === 'ne'
            ? 'कुनै समस्या वा असहज अवस्था परेको भए कृपया हामीलाई जानकारी दिनुहोस्। हामी २४ घण्टाभित्र समीक्षा गर्नेछौं।'
            : 'If you encountered an issue or safety concern, please describe it below. Our team reviews disputes promptly.'}
        </p>

        <div>
          <label className="block text-xs font-bold text-[var(--fg)] mb-1.5">
            {lang === 'ne' ? 'समस्याको विवरण' : 'Details of the issue'}
          </label>
          <textarea
            placeholder={t('comment_ph')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 shadow-2xs resize-none"
          />
        </div>

        <button
          type="button"
          onClick={handleReportSubmit}
          className="w-full py-3.5 px-4 rounded-xl bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white font-extrabold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>{t('send')}</span>
        </button>
      </div>
    );
  }

  if (type === 'workerReview') {
    return (
      <div className="space-y-4 py-1 text-[var(--fg)]">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--line)] pr-8">
          <div className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center flex-none">
            <Star className="w-4 h-4 fill-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-[var(--fg)]">
              {t('review_worker')}
            </h2>
            <p className="text-xs text-[var(--fg-muted)] truncate max-w-[260px]">
              {worker?.name || 'Helper'} · {job.title}
            </p>
          </div>
        </div>

        <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
          {t('both_ways')}
        </p>

        <div className="space-y-3 bg-[var(--surface-2)] p-4 rounded-2xl border border-[var(--line)]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[var(--fg)]">{t('rate_punctual')}</span>
            {renderStarPicker(a, setA)}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-[var(--line)] pt-3">
            <span className="text-xs font-bold text-[var(--fg)]">{t('rate_quality')}</span>
            {renderStarPicker(b, setB)}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-[var(--line)] pt-3">
            <span className="text-xs font-bold text-[var(--fg)]">{t('rate_attitude')}</span>
            {renderStarPicker(c, setC)}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--fg)] mb-1.5">
            {t('public_comment')}
          </label>
          <textarea
            placeholder={t('comment_ph')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 shadow-2xs resize-none"
          />
        </div>

        <button
          type="button"
          onClick={handleWorkerReviewSubmit}
          className="w-full py-3.5 px-4 rounded-xl bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white font-extrabold text-sm transition-all shadow-[var(--shadow-cta)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{t('mark_done')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-1 text-[var(--fg)]">
      <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--line)] pr-8">
        <div className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center flex-none">
          <Star className="w-4 h-4 fill-[var(--primary)]" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-[var(--fg)]">
            {t('review_host')}
          </h2>
          <p className="text-xs text-[var(--fg-muted)] truncate max-w-[260px]">
            {host?.name || 'Poster'} · {job.title}
          </p>
        </div>
      </div>

      <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
        {t('both_ways')}
      </p>

      <div className="space-y-3 bg-[var(--surface-2)] p-4 rounded-2xl border border-[var(--line)]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-[var(--fg)]">{t('rate_payment')}</span>
          {renderStarPicker(a, setA)}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[var(--line)] pt-3">
          <span className="text-xs font-bold text-[var(--fg)]">{t('rate_comm')}</span>
          {renderStarPicker(b, setB)}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[var(--line)] pt-3">
          <span className="text-xs font-bold text-[var(--fg)]">{t('rate_safety')}</span>
          {renderStarPicker(c, setC)}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[var(--fg)] mb-1.5">
          {t('public_comment')}
        </label>
        <textarea
          placeholder={t('comment_ph')}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 shadow-2xs resize-none"
        />
      </div>

      <button
        type="button"
        onClick={handleHostReviewSubmit}
        className="w-full py-3.5 px-4 rounded-xl bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white font-extrabold text-sm transition-all shadow-[var(--shadow-cta)] flex items-center justify-center gap-2 cursor-pointer"
      >
        <CheckCircle2 className="w-4 h-4 text-white" />
        <span>{t('mark_done')}</span>
      </button>
    </div>
  );
};
