'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { npr } from '../lib/constants';
import { catName, trText, toNepaliNum } from '../lib/i18n';
import { CategoryIconTile } from './ui/CategoryIconTile';
import { JobStatusBadge } from './ui/StatusBadge';
import { Plus, Inbox, ChevronRight, FolderOpen } from 'lucide-react';

export const HostJobs: React.FC = () => {
  const {
    t,
    lang,
    jobs,
    me,
    userById,
    setTab,
    openSheet,
  } = useApp();

  const myPostedJobs = jobs
    .filter((j) => (me ? j.hostId === me.id : false))
    .sort((a, b) => b.createdAt - a.createdAt);

  const getAssignedWorkerName = (j: (typeof jobs)[number]) => {
    const b = j.bids.find((x) => x.id === j.assignedBidId);
    return userById(b?.workerId)?.name || '—';
  };

  if (!myPostedJobs.length) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-[var(--fg)] mb-2">
            {lang === 'ne' ? 'तपाईंले कुनै काम पोस्ट गर्नुभएको छैन' : 'No tasks posted yet'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--fg-muted)] max-w-sm mx-auto mb-6 leading-relaxed">
            {lang === 'ne'
              ? 'घर सरसफाइ, सामान सार्ने वा कुनै पनि काममा सहयोग चाहिएको छ? अहिले नै निःशुल्क पोस्ट गर्नुहोस्।'
              : 'Need help around the house or office? Post a task in minutes and choose from local student pitches.'}
          </p>
          <button
            type="button"
            onClick={() => setTab('post')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white text-sm font-extrabold shadow-cta transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{lang === 'ne' ? 'नयाँ काम पोस्ट गर्नुहोस्' : 'Post a Task (Free)'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black text-[var(--fg)] tracking-tight">
          {t('nav_myjobs')} ({toNepaliNum(myPostedJobs.length, lang)})
        </h2>
        <button
          type="button"
          onClick={() => setTab('post')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold shadow-2xs active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>{lang === 'ne' ? 'नयाँ काम' : 'New Task'}</span>
        </button>
      </div>

      <div className="space-y-3">
        {myPostedJobs.map((j) => {
          const off = j.bids.length;
          return (
            <div
              key={j.id}
              className="p-4 sm:p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--primary)] transition-all cursor-pointer card-lift shadow-xs"
              onClick={() => openSheet('inbox', { jobId: j.id })}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <CategoryIconTile cat={j.cat} size="sm" />
                  <span className="text-xs font-bold text-[var(--fg-muted)]">
                    {catName(j.cat, lang)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mukta text-xl font-black text-[var(--primary)] leading-none">
                    {npr(j.price)}
                  </span>
                  <span className="text-[10px] font-bold text-[var(--fg-subtle)] uppercase block">
                    {j.ptype === 'Hourly' ? t('hourly') : t('flat')}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-extrabold text-[var(--fg)] mb-3 leading-snug line-clamp-1">
                {trText(j.title, lang)}
              </h3>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--line)] text-xs">
                <JobStatusBadge status={j.status} lang={lang} />
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)]">
                  <Inbox className="w-4 h-4" />
                  <span>
                    {toNepaliNum(off, lang)} {off === 1 ? t('offers_inbox_one') : t('offers_inbox')}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
