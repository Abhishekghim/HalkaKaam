'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { Pennants } from './Pennants';
import { Wordmark } from './Wordmark';
import { ThemeToggle } from './ui/ThemeToggle';
import { ArrowRight, Languages } from 'lucide-react';

export const ScreenLangPick: React.FC = () => {
  const { setLang } = useApp();

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-[var(--bg)] text-[var(--fg)] p-6 text-center">
      <div className="w-full flex justify-end">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center my-auto">
        <div className="mb-4">
          <Pennants style={{ width: '48px', height: '56px' }} />
        </div>
        <Wordmark className="text-3xl mb-2" />
        <p className="text-xs font-bold text-[var(--fg-muted)] tracking-wide mb-8">
          No work is too small · हल्का काम, ठूलो सम्मान 🇳🇵
        </p>

        <div className="w-full space-y-3">
          <button
            type="button"
            onClick={() => setLang('ne')}
            className="w-full p-4.5 rounded-2xl border-2 border-[var(--primary-border)] bg-[var(--surface)] hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] text-left flex items-center justify-between transition-all cursor-pointer shadow-xs card-lift"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇳🇵</span>
              <div>
                <b className="text-base font-black text-[var(--fg)] block">नेपाली</b>
                <span className="text-xs text-[var(--fg-muted)] font-medium">नेपाली भाषामा सुरु गर्नुहोस्</span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[var(--primary)]" />
          </button>

          <button
            type="button"
            onClick={() => setLang('en')}
            className="w-full p-4.5 rounded-2xl border-2 border-[var(--line)] bg-[var(--surface)] hover:border-[var(--primary)] hover:bg-[var(--surface-2)] text-left flex items-center justify-between transition-all cursor-pointer shadow-xs card-lift"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌐</span>
              <div>
                <b className="text-base font-black text-[var(--fg)] block">English</b>
                <span className="text-xs text-[var(--fg-muted)] font-medium">Continue in English</span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[var(--primary)]" />
          </button>
        </div>
      </div>

      <p className="text-[11px] font-bold text-[var(--fg-subtle)]">
        Nepal Gig Marketplace · Version 2.0
      </p>
    </div>
  );
};
