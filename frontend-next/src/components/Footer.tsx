'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { Pennants } from './Pennants';
import { Wordmark } from './Wordmark';
import { PaymentBadges } from './ui/PaymentBadges';
import { ShieldCheck, Users, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  const { lang, toggleLang, setTab, setMode } = useApp();

  return (
    <footer className="mt-16 border-t border-[var(--line)] bg-[var(--surface)] transition-colors">
      {/* Nepal Flag Dual Accent Top Strip */}
      <div className="h-1.5 w-full flex">
        <div className="h-full flex-1 bg-[var(--primary)]" />
        <div className="h-full flex-1 bg-[var(--accent-fill)]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <Pennants />
              <Wordmark className="text-xl" />
            </div>
            <p className="text-xs sm:text-sm text-[var(--fg-muted)] max-w-md leading-relaxed">
              {lang === 'ne'
                ? 'नेपालको पहिलो भरपर्दो पियर-टु-पियर गिग प्लेटफर्म। घर सरसफाइ, सामान सार्ने, मर्मतदेखि प्रविधि सहयोगसम्म — हल्का काम, ठूलो सम्मान।'
                : "Nepal's trusted peer-to-peer task marketplace. From cleaning, moving, and repairs to tutoring and tech help — no work is too small."}
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-[var(--fg)]">
              <span className="flex items-center gap-1 text-[var(--success)]">
                <ShieldCheck className="w-4 h-4" />
                {lang === 'ne' ? 'नागरिकता प्रमाणित' : 'ID Verified'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[var(--primary)]">
                <Users className="w-4 h-4" />
                {lang === 'ne' ? 'स्थानीय समुदाय' : 'Local Community'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[var(--accent)]">
                <HeartHandshake className="w-4 h-4" />
                {lang === 'ne' ? 'प्रत्यक्ष भुक्तानी' : 'Direct Pay'}
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg)] mb-3">
              {lang === 'ne' ? 'छिटो नेभिगेसन' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-2 text-xs text-[var(--fg-muted)]">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setMode('worker');
                    setTab('feed');
                  }}
                  className="hover:text-[var(--primary)] transition-colors cursor-pointer"
                >
                  {lang === 'ne' ? 'काम खोज्नुहोस् (Worker Feed)' : 'Find Tasks to Earn'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setMode('host');
                    setTab('post');
                  }}
                  className="hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  {lang === 'ne' ? 'काम पोस्ट गर्नुहोस् (Post Task)' : 'Post a New Task'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setMode('host');
                    setTab('jobs');
                  }}
                  className="hover:text-[var(--primary)] transition-colors cursor-pointer"
                >
                  {lang === 'ne' ? 'मेरा कामहरू (My Tasks)' : 'Manage My Tasks'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={toggleLang}
                  className="hover:text-[var(--primary)] transition-colors cursor-pointer"
                >
                  {lang === 'ne' ? 'Switch to English' : 'नेपाली भाषामा बदल्नुहोस्'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Payment Security */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg)] mb-3">
              {lang === 'ne' ? 'भुक्तानी माध्यमहरू' : 'Supported Payments'}
            </h4>
            <p className="text-xs text-[var(--fg-muted)] mb-3">
              {lang === 'ne'
                ? 'नेपालका प्रमुख डिजिटल वालेट तथा नगद भुक्तानी स्वीकार्य:'
                : 'Pay workers directly via popular Nepal payment services:'}
            </p>
            <PaymentBadges size="md" lang={lang} />
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-6 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--fg-muted)]">
          <div>
            © {new Date().getFullYear()} हल्का काम (Halka Kaam). Made with pride in Nepal 🇳🇵
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-[var(--fg)]">हल्का काम, ठूलो सम्मान</span>
            <span>•</span>
            <span className="text-[var(--fg-subtle)]">v2.0 Redesign</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

