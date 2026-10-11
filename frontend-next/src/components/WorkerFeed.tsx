'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { JobCard } from './JobCard';
import { WorkerFeedMap } from './WorkerFeedMap';
import { CATS, catName } from '../lib/i18n';
import { kmDist } from '../lib/constants';
import { FeedFilters, Job, SortPreference } from '../types';
import { CategoryIconTile } from './ui/CategoryIconTile';
import {
  Search,
  ArrowUpDown,
  MapPin,
  Zap,
  X,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  Globe,
  SlidersHorizontal,
  Map as MapIcon,
  List as ListIcon,
} from 'lucide-react';

export const WorkerFeed: React.FC = () => {
  const {
    t,
    lang,
    jobs,
    pos,
    radius,
    locName,
    setView,
    filters,
    setFilters,
    resetFilters,
    openSheet,
    ready,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!categoryScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (!categoryScrollRef.current) return;
    categoryScrollRef.current.scrollBy({
      left: direction === 'left' ? -260 : 260,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 320);
  };

  const handleCategoryWheel = (e: React.WheelEvent) => {
    if (!categoryScrollRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      categoryScrollRef.current.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

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

  if (!ready) {
    return (
      <div className="space-y-4 py-4">
        <div className="skeleton h-14 w-full rounded-2xl" />
        <div className="skeleton h-10 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="skeleton h-48 rounded-2xl" />
          <div className="skeleton h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="worker-feed space-y-4 pb-12">
      {/* Location Banner (Clean Card with Red Accent) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setView('locstep')}
        className="w-full flex items-center justify-between p-3.5 px-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs hover:border-[var(--primary)] transition-all text-left cursor-pointer card-lift"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center flex-none border border-[var(--accent-border)]">
            <MapPin className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-[var(--fg-muted)] uppercase tracking-wider block">
              {t('your_location')}
            </span>
            <span className="text-sm font-extrabold text-[var(--fg)] truncate block">
              {locName || 'Kathmandu Valley'} · {t('within')} {radius} km
            </span>
          </div>
        </div>
        <span className="text-xs font-bold text-[var(--primary)] bg-[var(--primary-soft)] hover:bg-[var(--primary-soft-hover)] border border-[var(--primary-border)] px-3 py-1.5 rounded-full transition-colors whitespace-nowrap">
          {t('change')} ›
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)] pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_ph')}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-sm font-semibold text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)] transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[var(--surface-2)] text-[var(--fg-muted)] hover:text-[var(--fg)] flex items-center justify-center cursor-pointer"
            >
              <X className="w-3 h-3" />
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
            className={`flex items-center gap-1.5 px-3.5 rounded-xl border font-bold text-xs transition-all whitespace-nowrap shadow-sm h-[42px] cursor-pointer ${
              filters.sortBy !== 'distance'
                ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                : 'bg-[var(--surface)] text-[var(--fg)] border-[var(--line)] hover:border-[var(--primary)]'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOptions.find((o) => o.key === filters.sortBy)?.short}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {sortOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
              <ul
                role="listbox"
                className="absolute right-0 top-full mt-1.5 z-50 w-52 rounded-xl bg-[var(--surface)] border border-[var(--line)] shadow-lg py-1.5"
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
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left hover:bg-[var(--surface-2)] ${
                          on ? 'font-bold text-[var(--primary)] bg-[var(--primary-soft)]' : 'font-medium text-[var(--fg)]'
                        }`}
                      >
                        <span>{o.label}</span>
                        {on && <Check className="w-3.5 h-3.5 text-[var(--primary)]" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {/* View Mode Toggle (List vs Map) */}
        <div className="inline-flex rounded-xl bg-[var(--surface-2)] p-0.5 border border-[var(--line)] h-[42px] items-center flex-none">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-label="List view"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 h-[34px] cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[var(--surface)] text-[var(--fg)] shadow-2xs'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            <ListIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'ne' ? 'सूची' : 'List'}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            aria-label="Map view"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 h-[34px] cursor-pointer ${
              viewMode === 'map'
                ? 'bg-[var(--primary)] text-white shadow-2xs'
                : 'text-[var(--fg-muted)] hover:text-[var(--primary)]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{lang === 'ne' ? 'नक्सा' : 'Map'}</span>
          </button>
        </div>
      </div>

      {/* Category Pills Carousel with Left/Right Arrows & Tinted Containers */}
      <div className="relative group/carousel py-0.5">
        {/* Left Scroll Arrow */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollCategories('left')}
            aria-label="Scroll categories left"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[var(--surface)] text-[var(--fg)] border border-[var(--line)] shadow-md flex items-center justify-center hover:bg-[var(--surface-2)] hover:border-[var(--primary)] transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Scroll Container */}
        <div
          ref={categoryScrollRef}
          onScroll={checkScroll}
          onWheel={handleCategoryWheel}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
        >
          <button
            type="button"
            onClick={() => setFilters((prev: FeedFilters) => ({ ...prev, cat: 'All' }))}
            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap border transition-all cursor-pointer ${
              filters.cat === 'All'
                ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                : 'bg-[var(--surface)] text-[var(--fg)] border-[var(--line)] hover:border-[var(--primary)] hover:text-[var(--primary)] shadow-2xs'
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
            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap border flex items-center gap-1.5 transition-all cursor-pointer ${
              filters.urgentOnly
                ? 'bg-[var(--accent-fill)] text-white border-[var(--accent-fill)] shadow-sm'
                : 'bg-[var(--surface)] text-[var(--accent)] border-[var(--accent-border)] hover:bg-[var(--accent-soft)] shadow-2xs'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm font-extrabold'
                    : 'bg-[var(--surface)] text-[var(--fg)] border-[var(--line)] hover:border-[var(--primary)] hover:text-[var(--primary)] shadow-2xs'
                }`}
              >
                <CategoryIconTile
                  cat={c}
                  size="sm"
                  className={isSelected ? '!bg-white/20 !text-white !border-white/30' : ''}
                />
                <span>{catName(c, lang)}</span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollCategories('right')}
            aria-label="Scroll categories right"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[var(--surface)] text-[var(--fg)] border border-[var(--line)] shadow-md flex items-center justify-center hover:bg-[var(--surface-2)] hover:border-[var(--primary)] transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Active Filter Tags Bar */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs">
          <span className="text-[11px] font-bold text-[var(--fg-muted)]">
            {lang === 'ne' ? 'सक्रिय:' : 'Active:'}
          </span>
          {filters.cat !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary-border)] font-bold text-xs">
              {catName(filters.cat, lang)}
              <button
                type="button"
                onClick={() => setFilters((prev: FeedFilters) => ({ ...prev, cat: 'All' }))}
                className="ml-1 hover:text-[var(--primary-hover)] cursor-pointer"
              >
                ✕
              </button>
            </span>
          )}
          {filters.type !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary-border)] font-bold text-xs">
              {filters.type === 'In-person' ? `📍 ${t('f_inperson')}` : `🌐 ${t('f_online')}`}
              <button
                type="button"
                onClick={() => setFilters((prev: FeedFilters) => ({ ...prev, type: 'All' }))}
                className="ml-1 hover:text-[var(--primary-hover)] cursor-pointer"
              >
                ✕
              </button>
            </span>
          )}
          {filters.urgentOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-bold text-xs">
              🔥 {t('urgent')}
              <button
                type="button"
                onClick={() => setFilters((prev: FeedFilters) => ({ ...prev, urgentOnly: false }))}
                className="ml-1 hover:opacity-80 cursor-pointer"
              >
                ✕
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] font-bold text-[var(--accent)] hover:underline ml-1 cursor-pointer"
          >
            {lang === 'ne' ? 'सबै हटाउनुहोस्' : 'Clear all'}
          </button>
        </div>
      )}

      {/* Content: Map View or List View */}
      {viewMode === 'map' ? (
        <WorkerFeedMap
          jobs={processedJobs}
          userPos={pos}
          radius={radius}
          onSelectJob={(job) => openSheet('jobDetail', { jobId: job.id })}
          lang={lang}
        />
      ) : totalCount === 0 ? (
        <div className="rounded-3xl bg-[var(--surface)] border border-[var(--line)] p-8 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] text-3xl flex items-center justify-center mx-auto mb-3 border border-[var(--line)]">
            🔍
          </div>
          <h3 className="text-base font-extrabold text-[var(--fg)] mb-1">
            {t('no_jobs')}
          </h3>
          <p className="text-xs text-[var(--fg-muted)] max-w-xs mx-auto mb-4">
            {t('no_jobs_sub')}
          </p>
          <div className="flex items-center justify-center gap-2">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] text-xs font-bold cursor-pointer"
              >
                {lang === 'ne' ? 'फिल्टर हटाउनुहोस्' : 'Reset Filters'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setView('locstep')}
              className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              {t('widen')}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 pt-1">
          {/* Section 1: Nearby Tasks */}
          {nearbyJobs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--success)] animate-pulse" />
                  <h2 className="text-sm font-extrabold text-[var(--fg)] tracking-tight">
                    {lang === 'ne' ? 'तपाईं नजिकका कामहरू' : 'Tasks Around You'}
                  </h2>
                </div>
                <span className="text-xs font-bold text-[var(--fg-muted)]">
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

          {/* Section 2: Tasks Further Away */}
          {fartherJobs.length > 0 && (
            <div>
              <div className="relative my-7 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-[var(--line)]" />
                </div>
                <div className="relative z-10 px-4 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--line)] text-[var(--fg)] text-xs font-bold shadow-xs flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span>
                    {lang === 'ne'
                      ? `अलि टाढाका कामहरू (${radius} कि.मी. भन्दा बाहिर)`
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

          {/* Section 3: Virtual / Remote Tasks */}
          {virtualJobs.length > 0 && filters.type !== 'In-person' && (
            <div>
              <div className="relative my-7 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-[var(--line)]" />
                </div>
                <div className="relative z-10 px-4 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--line)] text-[var(--fg)] text-xs font-bold shadow-xs flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span>
                    {lang === 'ne'
                      ? 'अनलाइन / रिमोट काम'
                      : 'Online & Remote Tasks'}
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
