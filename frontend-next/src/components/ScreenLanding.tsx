'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Pennants } from './Pennants';
import { Wordmark } from './Wordmark';
import { ThemeToggle } from './ui/ThemeToggle';
import { PaymentBadges } from './ui/PaymentBadges';
import { Footer } from './Footer';
import { CATS, catName } from '../lib/i18n';
import { npr, timeAgo } from '../lib/constants';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Languages,
  MapPin,
  Search,
  ShieldCheck,
} from 'lucide-react';

export const ScreenLanding: React.FC = () => {
  const {
    lang,
    toggleLang,
    goAuth,
    me,
    jobs,
    setMode,
    setTab,
    setView,
    setSearchQuery,
    setFilters,
  } = useApp();

  const [heroQuery, setHeroQuery] = useState('');

  const openJobs = jobs.filter((j) => j.status === 'open');
  const previewJobs = openJobs.slice(0, 4);

  const handleFindWork = (category?: string, query?: string) => {
    if (query !== undefined) {
      setSearchQuery(query);
    }
    if (category) {
      setFilters((prev) => ({ ...prev, cat: category }));
    }
    if (me) {
      setMode('worker');
      setTab('feed');
      setView('app');
    } else {
      goAuth('worker');
    }
  };

  const handlePostTask = () => {
    if (me) {
      setMode('host');
      setTab('post');
      setView('app');
    } else {
      goAuth('host');
    }
  };

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFindWork(undefined, heroQuery.trim());
  };

  const displayCats = CATS.filter((c) => c !== 'All');

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
      {/* Website Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 select-none">
              <Pennants />
              <div className="flex flex-col">
                <Wordmark className="text-xl leading-none" />
                <span className="text-[10px] font-bold text-[var(--fg-muted)] tracking-wider uppercase -mt-0.5">
                  Sajha Kaam
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[var(--fg-muted)]">
              <a href="#categories" className="hover:text-[var(--primary)] transition-colors">
                {lang === 'ne' ? 'सेवा वर्गहरू' : 'Categories'}
              </a>
              <a href="#how-it-works" className="hover:text-[var(--primary)] transition-colors">
                {lang === 'ne' ? 'प्रक्रिया र सुरक्षा' : 'How It Works'}
              </a>
              <button
                type="button"
                onClick={() => handleFindWork()}
                className="hover:text-[var(--primary)] transition-colors cursor-pointer"
              >
                {lang === 'ne' ? 'खुला कामहरू' : 'Browse Tasks'}
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLang}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--primary)] text-xs font-bold text-[var(--fg)] transition-colors cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{lang === 'en' ? 'नेपाली' : 'English'}</span>
            </button>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => handleFindWork()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-extrabold shadow-xs transition-all cursor-pointer"
            >
              <span>
                {me
                  ? lang === 'ne'
                    ? 'मार्केटप्लेस खोल्नुहोस्'
                    : 'Open Marketplace'
                  : lang === 'ne'
                    ? 'लगइन / सुरु गर्नुहोस्'
                    : 'Sign In'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Section 1: Split Hero & Live Task Preview */}
        <section className="border-b border-[var(--line)] bg-[var(--surface)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              {/* Left Column: Value Proposition & Action */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-2)] text-xs font-bold text-[var(--primary)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                  <span>
                    {lang === 'ne'
                      ? 'साझा काम · स्थानीय काम र सेवा प्लेटफर्म'
                      : 'Sajha Kaam · Neighborhood Task Marketplace'}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--fg)] leading-[1.12]">
                  {lang === 'ne'
                    ? 'घरायसी र दैनिक कामका लागि भरपर्दो स्थानीय सहयोगी'
                    : 'Dependable local hands for everyday work across Nepal.'}
                </h1>

                <p className="text-base sm:text-lg text-[var(--fg-muted)] leading-relaxed max-w-xl">
                  {lang === 'ne'
                    ? 'सरसफाइ, सामान सार्ने, मर्मत, डेलिभरी वा ट्युसन — साझा कामले काम पोस्ट गर्ने घरपरिवार र नागरिकता प्रमाणित स्थानीय कामदारहरूलाई सिधै जोड्छ।'
                    : 'Post what needs doing and set your fair NPR rate, or earn on your own schedule by helping households and shops in your neighborhood.'}
                </p>

                {/* Functional Search Bar */}
                <form
                  onSubmit={handleHeroSearchSubmit}
                  className="flex flex-col sm:flex-row gap-2.5 max-w-xl pt-1"
                >
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[var(--fg-subtle)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={heroQuery}
                      onChange={(e) => setHeroQuery(e.target.value)}
                      placeholder={
                        lang === 'ne'
                          ? 'काम खोज्नुहोस् (उदा. सरसफाइ, मर्मत, डेलिभरी)...'
                          : 'Search open tasks (e.g. cleaning, plumbing, moving)...'
                      }
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-12 px-5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
                  >
                    <span>{lang === 'ne' ? 'काम खोज्नुहोस्' : 'Browse Tasks'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Secondary Action & Trust Line */}
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
                  <button
                    type="button"
                    onClick={handlePostTask}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <span>
                      {lang === 'ne'
                        ? '+ काम पोस्ट गर्नुहोस् (Hire Help)'
                        : '+ Post a Task (Hire a Helper)'}
                    </span>
                  </button>

                  <span className="text-[var(--fg-muted)] font-semibold">
                    {lang === 'ne'
                      ? 'बिचौलिया कमिसन छैन · नागरिकता प्रमाणित'
                      : 'No middleman markup · Citizenship / NID verified'}
                  </span>
                </div>
              </div>

              {/* Right Column: Live Task Dispatch Board */}
              <div className="lg:col-span-5 w-full">
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] overflow-hidden shadow-xs">
                  <div className="px-4 py-3 border-b border-[var(--line)] bg-[var(--surface-2)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg)]">
                        {lang === 'ne' ? 'हालैका खुला कामहरू' : 'Recent Open Tasks'}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-[var(--fg-muted)]">
                      {openJobs.length} {lang === 'ne' ? 'सक्रिय' : 'active'}
                    </span>
                  </div>

                  <div className="divide-y divide-[var(--line)]">
                    {previewJobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => handleFindWork()}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleFindWork()}
                        className="p-4 bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--fg-muted)]">
                            <span className="text-[var(--primary)] font-bold">
                              {catName(job.cat, lang)}
                            </span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-[var(--accent)] shrink-0" />
                              {job.address ? job.address.split(',')[0] : 'Kathmandu'}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-[var(--fg)] truncate">
                            {job.title}
                          </h3>
                          <p className="text-[11px] text-[var(--fg-subtle)]">
                            {timeAgo(job.createdAt)} {lang === 'ne' ? 'अगाडि' : 'ago'} ·{' '}
                            {job.bids.length} {lang === 'ne' ? 'प्रस्ताव' : 'offers'}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-extrabold text-[var(--primary)] tabular-nums">
                            {npr(job.price)}
                          </div>
                          <div className="text-[10px] font-semibold text-[var(--fg-subtle)] uppercase">
                            {job.ptype === 'Hourly'
                              ? lang === 'ne'
                                ? 'प्रति घण्टा'
                                : '/ hour'
                              : lang === 'ne'
                                ? 'निश्चित दर'
                                : 'fixed'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFindWork()}
                    className="w-full px-4 py-3 border-t border-[var(--line)] bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] text-xs font-bold text-[var(--primary)] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>
                      {lang === 'ne'
                        ? 'सबै खुला कामहरू हेर्नुहोस्'
                        : 'View all open tasks in marketplace'}
                    </span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Service Directory */}
        <section id="categories" className="py-14 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-1.5">
                {lang === 'ne' ? 'सेवा निर्देशिका' : 'Service Directory'}
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--fg)]">
                {lang === 'ne'
                  ? 'तपाईंलाई कुन काममा सहयोग चाहिन्छ?'
                  : 'What kind of help do you need today?'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => handleFindWork('All')}
              className="text-xs font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>{lang === 'ne' ? 'सबै वर्गहरू हेर्नुहोस्' : 'Explore full feed'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-[var(--line)] rounded-2xl overflow-hidden bg-[var(--surface)]">
            {displayCats.map((category, idx) => {
              const count = openJobs.filter((j) => j.cat === category).length;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleFindWork(category)}
                  className="p-5 border-r border-b border-[var(--line)] text-left hover:bg-[var(--surface-2)] transition-colors flex flex-col justify-between gap-4 group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[var(--fg-subtle)]">
                      0{idx + 1}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-[var(--fg-subtle)] group-hover:text-[var(--primary)] transition-colors" />
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors mb-1">
                      {catName(category, lang)}
                    </h3>
                    <p className="text-xs text-[var(--fg-muted)] font-medium">
                      {count > 0
                        ? lang === 'ne'
                          ? `${count} सक्रिय काम उपलब्ध`
                          : `${count} open ${count === 1 ? 'task' : 'tasks'} nearby`
                        : lang === 'ne'
                          ? 'नयाँ काम पोस्ट गर्नुहोस्'
                          : 'Post or browse tasks'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 3: How It Works & Verification Standard */}
        <section
          id="how-it-works"
          className="py-14 sm:py-16 px-4 sm:px-6 border-t border-[var(--line)] bg-[var(--surface)]"
        >
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Left 7 Cols: 3-Step Process */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-1.5">
                  {lang === 'ne' ? 'कसरी काम गर्छ' : 'How Sajha Kaam Works'}
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--fg)]">
                  {lang === 'ne'
                    ? 'सरल प्रक्रिया, स्पष्ट पारिश्रमिक'
                    : 'Straightforward from post to payment.'}
                </h2>
              </div>

              <div className="divide-y divide-[var(--line)] border-t border-b border-[var(--line)]">
                <div className="py-5 flex items-start gap-4">
                  <span className="text-xs font-mono font-bold text-[var(--primary)] pt-1">
                    01
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-[var(--fg)] mb-1">
                      {lang === 'ne'
                        ? 'कामको विवरण र बजेट राख्नुहोस्'
                        : 'Describe the task & set your budget'}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--fg-muted)] leading-relaxed">
                      {lang === 'ne'
                        ? 'के काम गर्नुपर्ने हो, स्थान, समय र तपाईंले दिन चाहेको पारिश्रमिक (NPR) तोकेर पोस्ट गर्नुहोस्।'
                        : 'Post what you need done, pick your neighborhood on the map, and set a fair fixed or hourly NPR rate.'}
                    </p>
                  </div>
                </div>

                <div className="py-5 flex items-start gap-4">
                  <span className="text-xs font-mono font-bold text-[var(--primary)] pt-1">
                    02
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-[var(--fg)] mb-1">
                      {lang === 'ne'
                        ? 'KYC-प्रमाणित व्यक्ति छान्नुहोस्'
                        : 'Review verified offers & assign'}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--fg-muted)] leading-relaxed">
                      {lang === 'ne'
                        ? 'नजिकैका प्रमाणित कामदारहरूको प्रस्ताव, पूर्व समीक्षा र अनुभव हेरेर च्याटमा कुरा गरी काम जिम्मा दिनुहोस्।'
                        : 'Compare pitches, past community ratings, and KYC badges. Agree on the rate or counter-offer directly in chat.'}
                    </p>
                  </div>
                </div>

                <div className="py-5 flex items-start gap-4">
                  <span className="text-xs font-mono font-bold text-[var(--primary)] pt-1">
                    03
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-[var(--fg)] mb-1">
                      {lang === 'ne'
                        ? 'काम सकिएपछि सिधा भुक्तानी गर्नुहोस्'
                        : 'Settle directly when the work is done'}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--fg-muted)] leading-relaxed">
                      {lang === 'ne'
                        ? 'काम सन्तोषजनक रूपमा पूरा भएपछि eSewa, Khalti वा नगद मार्फत सिधै भुक्तानी गरी समीक्षा छोड्नुहोस्।'
                        : 'Pay the helper directly via eSewa, Khalti, IME Pay, or cash once completed, and leave an honest review.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Trust & Verification Standard Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-6 sm:p-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {lang === 'ne' ? 'सुरक्षा र विश्वासको मापदण्ड' : 'Trust & Verification Standard'}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-[var(--fg)] leading-snug">
                  {lang === 'ne'
                    ? 'प्रत्येक कामदारको पहिचान परीक्षण गरिन्छ'
                    : 'Every helper is identity-checked before they can pitch on tasks.'}
                </h3>

                <ul className="space-y-3 text-xs sm:text-sm text-[var(--fg-muted)]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" />
                    <span>
                      {lang === 'ne'
                        ? 'नेपाली नागरिकता, राष्ट्रिय परिचयपत्र (NID) वा सवारी चालक अनुमतिपत्र प्रमाणीकरण।'
                        : 'Mandatory Nepal Citizenship, National ID (NID), or License verification for workers.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" />
                    <span>
                      {lang === 'ne'
                        ? 'काम जिम्मा दिएपछि मात्र फोन नम्बर र सटीक ठेगाना खुल्ने गोपनीयता सुरक्षा।'
                        : 'Privacy circle on maps — exact address and phone number unlock only after assignment.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" />
                    <span>
                      {lang === 'ne'
                        ? 'दुवै पक्ष (काम दिने र काम गर्ने) को वास्तविक मूल्याङ्कन र समीक्षा।'
                        : 'Two-way accountability ratings for both task hosts and workers.'}
                    </span>
                  </li>
                </ul>

                <div className="pt-3 border-t border-[var(--line)]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--fg-subtle)] mb-2.5">
                    {lang === 'ne' ? 'समर्थित भुक्तानी माध्यम' : 'Supported Local Payment Rails'}
                  </p>
                  <PaymentBadges size="sm" lang={lang} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
