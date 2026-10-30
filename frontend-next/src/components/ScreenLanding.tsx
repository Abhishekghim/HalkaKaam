'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { Pennants } from './Pennants';
import { Wordmark } from './Wordmark';
import { ThemeToggle } from './ui/ThemeToggle';
import { Footer } from './Footer';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Home,
  Languages,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react';

export const ScreenLanding: React.FC = () => {
  const { lang, toggleLang, goAuth, me, setMode, setTab, setView } = useApp();

  const handleFindWork = () => {
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

  const handleOpenApp = () => {
    if (me) {
      setView('app');
    } else {
      goAuth('worker');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
      {/* Clean Website Header (No App Clutter) */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 select-none">
            <Pennants />
            <div className="flex flex-col">
              <Wordmark className="text-xl leading-none" />
              <span className="text-[10px] font-bold text-[var(--fg-muted)] tracking-wider uppercase -mt-0.5">
                {lang === 'ne' ? 'सामुदायिक काम प्लेटफर्म' : 'Nepal Community Tasks'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
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
              onClick={handleOpenApp}
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
        {/* Straightforward Hero Section */}
        <section className="py-14 sm:py-20 px-4 sm:px-6 border-b border-[var(--line)] bg-[var(--surface)]">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-2)] text-xs font-bold text-[var(--primary)] mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span>
                {lang === 'ne'
                  ? 'साझा काम (Sajha Kaam) · सानो काम, ठूलो सम्मान'
                  : 'Sajha Kaam · Shared Work, Trusted Neighbors'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--fg)] leading-tight mb-5">
              {lang === 'ne'
                ? 'तपाईंको टोल-छिमेकमा घरायसी र दैनिक कामको सहज समाधान'
                : 'A simple way to get everyday tasks done in Nepal'}
            </h1>

            <p className="text-base sm:text-lg text-[var(--fg-muted)] leading-relaxed max-w-2xl mx-auto mb-8">
              {lang === 'ne'
                ? 'साझा कामले घरायसी काम, मर्मत, सामान सार्ने वा ट्युसन जस्ता कामका लागि नजिकैका KYC-प्रमाणित विद्यार्थी र सीप भएका व्यक्तिहरूलाई सिधै जोड्छ।'
                : 'Sajha Kaam connects households and local businesses needing quick help with ID-verified students and skilled neighbors nearby — with transparent pricing and direct payment.'}
            </p>

            {/* Two Direct Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md sm:max-w-none mx-auto">
              <button
                type="button"
                onClick={handlePostTask}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white font-extrabold text-sm shadow-cta transition-all active:scale-95 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>
                  {lang === 'ne' ? 'काम पोस्ट गर्नुहोस् (Hire Help)' : 'Post a Task (Hire Help)'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleFindWork}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-extrabold text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Briefcase className="w-4 h-4" />
                <span>
                  {lang === 'ne' ? 'काम खोजेर कमाउनुहोस् (Find Work)' : 'Find Tasks & Earn'}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* What is Sajha Kaam? (3 Clear Pillars) */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--fg)] mb-2">
              {lang === 'ne' ? 'साझा काम के हो र किन प्रयोग गर्ने?' : 'What is Sajha Kaam?'}
            </h2>
            <p className="text-sm text-[var(--fg-muted)] max-w-xl mx-auto">
              {lang === 'ne'
                ? 'बिचौलिया बिना स्थानीय स्तरमा काम दिने र काम खोज्ने सरल प्लेटफर्म।'
                : 'Built specifically for Nepal to make local short-term work safe, fair, and straightforward.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary-tint)] text-[var(--primary)] flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-[var(--fg)] mb-2">
                {lang === 'ne' ? 'स्थानीय र विद्यार्थी मैत्री' : 'Community & Student Powered'}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--fg-muted)] leading-relaxed">
                {lang === 'ne'
                  ? 'सरसफाइ, सामान सार्ने, डेलिभरी, ट्युसन र साना मर्मतका कामहरूमा नजिकैका विद्यार्थी र दक्ष छिमेकीहरूको सहयोग लिनुहोस्।'
                  : 'From home cleaning, moving help, and errands to tutoring and quick repairs — hire helpful neighbors and college students right in your area.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--ok-tint)] text-[var(--ok)] flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-[var(--fg)] mb-2">
                {lang === 'ne' ? '१००% KYC प्रमाणित कामदार' : '100% Nepal ID Verified'}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--fg-muted)] leading-relaxed">
                {lang === 'ne'
                  ? 'साझा काममा कुनै पनि काममा प्रस्ताव पठाउनु अघि नागरिकता, राष्ट्रिय परिचयपत्र वा पासपोर्टबाट KYC प्रमाणीकरण अनिवार्य छ।'
                  : 'Every helper must verify their Nepali Citizenship or National ID before applying for tasks, ensuring safety and accountability.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-tint)] text-[var(--accent)] flex items-center justify-center mb-4">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-[var(--fg)] mb-2">
                {lang === 'ne' ? 'पारदर्शी मूल्य र सिधा भुक्तानी' : 'Fair Pricing & Direct Payment'}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--fg-muted)] leading-relaxed">
                {lang === 'ne'
                  ? 'च्याटमा कुरा गरेर उचित पारिश्रमिक तय गर्नुहोस् र काम सम्पन्न भएपछि मात्र eSewa, Khalti वा नगद मार्फत भुक्तानी गर्नुहोस्।'
                  : 'Agree on a fair NPR rate or counter-offer in chat, and pay directly via eSewa, Khalti, or Cash once the job is completed.'}
              </p>
            </div>
          </div>
        </section>

        {/* Simple 3-Step How It Works */}
        <section className="py-12 px-4 sm:px-6 border-t border-[var(--line)] bg-[var(--surface)]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg sm:text-xl font-extrabold text-center text-[var(--fg)] mb-8">
              {lang === 'ne' ? 'यसले कसरी काम गर्छ? (३ सजिलो चरण)' : 'How Sajha Kaam Works in 3 Simple Steps'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white font-black text-xs flex items-center justify-center flex-none mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--fg)] mb-1">
                    {lang === 'ne' ? 'कामको विवरण राख्नुहोस्' : 'Post Your Task'}
                  </h3>
                  <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                    {lang === 'ne'
                      ? 'तपाईंलाई के काम चाहिन्छ, ठाउँ र बजेट उल्लेख गरी १ मिनेटमा पोस्ट गर्नुहोस्।'
                      : 'Describe what you need done, your location, and your offered NPR budget.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white font-black text-xs flex items-center justify-center flex-none mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--fg)] mb-1">
                    {lang === 'ne' ? 'प्रमाणित व्यक्ति छान्नुहोस्' : 'Pick a Verified Helper'}
                  </h3>
                  <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                    {lang === 'ne'
                      ? 'प्रस्ताव र रेटिङ हेरेर उपयुक्त कामदार छान्नुहोस् र च्याटमा कुरा गर्नुहोस्।'
                      : 'Review offers, ratings, and KYC badges from nearby helpers and assign the best fit.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[var(--ok)] text-white font-black text-xs flex items-center justify-center flex-none mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--fg)] mb-1">
                    {lang === 'ne' ? 'काम सकिएपछि भुक्तानी' : 'Get It Done & Pay'}
                  </h3>
                  <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                    {lang === 'ne'
                      ? 'काम पूरा भएपछि eSewa, Khalti वा नगद मार्फत भुक्तानी गरी रिभ्यु दिनुहोस्।'
                      : 'Pay via eSewa, Khalti, or Cash after completion and leave a quick community review.'}
                  </p>
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
