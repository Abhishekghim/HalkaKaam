'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CategoryIconTile } from './ui/CategoryIconTile';
import { CATS, catName } from '../lib/i18n';
import {
  Search,
  MapPin,
  ShieldCheck,
  Star,
  Banknote,
  ArrowRight,
  PlusCircle,
  Briefcase,
  Sparkles,
} from 'lucide-react';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
  onSelectCategory?: (category: string) => void;
  onPostClick?: () => void;
  onEarnClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  onSelectCategory,
  onPostClick,
  onEarnClick,
}) => {
  const { t, lang, locName, searchQuery, setSearchQuery, setView } = useApp();
  const [localQuery, setLocalQuery] = useState(searchQuery || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localQuery);
    if (onSearch) onSearch(localQuery);
  };

  return (
    <div className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 bg-[var(--grad-hero)] border-b border-[var(--line)]">
      {/* Subtle decorative background blur spots */}
      <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 rounded-full bg-[var(--primary)]/5 blur-3xl pointer-events-none" />
      <div className="absolute top-20 left-10 -z-10 w-80 h-80 rounded-full bg-[var(--accent)]/5 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Top Tagline Pill */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--primary-border)] bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-bold shadow-2xs backdrop-blur-xs">
            <span className="flex h-2 w-2 rounded-full bg-[var(--accent)]" />
            <span>साझा काम, ठूलो सम्मान 🇳🇵</span>
            <span className="text-[var(--fg-muted)]">•</span>
            <span className="font-semibold text-[var(--fg-muted)]">
              {lang === 'ne' ? 'नेपालको पियर-टु-पियर बजार' : 'Nepal Gig Marketplace'}
            </span>
          </div>
        </div>

        {/* Hero Headline */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--fg)] tracking-tight leading-[1.18] sm:leading-[1.15]">
            {lang === 'ne' ? (
              <>
                घरको काम होस् वा मर्मत,{' '}
                <span className="text-[var(--primary)] underline decoration-[var(--accent)] decoration-wavy decoration-2 underline-offset-6">
                  भरपर्दो हात
                </span>{' '}
                छिट्टै पाउनुहोस्
              </>
            ) : (
              <>
                Get any task done by{' '}
                <span className="text-[var(--primary)] underline decoration-[var(--accent)] decoration-wavy decoration-2 underline-offset-6">
                  trusted local helpers
                </span>{' '}
                in Nepal
              </>
            )}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[var(--fg-muted)] max-w-2xl mx-auto font-medium leading-relaxed">
            {lang === 'ne'
              ? 'सरसफाइ, सामान सार्ने, प्लम्बिङ, ट्युशन वा डेलिभरी — नागरिकता प्रमाणित स्थानीय सहयोगीहरूसँग सिधै जोडिनुहोस्।'
              : 'From household cleaning and repairs to tutoring and parcel delivery — hire verified student helpers and skilled locals in minutes.'}
          </p>
        </div>

        {/* Main Search & Location Box (Airtasker / Thumbtack style) */}
        <form
          onSubmit={handleSearchSubmit}
          className="max-w-3xl mx-auto bg-[var(--surface)] border border-[var(--line)] rounded-2xl sm:rounded-full p-2 sm:p-2.5 shadow-md hover:shadow-lg transition-all duration-200 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search Input */}
            <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5">
              <Search className="w-5 h-5 text-[var(--primary)] flex-none" />
              <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder={
                  lang === 'ne'
                    ? 'कुन काममा सहयोग चाहियो? (जस्तै: सरसफाइ, मर्मत, टेबल सार्ने)...'
                    : 'What do you need help with? (e.g. cleaning, repairs, moving)...'
                }
                className="w-full bg-transparent border-none outline-none text-sm font-semibold text-[var(--fg)] placeholder:text-[var(--fg-subtle)]"
              />
            </div>

            {/* Location selector divider & pill */}
            <div className="sm:border-l border-[var(--line)] flex items-center px-3 py-1.5 gap-2">
              <MapPin className="w-4 h-4 text-[var(--accent)] flex-none" />
              <button
                type="button"
                onClick={() => setView('locstep')}
                className="text-xs font-bold text-[var(--fg)] hover:text-[var(--primary)] truncate max-w-[150px] cursor-pointer text-left"
              >
                {locName ? locName.split(',')[0] : (lang === 'ne' ? 'काठमाडौं / नजिकै' : 'Near you')}
              </button>
            </div>

            {/* Submit Crimson CTA button */}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl sm:rounded-full bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white text-sm font-bold shadow-cta active:scale-95 transition-all cursor-pointer flex-none"
            >
              <span>{lang === 'ne' ? 'खोज्नुहोस्' : 'Find Tasks'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Popular Categories Chips with Lucide in tinted containers */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="text-center text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-3">
            {lang === 'ne' ? 'लोकप्रिय कामहरू' : 'Popular Categories'}
          </div>
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
            {CATS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onSelectCategory && onSelectCategory(c)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--primary)] hover:shadow-xs transition-all cursor-pointer group"
              >
                <CategoryIconTile cat={c} size="sm" />
                <span className="text-xs font-bold text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors">
                  {catName(c, lang)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Trust Strip (Verified Workers, Ratings, Local Payments) */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 sm:p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm hover:shadow-md transition-shadow">
          {/* Pillar 1: Verified */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success-border)] flex items-center justify-center flex-none">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[var(--fg)]">
                {lang === 'ne' ? 'नागरिकता/NID प्रमाणित' : '100% ID Verified Helpers'}
              </h4>
              <p className="text-[11px] text-[var(--fg-muted)]">
                {lang === 'ne' ? 'सुरक्षित तथा भरपर्दो पहिचान' : 'Government verified credentials'}
              </p>
            </div>
          </div>

          {/* Pillar 2: Ratings */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning-border)] flex items-center justify-center flex-none">
              <Star className="w-5 h-5 fill-[var(--star)] text-[var(--star)]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[var(--fg)]">
                {lang === 'ne' ? '४.९★ औसत सन्तुष्टि' : '4.9★ Average Rating'}
              </h4>
              <p className="text-[11px] text-[var(--fg-muted)]">
                {lang === 'ne' ? 'वास्तविक समीक्षा र रेटिङ' : 'Real reviews from local neighbors'}
              </p>
            </div>
          </div>

          {/* Pillar 3: Secure Payments */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary-border)] flex items-center justify-center flex-none">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[var(--fg)]">
                {lang === 'ne' ? 'eSewa, Khalti, नगद' : 'Direct Local Payments'}
              </h4>
              <p className="text-[11px] text-[var(--fg-muted)]">
                {lang === 'ne' ? 'काम सम्पन्न भएपछि मात्र भुक्तानी' : 'Pay via digital wallet or cash'}
              </p>
            </div>
          </div>
        </div>

        {/* Dual Primary Call-To-Action Cards (Host vs Worker) */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <div
            onClick={onPostClick}
            className="group relative rounded-2xl border border-[var(--primary-border)] bg-gradient-to-br from-[var(--primary-soft)]/50 via-[var(--surface)] to-[var(--surface)] p-5 shadow-xs hover:shadow-md hover:border-[var(--primary)] transition-all cursor-pointer card-lift"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
                <PlusCircle className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-[var(--primary)] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>{lang === 'ne' ? 'सुरु गर्नुहोस्' : 'Post now'}</span>
                <span>›</span>
              </span>
            </div>
            <h3 className="text-base font-extrabold text-[var(--fg)] mb-1">
              {lang === 'ne' ? 'मलाई काम गराउनु छ (I need help)' : 'Post a Task (Get Help)'}
            </h3>
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
              {lang === 'ne'
                ? 'केही मिनेटमै काम पोस्ट गर्नुहोस्। नजिकैका सहयोगीहरूले उचित दरमा प्रस्ताव दिनेछन्।'
                : 'Describe what you need, set your budget, and choose from local bids.'}
            </p>
          </div>

          <div
            onClick={onEarnClick}
            className="group relative rounded-2xl border border-[var(--accent-border)] bg-gradient-to-br from-[var(--accent-soft)]/50 via-[var(--surface)] to-[var(--surface)] p-5 shadow-xs hover:shadow-md hover:border-[var(--accent)] transition-all cursor-pointer card-lift"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-[var(--accent)] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>{lang === 'ne' ? 'काम खोज्नुहोस्' : 'Find jobs'}</span>
                <span>›</span>
              </span>
            </div>
            <h3 className="text-base font-extrabold text-[var(--fg)] mb-1">
              {lang === 'ne' ? 'म काम गरेर कमाउन चाहन्छु (Earn money)' : 'Earn as a Tasker'}
            </h3>
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
              {lang === 'ne'
                ? 'आफ्नो अनुकूल समयमा नजिकैका कामहरू खोज्नुहोस् र राम्रो आम्दानी गर्नुहोस्।'
                : 'Browse open tasks in your area, submit pitches, and get paid directly.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

