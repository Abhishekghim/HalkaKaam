'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { HowItWorks } from './HowItWorks';
import { CategoryGrid } from './CategoryGrid';
import { PaymentTrustStrip } from './ui/PaymentBadges';
import { Footer } from './Footer';
import { ArrowRight, Sparkles, Plus } from 'lucide-react';

export const ScreenLanding: React.FC = () => {
  const { lang, t, goAuth, setCat, setSearchQuery } = useApp();

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    goAuth('worker');
  };

  const handleCategorySelect = (category: string) => {
    setCat(category);
    goAuth('worker');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)]">
      {/* Top Navbar */}
      <Navbar onPostClick={() => goAuth('host')} />

      {/* Hero Section with Search, Trust Strip, Categories */}
      <HeroSection
        onSearch={handleSearch}
        onSelectCategory={handleCategorySelect}
        onPostClick={() => goAuth('host')}
        onEarnClick={() => goAuth('worker')}
      />

      {/* 3-Step How It Works */}
      <HowItWorks />

      {/* Explore All Categories Section */}
      <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'ne' ? 'सबै सेवाहरू' : 'All Categories'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--fg)] tracking-tight">
              {lang === 'ne' ? 'आफ्नो आवश्यकता अनुसार सेवा रोज्नुहोस्' : 'Explore Everyday Tasks'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => goAuth('worker')}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[var(--primary)] hover:underline cursor-pointer"
          >
            <span>{lang === 'ne' ? 'सबै कामहरू हेर्नुहोस्' : 'Browse All Tasks'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <CategoryGrid onSelectCategory={handleCategorySelect} />

        {/* Nepal Payment Security Strip */}
        <div className="mt-10">
          <PaymentTrustStrip lang={lang} />
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="border-t border-[var(--line)] bg-[var(--grad-primary)] text-white py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
            {lang === 'ne'
              ? 'काम चाहिएको छ वा काम गराउनु छ?'
              : 'Ready to get started on Sajha Kaam?'}
          </h2>
          <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto mb-6">
            {lang === 'ne'
              ? 'आजै निःशुल्क खाता खोल्नुहोस् र नजिकैका भरपर्दा विद्यार्थी तथा सहयोगीहरूसँग जोडिनुहोस्।'
              : 'Join thousands of locals and students getting everyday tasks done safely.'}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => goAuth('host')}
              className="px-6 py-3 rounded-xl bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white text-sm font-extrabold shadow-cta active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{lang === 'ne' ? 'काम पोस्ट गर्नुहोस् (निःशुल्क)' : 'Post a Task (Free)'}</span>
            </button>
            <button
              type="button"
              onClick={() => goAuth('worker')}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/20 backdrop-blur-xs active:scale-95 transition-all cursor-pointer"
            >
              <span>{lang === 'ne' ? 'काम खोजेर कमाउनुहोस्' : 'Earn as a Tasker'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
