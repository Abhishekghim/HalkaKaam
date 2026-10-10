'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Job } from '../types';
import { npr } from '../lib/constants';

const QUICK = ['qp_near', 'qp_exp', 'qp_tools', 'qp_free'];

export const OfferForm: React.FC<{ job: Job }> = ({ job }) => {
  const { t, submitOffer, showToast, openSheet } = useApp();
  const [price, setPrice] = useState(String(job.price));
  const [pitch, setPitch] = useState('');

  const amount = Number(price);
  const addQuick = (key: string) => {
    const line = t(key);
    if (pitch.includes(line)) return;
    setPitch((p) => (p.trim() ? `${p.trim()} ${line}` : line));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 50) { showToast(t('min_price')); return; }
    if (pitch.trim().length < 5) { showToast(t('your_pitch')); return; }
    submitOffer(job.id, amount, pitch.trim());
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="backrow" style={{ marginBottom: 6 }}>
        <button type="button" className="backbtn" onClick={() => openSheet('jobDetail', { jobId: job.id })}>‹</button>
        <h2 style={{ margin: 0 }}>{t('make_offer')}</h2>
      </div>
      <p className="desc">{job.title}</p>

      <div className="field">
        <label>{t('your_offer')} ({job.ptype === 'Hourly' ? t('hourly') : t('flat')})</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min={50} step={10} inputMode="numeric" required />
        <div className="help">
          {t('budget_hint')}: <b>{npr(job.price)}</b>
          {amount > job.price && <span style={{ color: '#A36A00' }}> · {t('offer_more')}</span>}
        </div>
      </div>

      <div className="field">
        <label>{t('your_pitch')}</label>
        <textarea value={pitch} onChange={(e) => setPitch(e.target.value)} placeholder={t('pitch_ph')} maxLength={500} />
        <div className="help">{t('quick_add')}</div>
        <div className="qchips">
          {QUICK.map((k) => (
            <button type="button" key={k} className={`qchip ${pitch.includes(t(k)) ? 'used' : ''}`} onClick={() => addQuick(k)}>
              ＋ {t(k)}
            </button>
          ))}
        </div>
      </div>

      <div className="infobox blue"><span className="ic">🔒</span><div>{t('offer_private')}</div></div>

      <button type="submit" className="btn btn-primary btn-lg">{t('send_offer')}</button>
    </form>
  );
};

