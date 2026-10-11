'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Job } from '../types';
import { hasUnread, useApp } from '../context/AppContext';
import { avColor, initials, npr } from '../lib/constants';
import {
  Inbox,
  Check,
  CheckCircle2,
  MessageSquare,
  Star,
  Lock,
  Clock,
  Sparkles,
  AlertTriangle,
  X,
  ArrowUpDown,
  ShieldCheck,
  Award,
} from 'lucide-react';

type OfferSort = 'price' | 'rating' | 'new';

export const InboxSheet: React.FC<{ job: Job }> = ({ job }) => {
  const {
    t,
    lang,
    me,
    userById,
    ratingOf,
    assignWorker,
    featureJob,
    cancelJob,
    openChat,
    openSheet,
    markInboxSeen,
  } = useApp();

  const [sort, setSort] = useState<OfferSort>('price');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // remember which offers are "new" at open time, then mark all as seen
  const [newIds] = useState(() => new Set(job.bids.filter((b) => !b.seenByHost).map((b) => b.id)));
  useEffect(() => {
    markInboxSeen(job.id);
  }, [job.id, job.bids.length, markInboxSeen]);

  // two-step confirm auto-resets so a stray tap can't assign by accident
  useEffect(() => {
    if (!confirmId) return;
    const timer = setTimeout(() => setConfirmId(null), 3500);
    return () => clearTimeout(timer);
  }, [confirmId]);

  const bids = useMemo(() => {
    const arr = [...job.bids];
    if (sort === 'price') arr.sort((a, b) => a.amount - b.amount);
    if (sort === 'rating') arr.sort((a, b) => ratingOf(b.workerId, 'worker').avg - ratingOf(a.workerId, 'worker').avg);
    if (sort === 'new') arr.sort((a, b) => b.createdAt - a.createdAt);
    // the chosen helper always stays on top
    return arr.sort((a, b) => Number(b.id === job.assignedBidId) - Number(a.id === job.assignedBidId));
  }, [job.bids, job.assignedBidId, sort, ratingOf]);

  const onAssign = (bidId: string) => {
    if (confirmId === bidId) {
      assignWorker(job.id, bidId);
      setConfirmId(null);
    } else {
      setConfirmId(bidId);
    }
  };

  return (
    <div className="space-y-4 py-1 text-[var(--fg)]">
      {/* Header */}
      <div className="pb-2 border-b border-[var(--line)] pr-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center flex-none">
            <Inbox className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--fg)] truncate">
            {job.title}
          </h2>
        </div>
        <p className="text-xs text-[var(--fg-muted)]">
          {job.bids.length} {job.bids.length === 1 ? t('offers_inbox_one') : t('offers_inbox')} · {t('only_you_see')}
        </p>
      </div>

      {/* Host Job Management Bar */}
      {job.status === 'assigned' && (
        <div className="space-y-2 p-3.5 rounded-2xl bg-[var(--success-soft)] border border-[var(--success)]/30">
          <button
            type="button"
            className="w-full py-3 px-4 rounded-xl bg-[var(--success)] hover:opacity-90 text-white font-extrabold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            onClick={() => openSheet('workerReview', { jobId: job.id })}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('mark_done')}</span>
          </button>
          <button
            type="button"
            className="w-full py-2 text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--accent-text)] transition-colors flex items-center justify-center gap-1 cursor-pointer"
            onClick={() => openSheet('report', { jobId: job.id })}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t('report_issue')}</span>
          </button>
        </div>
      )}

      {job.status === 'closed' && (
        <div className="p-3.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--fg-muted)] flex items-center gap-2">
          <Lock className="w-4 h-4 text-[var(--fg-muted)] flex-none" />
          <span>{t('job_closed')}</span>
        </div>
      )}

      {job.status === 'open' && (
        <div className="flex items-center gap-2">
          {!job.featured && (
            <button
              type="button"
              className="flex-1 py-2 px-3 rounded-xl border border-[var(--warning)]/30 bg-[var(--warning-soft)] hover:opacity-90 text-[var(--warning)] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              onClick={() => featureJob(job.id)}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('feature_post')}</span>
            </button>
          )}
          <button
            type="button"
            className="flex-1 py-2 px-3 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] hover:opacity-90 text-[var(--accent-text)] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            onClick={() => cancelJob(job.id)}
          >
            <X className="w-3.5 h-3.5" />
            <span>{t('cancel_job')}</span>
          </button>
        </div>
      )}

      {/* Sort Buttons */}
      {job.bids.length > 1 && (
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs font-semibold">
          {(['price', 'rating', 'new'] as OfferSort[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setSort(k)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                sort === k
                  ? 'bg-[var(--surface)] text-[var(--primary)] font-extrabold shadow-2xs'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              {k === 'price' ? t('sort_price_low') : k === 'rating' ? t('sort_rating') : t('sort_new')}
            </button>
          ))}
        </div>
      )}

      {/* Offers List */}
      {bids.length === 0 ? (
        <div className="py-12 text-center text-xs text-[var(--fg-muted)] space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-[var(--surface-2)] text-[var(--primary)] flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <b className="block text-sm text-[var(--fg)]">{t('waiting')}</b>
          <p className="max-w-xs mx-auto">{t('only_host_sees')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bids.map((b) => {
            const w = userById(b.workerId);
            const r = ratingOf(b.workerId, 'worker');
            const chosen = job.assignedBidId === b.id;
            const locked = !!job.assignedBidId && !chosen;
            const unread = me ? hasUnread(b, 'host', me.id) : false;
            const showProfile = () => openSheet('profile', { userId: b.workerId, role: 'worker' });

            return (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border transition-all ${
                  chosen
                    ? 'border-[var(--success)] bg-[var(--success-soft)] ring-1 ring-[var(--success)]'
                    : locked
                    ? 'border-[var(--line)] bg-[var(--surface)] opacity-55'
                    : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-hover)]'
                }`}
              >
                {/* Worker Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={showProfile}
                      aria-label="View helper profile"
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-none shadow-2xs hover:scale-105 transition-transform cursor-pointer"
                      style={{ background: avColor(w?.name) }}
                    >
                      {initials(w?.name)}
                    </button>

                    <div className="min-w-0">
                      <div
                        className="font-extrabold text-sm text-[var(--fg)] flex items-center gap-1.5 cursor-pointer hover:text-[var(--primary)] transition-colors"
                        onClick={showProfile}
                      >
                        <span className="truncate">{w?.name}</span>
                        {w?.kycStatus === 'verified' && (
                          <ShieldCheck className="w-3.5 h-3.5 text-[var(--primary)] flex-none" />
                        )}
                        {newIds.has(b.id) && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[var(--accent-fill)] text-white">
                            NEW
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-[var(--fg-muted)] mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-[var(--fg)]">
                          {r.avg ? r.avg.toFixed(1) : t('new_helper')}
                        </span>
                        <span>· {r.count} {t('tasks_done')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Private Bid Price */}
                  <div className="text-right flex-none">
                    <div className="text-base font-extrabold text-[var(--primary)] font-mono">
                      {npr(b.amount)}
                    </div>
                    <span className="text-[10px] text-[var(--fg-muted)] block">
                      {t('private_bid')}
                    </span>
                  </div>
                </div>

                {/* Pitch */}
                <p className="text-xs text-[var(--fg)] bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--line)] leading-relaxed mb-3">
                  {b.pitch}
                </p>

                {b.counterAmount && (
                  <div className="mb-3 px-3 py-1.5 rounded-lg bg-[var(--warning-soft)] border border-[var(--warning)]/30 text-[var(--warning)] text-xs font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{npr(b.counterAmount)} · {t('counter_waiting')}</span>
                  </div>
                )}

                {/* Actions */}
                {locked ? (
                  <div className="flex items-center gap-1.5 text-xs text-[var(--fg-muted)]">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{t('chat_locked')}</span>
                  </div>
                ) : chosen ? (
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--line)]">
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[var(--success)]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('chosen')}</span>
                    </span>
                    <button
                      type="button"
                      className="py-2 px-3.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer relative"
                      onClick={() => openChat(job.id, b.id, 'host')}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{t('open_chat')}</span>
                      {unread && (
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-fill)] ring-2 ring-white absolute -top-1 -right-1" />
                      )}
                    </button>
                  </div>
                ) : job.status === 'open' ? (
                  <div className="flex items-center gap-2 pt-1 border-t border-[var(--line)]">
                    <button
                      type="button"
                      className="flex-1 py-2 px-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:bg-[var(--line)] text-[var(--fg)] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer relative"
                      onClick={() => openChat(job.id, b.id, 'host')}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[var(--primary)]" />
                      <span>{b.chat.length ? t('continue_chat') : t('start_chat')}</span>
                      {unread && (
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-fill)] ring-2 ring-white absolute -top-1 -right-1" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onAssign(b.id)}
                      className={`py-2 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        confirmId === b.id
                          ? 'bg-[var(--success)] text-white animate-pulse'
                          : 'bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white shadow-[var(--shadow-cta)]'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{confirmId === b.id ? t('assign_confirm') : t('choose')}</span>
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
