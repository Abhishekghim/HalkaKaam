'use client';

import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { JobCard } from './JobCard';
import { CATS, CATICON, catName } from '../lib/i18n';
import { kmDist } from '../lib/constants';
import { FeedFilters, Job, SortPreference } from '../types';

export const WorkerFeed: React.FC = () => {
  const {
    t,
    lang,
    jobs,
    pos,
    radius,
    locName,
    setView,
    openSheet,
    filters,
    setFilters,
    resetFilters,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOpen, setSortOpen] = useState(false);

  const sortOptions: { key: SortPreference; label: string; short: string }[] = [
    { key: 'distance', label: lang === 'ne' ? 'डिफल्ट (नजिकको)' : 'Default (nearest)', short: lang === 'ne' ? 'डिफल्ट' : 'Default' },
    { key: 'price_high', label: lang === 'ne' ? 'रकम: धेरैबाट थोरै' : 'Price: High to Low', short: lang === 'ne' ? 'धेरै → थोरै' : 'High → Low' },
    { key: 'price_low', label: lang === 'ne' ? 'रकम: थोरैबाट धेरै' : 'Price: Low to High', short: lang === 'ne' ? 'थोरै → धेरै' : 'Low → High' },
    { key: 'newest', label: lang === 'ne' ? 'नयाँ पहिले' : 'Newest', short: lang === 'ne' ? 'नयाँ' : 'Newest' },
  ];

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.cat !== 'All') count++;
    if (filters.type !== 'All') count++;
    if (filters.urgentOnly) count++;
    if (filters.priceRange !== 'All') count++;
    if (filters.sortBy !== 'distance') count++;
    return count;
  }, [filters]);

  // Distance calculator and filtering
  const processedJobs = useMemo(() => {
    return jobs
      .filter((j) => j.status === 'open')
      .map((job) => {
        let dist: number | null = null;
        if (job.type !== 'Virtual' && job.lat !== undefined && job.lng !== undefined) {
          dist = kmDist(pos, { lat: job.lat, lng: job.lng });
        }
        return { job, dist };
      })
      .filter(({ job, dist }) => {
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = job.title.toLowerCase().includes(q);
          const matchesDesc = (job.desc || '').toLowerCase().includes(q);
          const matchesArea = (job.address || '').toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesArea) return false;
        }

        // Category filter
        if (filters.cat !== 'All' && job.cat !== filters.cat) {
          return false;
        }

        // Type filter (In-person vs Virtual)
        if (filters.type !== 'All' && job.type !== filters.type) {
          return false;
        }

        // Urgent filter
        if (filters.urgentOnly && !job.urgent) {
          return false;
        }

        // Price range filter
        if (filters.priceRange === 'under500' && job.price >= 500) return false;
        if (
          filters.priceRange === '500to1500' &&
          (job.price < 500 || job.price > 1500)
        )
          return false;
        if (filters.priceRange === 'over1500' && job.price <= 1500)
          return false;

        return true;
      });
  }, [jobs, pos, searchQuery, filters]);

  // Progressive distance-based categorization
  const { nearbyJobs, fartherJobs, virtualJobs, totalCount } = useMemo(() => {
    const nearby: { job: Job; dist: number | null }[] = [];
    const farther: { job: Job; dist: number | null }[] = [];
    const virtual: { job: Job; dist: number | null }[] = [];

    const sortFn = (
      a: { job: Job; dist: number | null },
      b: { job: Job; dist: number | null }
    ) => {
      if (filters.sortBy === 'price_high') return b.job.price - a.job.price;
      if (filters.sortBy === 'price_low') return a.job.price - b.job.price;
      if (filters.sortBy === 'newest') return b.job.createdAt - a.job.createdAt;

      // Default: distance-based stream
      if (a.dist !== null && b.dist !== null) return a.dist - b.dist;
      if (a.dist !== null) return -1;
      if (b.dist !== null) return 1;
      return b.job.createdAt - a.job.createdAt;
    };

    const sorted = [...processedJobs].sort(sortFn);

    sorted.forEach((item) => {
      if (item.job.type === 'Virtual') {
        virtual.push(item);
      } else if (item.dist !== null && item.dist <= radius) {
        nearby.push(item);
      } else {
        farther.push(item);
      }
    });

    return {
      nearbyJobs: nearby,
      fartherJobs: farther,
      virtualJobs: virtual,
      totalCount: sorted.length,
    };
  }, [processedJobs, radius, filters.sortBy]);

  return (
    <div className="worker-feed space-y-4 pb-12">
      {/* Location Banner (Modern Clean Bar) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setView('locstep')}
        className="w-full flex items-center justify-between p-3 px-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all text-left cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-lg flex-none border border-blue-100 shadow-2xs">
            📍
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {t('your_location')}
            </span>
            <span className="text-sm font-extrabold text-slate-900 truncate block">
              {locName || 'Kathmandu Valley'} · {t('within')} {radius} km
            </span>
          </div>
        </div>
        <span className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap">
          {t('change')} ›
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_ph')}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-xs flex items-center justify-center hover:bg-slate-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
            className={`flex items-center gap-1.5 px-3.5 rounded-xl border font-bold text-xs transition-all whitespace-nowrap shadow-xs h-[42px] ${
              filters.sortBy !== 'distance'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>⇅</span>
            <span>{sortOptions.find((o) => o.key === filters.sortBy)?.short}</span>
            <span className="text-[10px]">▾</span>
          </button>

          {sortOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
              <ul
                role="listbox"
                className="absolute right-0 top-full mt-1.5 z-50 w-52 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5"
              >
                {sortOptions.map((o) => {
                  const on = filters.sortBy === o.key;
                  return (
                    <li key={o.key} role="option" aria-selected={on}>
                      <button
                        type="button"
                        onClick={() => {
                          setFilters((prev: FeedFilters) => ({ ...prev, sortBy: o.key }));
                          setSortOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-left hover:bg-slate-50 ${
                          on ? 'font-bold text-blue-700' : 'font-medium text-slate-700'
                        }`}
                      >
                        <span>{o.label}</span>
                        {on && <span>✓</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Category Pills Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => setFilters((prev: FeedFilters) => ({ ...prev, cat: 'All' }))}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
            filters.cat === 'All'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {lang === 'ne' ? 'सबै' : 'All'}
        </button>

        {/* Urgent Quick Toggle Pill */}
        <button
          type="button"
          onClick={() =>
            setFilters((prev: FeedFilters) => ({ ...prev, urgentOnly: !prev.urgentOnly }))
          }
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border flex items-center gap-1 transition-all ${
            filters.urgentOnly
              ? 'bg-red-600 text-white border-red-600 shadow-xs'
              : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
          }`}
        >
          <span>🔥</span>
          <span>{t('urgent')}</span>
        </button>

        {/* Categories */}
        {CATS.map((c) => {
          const isSelected = filters.cat === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setFilters((prev: FeedFilters) => ({ ...prev, cat: c }))}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border flex items-center gap-1.5 transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{CATICON[c]}</span>
              <span>{catName(c, lang)}</span>
            </button>
          );
        })}
      </div>

      {/* Active Filter Tags Bar (if any filters active) */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs">
          <span className="text-[11px] font-bold text-slate-400">
            {lang === 'ne' ? 'सक्रिय:' : 'Active:'}
          </span>
          {filters.cat !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs">
              {catName(filters.cat, lang)}
              <button
                type="button"
                onClick={() => setFilters((prev: FeedFilters) => ({ ...prev, cat: 'All' }))}
                className="hover:text-blue-900 ml-1 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </span>
          )}
          {filters.type !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs">
              {filters.type === 'In-person' ? `📍 ${t('f_inperson')}` : `🌐 ${t('f_online')}`}
              <button
                type="button"
                onClick={() => setFilters((prev: FeedFilters) => ({ ...prev, type: 'All' }))}
                className="hover:text-blue-900 ml-1 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </span>
          )}
          {filters.urgentOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold text-xs">
              🔥 {t('urgent')}
              <button
                type="button"
                onClick={() => setFilters((prev: FeedFilters) => ({ ...prev, urgentOnly: false }))}
                className="hover:text-red-900 ml-1 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </span>
          )}
          {filters.priceRange !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs">
              💰 {filters.priceRange === 'under500' ? '< रु 500' : filters.priceRange === '500to1500' ? 'रु 500–1500' : '> रु 1500'}
              <button
                type="button"
                onClick={() => setFilters((prev: FeedFilters) => ({ ...prev, priceRange: 'All' }))}
                className="hover:text-emerald-950 ml-1 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </span>
          )}
          {filters.sortBy !== 'distance' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs">
              {filters.sortBy === 'price_high' ? '💰 Highest pay' : filters.sortBy === 'price_low' ? '🏷️ Lowest pay' : '⏱️ Newest'}
              <button
                type="button"
                onClick={() => setFilters((prev: FeedFilters) => ({ ...prev, sortBy: 'distance' }))}
                className="hover:text-indigo-900 ml-1 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] font-bold text-rose-600 hover:underline ml-1"
          >
            {lang === 'ne' ? 'सबै हटाउनुहोस्' : 'Clear all'}
          </button>
        </div>
      )}

      {/* Empty State when no jobs match */}
      {totalCount === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200 p-8 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 text-3xl flex items-center justify-center mx-auto mb-3 border border-slate-100">
            🔭
          </div>
          <h3 className="text-base font-extrabold text-slate-900 mb-1">
            {t('no_jobs')}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
            {t('no_jobs_sub')}
          </p>
          <div className="flex items-center justify-center gap-2">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="btn btn-outline btn-sm font-bold"
              >
                {lang === 'ne' ? 'फिल्टर हटाउनुहोस्' : 'Reset Filters'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setView('locstep')}
              className="btn btn-primary btn-sm font-bold"
            >
              {t('widen')}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 pt-1">
          {/* SECTION 1: NEARBY TASKS (WITHIN USER'S RADIUS) */}
          {nearbyJobs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    {lang === 'ne' ? 'तपाईं नजिकका काम' : 'Tasks Around You'}
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {nearbyJobs.length} {lang === 'ne' ? 'काम' : 'tasks within'} {radius} km
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {nearbyJobs.map(({ job, dist }) => (
                  <JobCard key={job.id} job={job} dist={dist} />
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: MARKETPLACE PROGRESSIVE STREAM - TASKS FURTHER AWAY */}
          {fartherJobs.length > 0 && (
            <div>
              {/* Marketplace Distinct Divider with SOLID opaque pill */}
              <div className="relative my-7 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative z-10 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold shadow-xs flex items-center gap-2">
                  <span>🧭</span>
                  <span>
                    {lang === 'ne'
                      ? `अलि टाढाका काम (${radius} कि.मी. भन्दा बाहिर)`
                      : `More tasks further away (Outside ${radius} km)`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {fartherJobs.map(({ job, dist }) => (
                  <JobCard key={job.id} job={job} dist={dist} />
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: VIRTUAL / ONLINE TASKS (IF APPLICABLE) */}
          {virtualJobs.length > 0 && filters.type !== 'In-person' && (
            <div>
              <div className="relative my-7 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-blue-200" />
                </div>
                <div className="relative z-10 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-xs flex items-center gap-2">
                  <span>🌐</span>
                  <span>
                    {lang === 'ne'
                      ? 'अनलाइन / रिमोट काम'
                      : 'Online & Remote Tasks (Anywhere)'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {virtualJobs.map(({ job, dist }) => (
                  <JobCard key={job.id} job={job} dist={dist} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
