'use client';

import React from 'react';
import { Job } from '../types';
import { useApp } from '../context/AppContext';
import { npr, timeAgo } from '../lib/constants';
import { CATICON, catName } from '../lib/i18n';

interface JobCardProps {
  job: Job;
  dist: number | null;
}

export const JobCard: React.FC<JobCardProps> = ({ job, dist }) => {
  const { t, lang, me, openSheet } = useApp();
  const mine = me ? job.bids.some((b) => b.workerId === me.id) : false;
  const perHour =
    job.ptype === 'Flat' && job.hours && job.hours > 0
      ? Math.round(job.price / job.hours)
      : null;

  return (
    <div
      onClick={() => openSheet('jobDetail', { jobId: job.id })}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && openSheet('jobDetail', { jobId: job.id })}
      className={`group relative rounded-2xl bg-white p-4 sm:p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between border ${
        job.featured
          ? 'border-amber-300 shadow-md ring-2 ring-amber-300/40 bg-gradient-to-b from-amber-50/25 via-white to-white'
          : 'border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {job.urgent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-black text-white shadow-xs">
                <span>🔥</span>
                <span>{t('urgent')}</span>
              </span>
            )}
            {job.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-black text-amber-800 border border-amber-200">
                ★ {lang === 'ne' ? 'फिचर' : 'Featured'}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100/90 px-2.5 py-0.5 text-xs font-bold text-slate-700 border border-slate-200/80">
              <span>{CATICON[job.cat] || '📦'}</span>
              <span>{catName(job.cat, lang)}</span>
            </span>
          </div>

          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
            {timeAgo(job.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] sm:text-base font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug mb-1.5">
          {job.title}
        </h3>

        {/* Description Snippet */}
        {job.desc && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3 font-medium">
            {job.desc}
          </p>
        )}

        {/* Location & Time Tags */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3.5 text-xs">
          <span
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold border ${
              job.type === 'Virtual'
                ? 'bg-blue-50 text-blue-700 border-blue-200/80'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
            }`}
          >
            {job.type === 'Virtual' ? (
              <>
                <span>🌐</span>
                <span>{t('virtual')}</span>
              </>
            ) : (
              <>
                <span>📍</span>
                <span>{dist !== null ? `${dist.toFixed(1)} km away` : 'Near you'}</span>
              </>
            )}
          </span>

          {job.when && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100/80 px-2 py-1 text-slate-600 font-semibold text-[11px] border border-slate-200/60">
              <span>🗓</span>
              <span className="truncate max-w-[150px]">{job.when}</span>
            </span>
          )}
        </div>
      </div>

      {/* Bottom Footer: Price & Applicants */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mukta text-xl sm:text-2xl font-black text-emerald-700 leading-none">
              {npr(job.price)}
            </span>
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 align-middle">
              {job.ptype === 'Hourly' ? t('hourly') : t('flat')}
            </span>
          </div>
          {perHour && (
            <span className="text-[11px] font-bold text-slate-400 block mt-0.5">
              ≈ {npr(perHour)}{t('per_hr')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {mine ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-2xs">
              <span>✓</span>
              <span>{t('you_offered')}</span>
            </span>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 px-3 py-1.5 rounded-full border border-slate-200/90 transition-colors">
              <span>💬</span>
              <span>
                {job.bids.length > 0
                  ? `${job.bids.length} ${job.bids.length === 1 ? t('applied_one') : t('applied_count')}`
                  : lang === 'ne'
                  ? 'पहिलो प्रस्ताव दिनुहोस्'
                  : 'Be the first!'}
              </span>
              <span className="text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-transform ml-0.5">
                ›
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
