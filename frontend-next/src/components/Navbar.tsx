'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { Pennants } from './Pennants';
import { Wordmark } from './Wordmark';
import { ThemeToggle } from './ui/ThemeToggle';
import { avColor, initials } from '../lib/constants';
import { trText, toNepaliNum } from '../lib/i18n';
import {
  MapPin,
  Plus,
  Briefcase,
  Home,
  Languages,
  Info,
} from 'lucide-react';

interface NavbarProps {
  onPostClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onPostClick }) => {
  const {
    t,
    lang,
    toggleLang,
    mode,
    setMode,
    setTab,
    me,
    locName,
    radius,
    setView,
    hostBadge,
    workerBadge,
    isStandaloneApp,
  } = useApp();

  const handleLogoClick = () => {
    setMode('worker');
    setTab('feed');
    setView('app');
  };

  const activeBadge = mode === 'worker' ? workerBadge : hostBadge;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
        {/* Brand / Logo -> Always goes to Main Page (Worker Feed) */}
        <div
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          title={lang === 'ne' ? 'मुख्य पृष्ठमा जानुहोस्' : 'Go to Main Page'}
        >
          <Pennants />
          <div className="flex flex-col">
            <Wordmark className="text-2xl leading-none" />
            <span className="text-xs font-bold text-[var(--fg-muted)] tracking-wider uppercase -mt-0.5">
              {lang === 'ne' ? 'नेपाल मार्केटप्लेस' : 'Nepal Marketplace'}
            </span>
          </div>
        </div>

        {/* Center: Mode Pill Selector (Work vs Hire) */}
        <div className="hidden md:flex items-center p-1.5 rounded-full border border-[var(--line)] bg-[var(--surface-2)]">
          <button
            type="button"
            onClick={() => {
              setMode('worker');
              setTab('feed');
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-extrabold transition-all cursor-pointer ${
              mode === 'worker'
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>{t('mode_work')}</span>
            {workerBadge > 0 && (
              <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white text-xs flex items-center justify-center font-extrabold">
                {workerBadge}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMode('host')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-extrabold transition-all cursor-pointer ${
              mode === 'host'
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>{t('mode_host')}</span>
            {hostBadge > 0 && (
              <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white text-xs flex items-center justify-center font-extrabold">
                {hostBadge}
              </span>
            )}
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Website-only About Sajha Kaam Home link */}
          {!isStandaloneApp && (
            <button
              type="button"
              onClick={() => setView('landing')}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-[var(--fg-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              title={lang === 'ne' ? 'साझा कामको बारेमा' : 'About Sajha Kaam'}
            >
              <Info className="w-4 h-4" />
              <span>{lang === 'ne' ? 'गृहपृष्ठ' : 'Home'}</span>
            </button>
          )}

          {/* Location button */}
          <button
            type="button"
            onClick={() => setView('locstep')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg)] hover:border-[var(--primary)] text-sm font-bold max-w-[155px] sm:max-w-[220px] transition-colors cursor-pointer"
            title="Change Location"
          >
            <MapPin className="w-4 h-4 text-[var(--accent)] flex-none" />
            <span className="truncate">
              {locName
                ? trText(locName.split(',')[0], lang)
                : `${toNepaliNum(radius, lang)} ${lang === 'ne' ? 'कि.मी.' : 'km'}`}
            </span>
          </button>

          {/* Primary Action Button: Post Task CTA */}
          <button
            type="button"
            onClick={() => {
              if (onPostClick) onPostClick();
              else {
                setMode('host');
                setTab('post');
              }
            }}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white text-sm font-extrabold shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{lang === 'ne' ? 'काम पोस्ट गर्नुहोस्' : 'Post a Task'}</span>
          </button>

          {/* Language Toggle (EN / ने) */}
          <button
            type="button"
            onClick={toggleLang}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--primary)] text-sm font-bold text-[var(--fg)] transition-colors cursor-pointer select-none"
            title={lang === 'en' ? 'Switch to Nepali' : 'अंग्रेजीमा हेर्नुहोस्'}
          >
            <Languages className="w-4 h-4 text-[var(--primary)]" />
            <span>{lang === 'en' ? 'नेपाली' : 'EN'}</span>
          </button>

          {/* Dark Mode Toggle */}
          <ThemeToggle />

          {/* User Profile Avatar */}
          <button
            type="button"
            onClick={() => setTab('profile')}
            className="relative flex items-center gap-2 p-1 rounded-xl border border-transparent hover:border-[var(--line)] transition-all cursor-pointer"
            title={me?.name || 'Profile'}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black shadow-xs ring-2 ring-white dark:ring-[var(--surface)]"
              style={{ backgroundColor: avColor(me?.name) }}
            >
              {initials(me?.name)}
            </div>
            {activeBadge > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-[var(--surface)]">
                {activeBadge}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

