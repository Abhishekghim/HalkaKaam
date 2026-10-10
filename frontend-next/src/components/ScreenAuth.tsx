'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Pennants } from './Pennants';
import { Wordmark } from './Wordmark';

export const ScreenAuth: React.FC = () => {
  const {
    t,
    authStep,
    setAuthStep,
    authPhone,
    authName,
    authArea,
    sendOtp,
    verifyOtp,
    setView,
  } = useApp();

  const [name, setName] = useState(authName);
  const [phone, setPhone] = useState(authPhone);
  const [area, setArea] = useState(authArea);
  const [otp, setOtp] = useState('');

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    sendOtp(name, phone, area);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtp(otp);
  };

  if (authStep === 1) {
    return (
      <div className="screen-full" style={{ justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <Pennants />
          <Wordmark style={{ fontSize: 'var(--fs-xl)' }} />
        </div>
        <h1 style={{ fontSize: 'var(--fs-2xl)', marginBottom: '8px' }}>{t('welcome')}</h1>
        <p style={{ color: 'var(--slate)', marginBottom: '26px', lineHeight: 1.5 }}>
          {t('auth_sub')}
        </p>

        <form onSubmit={handleSendCode}>
          <div className="field">
            <label>{t('full_name')}</label>
            <input
              type="text"
              placeholder={t('name_ph')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>{t('mobile')}</label>
            <input
              type="tel"
              placeholder={t('mobile_ph')}
              maxLength={10}
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>{t('area_opt')}</label>
            <input
              type="text"
              placeholder={t('area_ph')}
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg">
            {t('send_code')}
          </button>
        </form>

        <p
          className="changelink"
          style={{ cursor: 'pointer' }}
          onClick={() => setView('landing')}
        >
          {t('back')}
        </p>
      </div>
    );
  }

  return (
    <div className="screen-full" style={{ justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <Pennants />
        <Wordmark style={{ fontSize: 'var(--fs-xl)' }} />
      </div>
      <h1 style={{ fontSize: 'var(--fs-2xl)', marginBottom: '8px' }}>{t('enter_code')}</h1>
      <p style={{ color: 'var(--slate)', marginBottom: '26px', lineHeight: 1.5 }}>
        {t('code_sent_to')} <b>+977 {phone || authPhone}</b>
      </p>

      <div className="otp-note">📱 {t('demo_otp')}</div>

      <form onSubmit={handleVerify}>
        <div className="field">
          <label>{t('otp_label')}</label>
          <input
            type="text"
            placeholder="••••••"
            maxLength={6}
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            autoFocus
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg">
          {t('verify')}
        </button>
      </form>

      <p
        className="changelink"
        style={{ cursor: 'pointer' }}
        onClick={() => setAuthStep(1)}
      >
        {t('change_number')}
      </p>
    </div>
  );
};

