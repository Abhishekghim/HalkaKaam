'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Job } from '../types';
import { npr } from '../lib/constants';
import { trText } from '../lib/i18n';
import {
  ArrowLeft,
  Send,
  Lock,
  ShieldCheck,
  Plus,
  Coins,
  MessageSquare,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const QUICK = ['qp_near', 'qp_exp', 'qp_tools', 'qp_free'];

export const OfferForm: React.FC<{ job: Job }> = ({ job }) => {
  const { t, lang, me, submitOffer, showToast, openSheet } = useApp();
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
    if (!amount || amount < 50) {
      showToast(t('min_price'));
      return;
    }
    if (pitch.trim().length < 5) {
      showToast(t('your_pitch'));
      return;
    }
    submitOffer(job.id, amount, pitch.trim());
  };

  // If worker hasn't completed KYC
  if (me?.kycStatus !== 'verified') {
    return (
      <div className="space-y-4 py-1 text-[var(--fg)]">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--line)] pr-8">
          <button
            type="button"
            onClick={() => openSheet('jobDetail', { jobId: job.id })}
            aria-label="Back to job details"
            className="w-8 h-8 rounded-xl bg-[var(--surface-2)] text-[var(--fg-muted)] hover:text-[var(--fg)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-extrabold tracking-tight text-[var(--fg)]">
            {t('make_offer')}
          </h2>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--warning-soft)] border border-[var(--warning)]/30 space-y-3">
          <div className="flex items-center gap-2.5 text-[var(--warning)]">
            <div className="w-9 h-9 rounded-xl bg-[var(--surface)] shadow-2xs flex items-center justify-center flex-none">
              <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[var(--fg)]">
                {lang === 'ne' ? 'केवाईसी प्रमाणीकरण आवश्यक छ' : 'Identity Verification Required'}
              </h3>
              <p className="text-[11px] text-[var(--fg-muted)]">
                {lang === 'ne' ? 'सुरक्षा र विश्वासका लागि अनिवार्य' : 'Required to ensure marketplace safety'}
              </p>
            </div>
          </div>

          <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
            {lang === 'ne'
              ? 'यस काममा अफर पठाउन तपाईंको नेपाली नागरिकता वा राष्ट्रिय परिचयपत्र प्रमाणित हुनुपर्छ। यसले काम दिने व्यक्तिलाई ढुक्क बनाउँछ।'
              : 'To submit an offer for this job, you must verify your identity with official Nepali documents (Citizenship, NID, License, or Passport).'}
          </p>

          <button
            type="button"
            className="w-full py-3 px-4 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-extrabold text-sm transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
            onClick={() => openSheet('kyc', { jobId: job.id })}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{lang === 'ne' ? 'अहिले नै KYC प्रमाणित गर्नुहोस्' : 'Verify KYC Now'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-1 text-[var(--fg)]">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--line)] pr-8">
        <button
          type="button"
          onClick={() => openSheet('jobDetail', { jobId: job.id })}
          aria-label="Back to job details"
          className="w-8 h-8 rounded-xl bg-[var(--surface-2)] text-[var(--fg-muted)] hover:text-[var(--fg)] flex items-center justify-center transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-[var(--fg)]">
            {t('make_offer')}
          </h2>
          <p className="text-xs text-[var(--fg-muted)] truncate max-w-[260px] sm:max-w-md">
            {trText(job.title, lang)}
          </p>
        </div>
      </div>

      {/* Offer Price Input */}
      <div>
        <label className="block text-xs font-bold text-[var(--fg)] mb-1.5 flex items-center justify-between">
          <span>
            {t('your_offer')} ({job.ptype === 'Hourly' ? t('hourly') : t('flat')})
          </span>
          <span className="text-[11px] text-[var(--fg-muted)] font-normal">
            {t('budget_hint')}: <b className="text-[var(--primary)]">{npr(job.price)}</b>
          </span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sm font-bold text-[var(--primary)]">
            रु
          </div>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min={50}
            step={10}
            inputMode="numeric"
            required
            className="w-full pl-9 pr-3.5 py-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg)] text-lg font-extrabold focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 shadow-2xs font-mono"
          />
        </div>
        {amount > job.price && (
          <p className="text-[11px] text-[var(--warning)] font-medium mt-1.5">
            ⚠ {t('offer_more')}
          </p>
        )}
      </div>

      {/* Your Pitch */}
      <div>
        <label className="block text-xs font-bold text-[var(--fg)] mb-1.5 flex items-center justify-between">
          <span>{t('your_pitch')}</span>
          <span className="text-[11px] text-[var(--fg-muted)] font-normal">
            {pitch.length}/500
          </span>
        </label>
        <textarea
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
          placeholder={t('pitch_ph')}
          maxLength={500}
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg)] text-sm font-medium focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 shadow-2xs resize-none"
        />

        {/* Quick Add Chips */}
        <div className="mt-2.5">
          <span className="text-[11px] font-bold text-[var(--fg-muted)] block mb-1.5">
            {t('quick_add')}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK.map((k) => {
              const text = t(k);
              const isUsed = pitch.includes(text);
              return (
                <button
                  type="button"
                  key={k}
                  onClick={() => addQuick(k)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isUsed
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--surface-2)] text-[var(--fg-muted)] hover:text-[var(--fg)] border border-[var(--line)] hover:border-[var(--line-hover)]'
                  }`}
                >
                  {isUsed ? <CheckCircle2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  <span>{text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="p-3 rounded-xl bg-[var(--primary-soft)] border border-[var(--primary)]/20 text-xs text-[var(--primary)] flex items-center gap-2">
        <Lock className="w-4 h-4 flex-none" />
        <span className="text-[11px] font-medium leading-relaxed">
          {t('offer_private')}
        </span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-3.5 px-4 rounded-xl bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white font-extrabold text-sm transition-all shadow-[var(--shadow-cta)] flex items-center justify-center gap-2 cursor-pointer"
      >
        <Send className="w-4 h-4 text-white" />
        <span>{t('send_offer')}</span>
      </button>
    </form>
  );
};
