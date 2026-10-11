'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { npr } from '../lib/constants';
import { catName } from '../lib/i18n';
import { CategoryIconTile } from './ui/CategoryIconTile';
import { Handshake, MessageSquare, Star, ArrowRight, Clock } from 'lucide-react';

export const WorkerOffers: React.FC = () => {
  const {
    t,
    lang,
    jobs,
    me,
    openChat,
    openSheet,
    setTab,
  } = useApp();

  const myBidsJobs = jobs.filter((j) =>
    me ? j.bids.some((b) => b.workerId === me.id) : false
  );

  if (!myBidsJobs.length) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center mx-auto mb-4">
            <Handshake className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-[var(--fg)] mb-2">
            {lang === 'ne' ? 'कुनै प्रस्ताव पठाइएको छैन' : 'No offers sent yet'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--fg-muted)] max-w-sm mx-auto mb-6 leading-relaxed">
            {lang === 'ne'
              ? 'आफ्नो नजिकका कामहरू हेर्नुहोस् र उचित दरमा प्रस्ताव पठाएर काम सुरु गर्नुहोस्।'
              : 'Browse open tasks around your neighborhood, submit your best pitch, and start earning.'}
          </p>
          <button
            type="button"
            onClick={() => setTab('feed')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-extrabold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span>{t('nav_find')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black text-[var(--fg)] tracking-tight">
          {t('my_offers')} ({myBidsJobs.length})
        </h2>
      </div>

      <div className="space-y-3.5">
        {myBidsJobs.map((j) => {
          const myBid = j.bids.find((b) => b.workerId === me?.id);
          if (!myBid) return null;

          const isAssigned = j.assignedBidId === myBid.id;
          const isDone = j.status === 'done';
          const hasChat = myBid.chat && myBid.chat.length > 0;
          const otherAssigned = j.assignedBidId && !isAssigned;

          return (
            <div
              key={j.id}
              className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs card-lift"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <CategoryIconTile cat={j.cat} size="sm" />
                  <span className="text-xs font-bold text-[var(--fg-muted)]">
                    {catName(j.cat, lang)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mukta text-xl font-black text-[var(--success)] leading-none">
                    {npr(myBid.amount)}
                  </span>
                  <span className="text-[10px] font-bold text-[var(--fg-subtle)] uppercase block mt-0.5">
                    {t('your_offer')}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-extrabold text-[var(--fg)] mb-2.5 leading-snug">
                {j.title}
              </h3>

              {/* Status pill */}
              <div className="mb-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    isDone
                      ? 'bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success)]/30'
                      : isAssigned
                      ? 'bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary-border)]'
                      : otherAssigned
                      ? 'bg-[var(--surface-2)] text-[var(--fg-muted)] border border-[var(--line)]'
                      : 'bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning)]/30'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>
                    {isDone
                      ? t('completed') + ' ✓'
                      : isAssigned
                      ? t('you_assigned')
                      : otherAssigned
                      ? t('not_chosen')
                      : t('waiting')}
                  </span>
                </span>
              </div>

              {/* Pitch text */}
              <div className="p-3.5 rounded-xl bg-[var(--surface-2)] text-xs text-[var(--fg)] leading-relaxed font-medium border border-[var(--line)] mb-3">
                <b className="text-[var(--fg)]">{t('your_pitch')}:</b> {myBid.pitch}
              </div>

              {/* Chat or Review Actions */}
              <div className="flex gap-2 flex-wrap pt-1">
                {isDone && !j.reviews.workerToHost && (
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] hover:border-[var(--primary)] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    onClick={() => openSheet('hostReview', { jobId: j.id })}
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{t('review_host')}</span>
                  </button>
                )}

                {(isAssigned || hasChat) && (
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    onClick={() => openChat(j.id, myBid.id, 'worker')}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t('open_chat')}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
