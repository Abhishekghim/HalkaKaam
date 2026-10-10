'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { Pennants } from './Pennants';
import { Wordmark } from './Wordmark';

export const ScreenLangPick: React.FC = () => {
  const { setLang } = useApp();

  return (
    <div className="screen-full" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <Pennants style={{ width: '46px', height: '54px', margin: '0 auto 18px' }} />
      <Wordmark style={{ fontSize: 'var(--fs-2xl)', marginBottom: '6px' }} />
      <div className="tagline" style={{ color: 'var(--slate)', marginBottom: '36px' }}>
        No work is too small · कुनै काम सानो हुँदैन
      </div>
      <div className="choose" style={{ fontSize: 'var(--fs-md)', fontWeight: 700, marginBottom: '16px' }}>
        Choose language · भाषा छान्नुहोस्
      </div>
      <button className="langbtn" onClick={() => setLang('ne')}>
        <span className="flag">🇳🇵</span> नेपाली
      </button>
      <button className="langbtn" onClick={() => setLang('en')}>
        <span className="flag">🌐</span> English
      </button>
    </div>
  );
};

