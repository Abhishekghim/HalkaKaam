'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { Pennants } from './Pennants';
import { Wordmark } from './Wordmark';

export const ScreenLanding: React.FC = () => {
  const { t, toggleLang, goAuth } = useApp();

  return (
    <div className="screen-full" style={{ justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <Pennants />
            <Wordmark style={{ fontSize: 'var(--fs-lg)' }} />
          </div>
          <button
            style={{
              fontSize: 'var(--fs-sm)',
              fontWeight: 700,
              color: 'var(--accent)',
              background: 'var(--accent-soft)',
              padding: '8px 14px',
              borderRadius: '999px',
            }}
            onClick={toggleLang}
          >
            {t('other_lang')}
          </button>
        </div>

        <div style={{ padding: '30px 0 10px' }}>
          <Wordmark style={{ fontSize: 'var(--fs-2xl)', lineHeight: 1.05 }} />
          <p
            style={{
              fontSize: 'var(--fs-lg)',
              color: 'var(--ink)',
              lineHeight: 1.5,
              marginTop: '16px',
              fontWeight: 500,
            }}
          >
            {t('land_lead')}
          </p>
        </div>
      </div>

      <div className="rolecards">
        <button className="rolecard host" onClick={() => goAuth('host')}>
          <div className="ic">🏠</div>
          <div>
            <b>{t('land_need_help')}</b>
            <span>{t('land_need_help_sub')}</span>
          </div>
          <div className="arrow">›</div>
        </button>

        <button className="rolecard worker" onClick={() => goAuth('worker')}>
          <div className="ic">🎒</div>
          <div>
            <b>{t('land_want_work')}</b>
            <span>{t('land_want_work_sub')}</span>
          </div>
          <div className="arrow">›</div>
        </button>
      </div>

      <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--slate)', textAlign: 'center', lineHeight: 1.5 }}>
        हल्का काम, ठूलो सम्मान 🇳🇵
      </p>
    </div>
  );
};

