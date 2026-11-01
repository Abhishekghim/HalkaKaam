'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { WorkerFeed } from './WorkerFeed';
import { WorkerOffers } from './WorkerOffers';
import { HostJobs } from './HostJobs';
import { PostJob } from './PostJob';
import { ProfileView } from './ProfileView';
import { ChatView } from './ChatView';
import { SheetModal } from './SheetModal';
import { Toast } from './Toast';
import {
  Compass,
  Handshake,
  FolderOpen,
  User,
  Plus,
  Briefcase,
  Home,
} from 'lucide-react';

export const AppShell: React.FC = () => {
  const {
    t,
    lang,
    mode,
    setMode,
    tab,
    setTab,
    hostBadge,
    workerBadge,
    isStandaloneApp,
  } = useApp();

  const renderActiveScreen = () => {
    if (mode === 'worker') {
      if (tab === 'bids') return <WorkerOffers />;
      if (tab === 'profile') return <ProfileView />;
      if (tab === 'wchat') return <ChatView />;
      return <WorkerFeed />;
    } else {
      if (tab === 'post') return <PostJob />;
      if (tab === 'profile') return <ProfileView />;
      if (tab === 'hchat') return <ChatView />;
      return <HostJobs />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)] transition-colors">
      {/* Top Navbar */}
      <Navbar onPostClick={() => { setMode('host'); setTab('post'); }} />

      {/* Desktop Mode & Secondary Nav Bar */}
      <div className="hidden md:block border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Always-visible Main Page (All Open Tasks) button */}
            <button
              type="button"
              onClick={() => {
                setMode('worker');
                setTab('feed');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-colors cursor-pointer ${
                mode === 'worker' && tab === 'feed'
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'bg-[var(--surface-2)] text-[var(--fg)] hover:border-[var(--primary)] border border-[var(--line)]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{t('nav_find')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('worker');
                setTab('bids');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer relative ${
                mode === 'worker' && ['bids', 'wchat'].includes(tab)
                  ? 'bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary-border)]'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <Handshake className="w-4 h-4" />
              <span>{t('nav_pitches')}</span>
              {workerBadge > 0 && (
                <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white text-xs flex items-center justify-center font-black">
                  {workerBadge}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('host');
                setTab('jobs');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer relative ${
                mode === 'host' && ['jobs', 'inbox', 'hchat'].includes(tab)
                  ? 'bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary-border)]'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>{t('nav_myjobs')}</span>
              {hostBadge > 0 && (
                <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white text-xs flex items-center justify-center font-black">
                  {hostBadge}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('host');
                setTab('post');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-colors cursor-pointer ${
                mode === 'host' && tab === 'post'
                  ? 'bg-[var(--accent-fill)] text-white shadow-xs'
                  : 'text-[var(--accent-text)] bg-[var(--accent-soft)] hover:opacity-90 border border-[var(--accent-border)]'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{t('nav_post')}</span>
            </button>

            <button
              type="button"
              onClick={() => setTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                tab === 'profile'
                  ? 'bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary-border)]'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t('nav_profile')}</span>
            </button>
          </div>

          <div className="text-sm font-bold text-[var(--success)] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--success)] animate-pulse" />
            <span>{t('free_phase')}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {/* Easy Back-to-Main-Page Banner when user is not on the main feed */}
        {!(mode === 'worker' && tab === 'feed') && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('worker');
                setTab('feed');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--primary)] text-sm font-extrabold text-[var(--primary)] shadow-xs transition-all cursor-pointer"
            >
              <span>← {lang === 'ne' ? 'मुख्य पृष्ठमा फर्कनुहोस् (सबै कामहरू)' : 'Back to Main Page (All Tasks)'}</span>
            </button>
          </div>
        )}
        {renderActiveScreen()}
      </main>

      {/* Mobile Sticky Bottom Navigation (<768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--line)] safe-area-pb">
        <div className="grid grid-cols-5 h-18 items-center px-1 max-w-md mx-auto">
          {/* Tab 1: Find Jobs */}
          <button
            type="button"
            onClick={() => {
              setMode('worker');
              setTab('feed');
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 cursor-pointer transition-colors ${
              mode === 'worker' && tab === 'feed'
                ? 'text-[var(--primary)] font-extrabold'
                : 'text-[var(--fg-muted)]'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-xs font-bold">{t('nav_find')}</span>
          </button>

          {/* Tab 2: My Offers */}
          <button
            type="button"
            onClick={() => {
              setMode('worker');
              setTab('bids');
            }}
            className={`relative flex flex-col items-center justify-center gap-1 py-1.5 cursor-pointer transition-colors ${
              mode === 'worker' && ['bids', 'wchat'].includes(tab)
                ? 'text-[var(--primary)] font-extrabold'
                : 'text-[var(--fg-muted)]'
            }`}
          >
            <Handshake className="w-5 h-5" />
            <span className="text-xs font-bold">{t('nav_pitches')}</span>
            {workerBadge > 0 && (
              <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] font-black flex items-center justify-center">
                {workerBadge}
              </span>
            )}
          </button>

          {/* Center Elevated Action Button (FAB): Post Task */}
          <div className="flex items-center justify-center -mt-5">
            <button
              type="button"
              onClick={() => {
                setMode('host');
                setTab('post');
              }}
              aria-label="Post a Task"
              className="w-14 h-14 rounded-full bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white shadow-cta flex items-center justify-center active:scale-95 transition-all cursor-pointer ring-4 ring-[var(--surface)]"
            >
              <Plus className="w-7 h-7 stroke-[3]" />
            </button>
          </div>

          {/* Tab 4: My Tasks (Host Jobs) */}
          <button
            type="button"
            onClick={() => {
              setMode('host');
              setTab('jobs');
            }}
            className={`relative flex flex-col items-center justify-center gap-1 py-1.5 cursor-pointer transition-colors ${
              mode === 'host' && ['jobs', 'inbox', 'hchat'].includes(tab)
                ? 'text-[var(--primary)] font-extrabold'
                : 'text-[var(--fg-muted)]'
            }`}
          >
            <FolderOpen className="w-5 h-5" />
            <span className="text-xs font-bold">{t('nav_myjobs')}</span>
            {hostBadge > 0 && (
              <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] font-black flex items-center justify-center">
                {hostBadge}
              </span>
            )}
          </button>

          {/* Tab 5: Profile */}
          <button
            type="button"
            onClick={() => setTab('profile')}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 cursor-pointer transition-colors ${
              tab === 'profile'
                ? 'text-[var(--primary)] font-extrabold'
                : 'text-[var(--fg-muted)]'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-bold">{t('nav_profile')}</span>
          </button>
        </div>
      </nav>

      {/* Footer (Website only, hidden in installed mobile app) */}
      {!isStandaloneApp && <Footer />}

      {/* Modals & Toasts */}
      <SheetModal />
      <Toast />
    </div>
  );
};
