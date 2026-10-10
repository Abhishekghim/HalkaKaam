'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Pennants } from './Pennants';
import { Wordmark } from './Wordmark';
import { WorkerFeed } from './WorkerFeed';
import { WorkerOffers } from './WorkerOffers';
import { HostJobs } from './HostJobs';
import { PostJob } from './PostJob';
import { ProfileView } from './ProfileView';
import { ChatView } from './ChatView';
import { SheetModal } from './SheetModal';
import { Toast } from './Toast';
import { avColor, initials } from '../lib/constants';

export const AppShell: React.FC = () => {
  const {
    t,
    me,
    mode,
    setMode,
    tab,
    setTab,
    locName,
    radius,
    setView,
    toggleLang,
    hostBadge,
    workerBadge,
  } = useApp();

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 900);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleLogoClick = () => {
    setTab(mode === 'worker' ? 'feed' : 'jobs');
  };

  const navItems =
    mode === 'worker'
      ? [
          { tab: 'feed', on: tab === 'feed', ic: '🧭', label: t('nav_find'), badge: 0 },
          { tab: 'bids', on: ['bids', 'wchat'].includes(tab), ic: '🤝', label: t('nav_pitches'), badge: workerBadge },
          { tab: 'profile', on: tab === 'profile', ic: '👤', label: t('nav_profile'), badge: 0 },
        ]
      : [
          { tab: 'jobs', on: ['jobs', 'inbox', 'hchat'].includes(tab), ic: '🗂️', label: t('nav_myjobs'), badge: hostBadge },
          { tab: 'post', on: tab === 'post', ic: '➕', label: t('nav_post'), accent: true, badge: 0 },
          { tab: 'profile', on: tab === 'profile', ic: '👤', label: t('nav_profile'), badge: 0 },
        ];

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
    <div className={mode === 'host' ? 'mode-host' : 'mode-worker'}>
      <div id="app">
        {/* DESKTOP SIDEBAR RAIL (>=900px) */}
        {isDesktop && (
          <aside className="rail">
            <div className="rail-brand" onClick={handleLogoClick}>
              <Pennants />
              <Wordmark style={{ fontSize: 'var(--fs-xl)' }} />
            </div>

            <div className="rail-modetoggle modetoggle">
              <div className="pill" />
              <button
                className={mode === 'worker' ? 'on' : ''}
                onClick={() => setMode('worker')}
              >
                <span className="ic">🎒</span>
                {t('mode_work')}
              </button>
              <button
                className={mode === 'host' ? 'on' : ''}
                onClick={() => setMode('host')}
              >
                <span className="ic">🏠</span>
                {t('mode_host')}
              </button>
            </div>

            <nav className="rail-nav">
              {navItems.map((item) => (
                <button
                  key={item.tab}
                  className={`rail-item ${item.on ? 'on' : ''} ${item.accent ? 'accent' : ''}`}
                  onClick={() => setTab(item.tab as any)}
                >
                  <span className="ic">{item.ic}</span>
                  <span className="lbl">{item.label}</span>
                  {item.badge > 0 && <span className="navbadge">{item.badge}</span>}
                </button>
              ))}
            </nav>

            <div className="rail-spacer" />

            <button className="rail-loc" onClick={() => setView('locstep')}>
              <span className="pin">📍</span>
              <span>
                <b>{locName || t('your_location')}</b>
                <small>
                  {t('within')} {radius} km · {t('change')}
                </small>
              </span>
            </button>

            <div className="rail-user" onClick={() => setTab('profile')}>
              <div
                className="av av-sm"
                style={{ background: avColor(me?.name) }}
              >
                {initials(me?.name)}
              </div>
              <span>{me?.name || 'Guest'}</span>
              <button
                className="rail-lang"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLang();
                }}
              >
                {t('other_lang')}
              </button>
            </div>
          </aside>
        )}

        {/* MOBILE TOP BAR (<900px) */}
        {!isDesktop && (
          <>
            <div className="phasebar">🎉 {t('free_phase')}</div>
            <header className="appbar">
              <Wordmark onClick={handleLogoClick} style={{ fontSize: 'var(--fs-lg)' }} />
              <button className="loc-btn" onClick={() => setView('locstep')}>
                <span className="pin">📍</span>
                <span className="txt">{locName || `${radius} km`}</span> ▾
              </button>
              <div
                className="av av-sm cursor-pointer"
                style={{ background: avColor(me?.name) }}
                onClick={() => setTab('profile')}
              >
                {initials(me?.name)}
              </div>
            </header>

            <div className="modebar">
              <div className="modetoggle">
                <div className="pill" />
                <button
                  className={mode === 'worker' ? 'on' : ''}
                  onClick={() => setMode('worker')}
                >
                  <span className="ic">🎒</span>
                  {t('mode_work')}
                </button>
                <button
                  className={mode === 'host' ? 'on' : ''}
                  onClick={() => setMode('host')}
                >
                  <span className="ic">🏠</span>
                  {t('mode_host')}
                </button>
              </div>
            </div>
          </>
        )}

        {/* MAIN CONTENT AREA */}
        <div className={isDesktop ? 'maincol' : ''}>
          {isDesktop && <div className="phasebar">🎉 {t('free_phase')}</div>}
          <main id="screen">{renderActiveScreen()}</main>
        </div>

        {/* MOBILE BOTTOM NAVIGATION (<900px) */}
        {!isDesktop && (
          <nav className="bottomnav">
            {mode === 'worker' ? (
              navItems.map((item) => (
                <button
                  key={item.tab}
                  className={item.on ? 'on relative' : 'relative'}
                  onClick={() => setTab(item.tab as any)}
                >
                  <span className="ic">{item.ic}</span>
                  {item.label}
                  {item.badge > 0 && <span className="navbadge">{item.badge}</span>}
                </button>
              ))
            ) : (
              <>
                <button
                  className={['jobs', 'inbox', 'hchat'].includes(tab) ? 'on relative' : 'relative'}
                  onClick={() => setTab('jobs')}
                >
                  <span className="ic">🗂️</span>
                  {t('nav_myjobs')}
                  {hostBadge > 0 && <span className="navbadge">{hostBadge}</span>}
                </button>
                <div className="fabwrap">
                  <button className="fab" onClick={() => setTab('post')}>
                    ＋
                  </button>
                </div>
                <button
                  className={tab === 'profile' ? 'on' : ''}
                  onClick={() => setTab('profile')}
                >
                  <span className="ic">👤</span>
                  {t('nav_profile')}
                </button>
              </>
            )}
          </nav>
        )}

        <SheetModal />
        <Toast />
      </div>
    </div>
  );
};

