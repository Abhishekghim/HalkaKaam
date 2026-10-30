'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { ScreenLangPick } from '../components/ScreenLangPick';
import { ScreenLanding } from '../components/ScreenLanding';
import { ScreenAuth } from '../components/ScreenAuth';
import { ScreenLocation } from '../components/ScreenLocation';
import { AppShell } from '../components/AppShell';
import { Toast } from '../components/Toast';

export default function Home() {
  const { view, isStandaloneApp, me } = useApp();

  return (
    <>
      {view === 'langpick' && <ScreenLangPick />}
      {view === 'landing' && (isStandaloneApp ? (me ? <AppShell /> : <ScreenAuth />) : <ScreenLanding />)}
      {view === 'auth' && <ScreenAuth />}
      {view === 'locstep' && <ScreenLocation />}
      {view === 'app' && <AppShell />}
      <Toast />
    </>
  );
}
