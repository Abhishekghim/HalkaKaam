'use client';

import React from 'react';
import { Job } from '../types';
import { useApp } from '../context/AppContext';
import { npr, timeAgo } from '../lib/constants';
import { catName } from '../lib/i18n';
import { CategoryIconTile } from './ui/CategoryIconTile';
import { UrgentBadge, FeaturedBadge, VerifiedBadge } from './ui/StatusBadge';
import { PaymentBadges } from './ui/PaymentBadges';
import {
  MapPin,
  Globe,
  Calendar,
  MessageSquare,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';

interface JobCardProps {
  job: Job;
  dist: number | null;
}

export const JobCard: React.FC<JobCardProps> = ({ job, dist }) => {
  const { t, lang, me, openSheet, userById } = useApp();
  const mine = me ? job.bids.some((b) => b.workerId === me.id) : false;
  const host = userById(job.hostId);
  const isHostVerified = host?.kycStatus === 'verified';

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
      className={`group relative rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between border card-lift select-none ${
        job.featured
          ? 'border-[var(--warning-border)] bg-gradient-to-b from-[var(--warning-soft)] via-[var(--surface)] to-[var(--surface)] shadow-md ring-1 ring-[var(--warning-border)]'
          : 'border-[var(--line)] bg-[var(--surface)] shadow-sm hover:shadow-md hover:border-[var(--primary)]'
      }`}
    >
      <div>
        {/* Top Badges & Time Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {job.urgent && <UrgentBadge lang={lang} />}
            {job.featured && <FeaturedBadge lang={lang} />}
            <div className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-bold text-[var(--primary)] border border-[var(--primary-border)] shadow-2xs">
              <CategoryIconTile cat={job.cat} size="sm" />
              <span>{catName(job.cat, lang)}</span>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-[var(--fg-subtle)] whitespace-nowrap">
            {timeAgo(job.createdAt)} {t('ago')}
          </span>
        </div>

        {/* Task Title */}
        <h3 className="text-[15px] sm:text-base font-extrabold text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors line-clamp-2 leading-snug mb-1.5">
          {job.title}
        </h3>

        {/* Description Snippet */}
        {job.desc && (
          <p className="text-xs text-[var(--fg-muted)] line-clamp-2 leading-relaxed mb-3 font-medium">
            {job.desc}
          </p>
        )}

        {/* Uploaded Task Photos Preview */}
        {job.photos && job.photos.length > 0 && (
          <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar">
            {job.photos.slice(0, 3).map((p, idx) => (
              <img
                key={idx}
                src={p}
                alt={`${job.title} photo ${idx + 1}`}
                className="w-16 h-16 rounded-xl object-cover border border-[var(--line)] shrink-0"
              />
            ))}
            {job.photos.length > 3 && (
              <span className="text-xs font-bold text-[var(--fg-muted)] px-1.5">
                +{job.photos.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Location & Time Tags */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3 text-xs">
          <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold border border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg)]">
            {job.type === 'Virtual' ? (
              <>
                <Globe className="w-3.5 h-3.5 text-[var(--fg-muted)]" />
                <span>{t('virtual')}</span>
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>
                  {dist !== null
                    ? `${dist.toFixed(1)} km ${lang === 'ne' ? 'टाढा' : 'away'}`
                    : job.address || (lang === 'ne' ? 'नजिकै' : 'Near you')}
                </span>
              </>
            )}
          </span>

          {job.when && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--surface-2)] px-2.5 py-1 text-[var(--fg-muted)] font-medium text-[11px] border border-[var(--line)]">
              <Calendar className="w-3.5 h-3.5 text-[var(--fg-subtle)]" />
              <span className="truncate max-w-[150px]">{job.when}</span>
            </span>
          )}

          {isHostVerified && (
            <VerifiedBadge size="sm" lang={lang} showLabel={false} />
          )}
        </div>

        {/* Payment Methods Accepted */}
        <div className="mb-3.5">
          <PaymentBadges size="sm" lang={lang} />
        </div>
      </div>

      {/* Bottom Footer: Price & Applicants */}
      <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 mt-1">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mukta text-xl sm:text-2xl font-black text-[var(--primary)] leading-none">
              {npr(job.price)}
            </span>
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary-border)] align-middle">
              {job.ptype === 'Hourly' ? t('hourly') : t('flat')}
            </span>
          </div>
          {perHour && (
            <span className="text-[11px] font-bold text-[var(--fg-subtle)] block mt-0.5">
              ≈ {npr(perHour)}{t('per_hr')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {mine ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-bold text-white shadow-2xs">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
              <span>{t('you_offered')}</span>
            </span>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] bg-[var(--primary-soft)] hover:bg-[var(--primary-soft-hover)] px-3 py-1.5 rounded-full border border-[var(--primary-border)] transition-colors">
              <MessageSquare className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>
                {job.bids.length > 0
                  ? `${job.bids.length} ${job.bids.length === 1 ? t('applied_one') : t('applied_count')}`
                  : lang === 'ne'
                  ? 'पहिलो प्रस्ताव दिनुहोस्'
                  : 'Be the first!'}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--primary)] group-hover:translate-x-0.5 transition-transform" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
