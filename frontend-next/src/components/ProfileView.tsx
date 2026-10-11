'use client';

import React, { useState } from 'react';
import { User } from '../types';
import { useApp } from '../context/AppContext';
import { avColor, initials, starsHtml } from '../lib/constants';
import { VerifiedBadge } from './ui/StatusBadge';
import { ThemeToggle } from './ui/ThemeToggle';
import {
  ShieldCheck,
  CheckCircle,
  Phone,
  MessageCircle,
  Send,
  Star,
  Award,
  Calendar,
  Edit3,
  LogOut,
  Languages,
  Moon,
  AlertCircle,
} from 'lucide-react';

interface ProfileViewProps {
  user?: User | null;
  role?: 'worker' | 'host';
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, role = 'worker' }) => {
  const {
    t,
    lang,
    toggleLang,
    me,
    ratingOf,
    reviewsOf,
    updateUserBio,
    logout,
    openSheet,
    showToast,
  } = useApp();

  const targetUser = user || me;
  const isMe = me && targetUser && me.id === targetUser.id;

  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState(targetUser?.bio || '');

  if (!targetUser) return null;

  const rWorker = ratingOf(targetUser.id, 'worker');
  const rHost = ratingOf(targetUser.id, 'host');
  const activeRating = role === 'worker' ? rWorker : rHost;
  const reviews = reviewsOf(targetUser.id, role);

  const handleSaveBio = () => {
    updateUserBio(targetUser.id, bioText);
    setEditingBio(false);
  };

  const contactPhone = targetUser.phone || '9801234567';

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8">
      {/* Profile Header Card */}
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xs overflow-hidden relative">
        {/* Subtle dual Nepal gradient top bar */}
        <div className="absolute top-0 left-0 right-0 h-2 flex">
          <div className="flex-1 bg-[var(--primary)]" />
          <div className="flex-1 bg-[var(--accent-fill)]" />
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pt-2 text-center sm:text-left">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full text-white font-black text-2xl flex items-center justify-center shadow-md ring-4 ring-[var(--surface-2)] flex-none"
            style={{ background: avColor(targetUser.name) }}
          >
            {initials(targetUser.name)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-black text-[var(--fg)] tracking-tight truncate">
                {targetUser.name}
              </h2>
              {targetUser.kycStatus === 'verified' && (
                <VerifiedBadge size="md" lang={lang} />
              )}
            </div>

            <p className="text-xs text-[var(--fg-muted)] font-semibold flex items-center justify-center sm:justify-start gap-2 mb-3">
              <span>{targetUser.campus || 'Kathmandu, Nepal'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[var(--fg-subtle)]" />
                <span>
                  {t('joined')}{' '}
                  {targetUser.created
                    ? new Date(targetUser.created).toLocaleDateString('en-GB', {
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Recent'}
                </span>
              </span>
            </p>

            {/* Rating Stars & Count */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--line)] text-xs font-bold">
              <span className="stars">{starsHtml(activeRating.avg)}</span>
              <span className="text-[var(--fg)]">
                {activeRating.avg ? activeRating.avg.toFixed(1) : t('new_helper')}
              </span>
              <span className="text-[var(--fg-muted)]">
                ({activeRating.count} {t('reviews')})
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mt-6 pt-5 border-t border-[var(--line)] text-center">
          <div className="p-2.5 rounded-2xl bg-[var(--surface-2)]">
            <span className="font-mukta text-xl font-black text-[var(--primary)] block leading-none">
              {targetUser.baseCount || activeRating.count || 0}
            </span>
            <span className="text-[11px] font-bold text-[var(--fg-muted)] mt-1 block">
              {lang === 'ne' ? 'सम्पन्न कामहरू' : 'Tasks Completed'}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[var(--surface-2)]">
            <span className="font-mukta text-xl font-black text-[var(--star)] block leading-none">
              {activeRating.avg ? `${activeRating.avg.toFixed(1)}★` : '5.0★'}
            </span>
            <span className="text-[11px] font-bold text-[var(--fg-muted)] mt-1 block">
              {lang === 'ne' ? 'औसत रेटिङ' : 'Average Rating'}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[var(--surface-2)]">
            <span className="font-mukta text-xl font-black text-[var(--success)] block leading-none">
              100%
            </span>
            <span className="text-[11px] font-bold text-[var(--fg-muted)] mt-1 block">
              {lang === 'ne' ? 'समयमै भुक्तानी' : 'Completion Rate'}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Options if viewing someone else */}
      {!isMe && (
        <div className="p-4 rounded-2xl border border-[var(--primary-border)] bg-[var(--primary-soft)]">
          <h4 className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider mb-2.5">
            {lang === 'ne' ? 'सिधै सम्पर्क गर्नुहोस्' : 'Direct Contact Options'}
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <a
              href={`tel:${contactPhone}`}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[var(--success)] hover:opacity-90 text-white text-xs font-bold shadow-2xs transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>{t('contact_call')}</span>
            </a>

            <a
              href={`viber://chat?number=%2B977${contactPhone}`}
              onClick={(e) => {
                if (!navigator.userAgent.includes('Mobile')) {
                  e.preventDefault();
                  showToast(`Viber: +977-${contactPhone}`);
                }
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#7360F2] hover:bg-[#604ED9] text-white text-xs font-bold shadow-2xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Viber</span>
            </a>

            <a
              href={`https://wa.me/977${contactPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold shadow-2xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Nepal KYC Status Section */}
      {targetUser.kycStatus === 'verified' ? (
        <div className="p-4 rounded-2xl bg-[var(--success-soft)] border border-[var(--success-border)] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--success-soft)] text-[var(--success)] flex items-center justify-center flex-none">
              <ShieldCheck className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <div className="text-xs font-black text-[var(--fg)] flex items-center gap-1.5">
                <span>{lang === 'ne' ? 'नेपाल सरकार KYC प्रमाणित' : 'Nepal Government KYC Verified'}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--success)] text-white font-bold">
                  ✓ Verified
                </span>
              </div>
              <div className="text-[11px] font-semibold text-[var(--success)] mt-0.5">
                {targetUser.kycData?.docType === 'nid'
                  ? 'राष्ट्रिय परिचयपत्र (National ID)'
                  : targetUser.kycData?.docType === 'driving_license'
                  ? 'सवारी चालक अनुमतिपत्र (Driving License)'
                  : targetUser.kycData?.docType === 'passport'
                  ? 'राहदानी (Passport)'
                  : 'नेपाली नागरिकता (Citizenship Certificate)'}
                {targetUser.kycData?.district ? ` · ${targetUser.kycData.district}` : ''}
              </div>
            </div>
          </div>
        </div>
      ) : isMe ? (
        <div className="p-4 rounded-2xl bg-[var(--warning-soft)] border border-[var(--warning-border)] text-[var(--fg)] space-y-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--warning-soft)] text-[var(--warning)] flex items-center justify-center flex-none">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-[var(--fg)]">
                {lang === 'ne' ? 'KYC प्रमाणीकरण आवश्यक छ' : 'Nepal KYC Verification Required'}
              </div>
              <p className="text-[11px] text-[var(--fg-muted)] font-medium leading-relaxed mt-0.5">
                {lang === 'ne'
                  ? 'काम खोज्न र प्रस्ताव पठाउन नेपाल सरकारको आधिकारिक परिचयपत्र (नागरिकता वा NID) प्रमाणीकरण गर्नुहोस्।'
                  : 'Verify your identity with official Nepali documents (Citizenship / NID) to start applying.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openSheet('kyc')}
            className="w-full py-2.5 px-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-extrabold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>{lang === 'ne' ? 'अहिले नै KYC प्रमाणित गर्नुहोस्' : 'Verify KYC Document Now'}</span>
          </button>
        </div>
      ) : null}

      {/* Bio Section */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider">
            {lang === 'ne' ? 'मेरो बारेमा' : 'About Me'}
          </h3>
          {isMe && !editingBio && (
            <button
              type="button"
              onClick={() => setEditingBio(true)}
              className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('edit_profile')}</span>
            </button>
          )}
        </div>

        {isMe && editingBio ? (
          <div className="space-y-3">
            <textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              placeholder="Share a few words about what you do, your skills, availability..."
              rows={3}
              className="w-full p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-sm font-medium text-[var(--fg)] focus:outline-none focus:border-[var(--primary)]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveBio}
                className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold cursor-pointer"
              >
                {t('save')}
              </button>
              <button
                type="button"
                onClick={() => setEditingBio(false)}
                className="px-4 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg)] text-xs font-bold cursor-pointer"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-[var(--fg)] leading-relaxed font-medium">
            {targetUser.bio || (lang === 'ne' ? 'कुनै विवरण लेखिएको छैन।' : 'No bio added yet.')}
          </p>
        )}
      </div>

      {/* Customer Reviews Section */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-xs">
        <h3 className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-4">
          {t('reviews')} ({reviews.length})
        </h3>

        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((rv, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[var(--fg)]">{rv.from}</span>
                  <span className="stars">{starsHtml(rv.stars)}</span>
                </div>
                <div className="text-[11px] font-semibold text-[var(--fg-muted)]">
                  {rv.job}
                </div>
                <p className="text-xs text-[var(--fg)] leading-relaxed font-medium">
                  {rv.txt}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--fg-muted)] text-center py-4">
            {t('no_reviews')}
          </p>
        )}
      </div>

      {/* Settings & Preferences Section (For Logged in User) */}
      {isMe && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-2">
            {lang === 'ne' ? 'सेटिङ तथा प्राथमिकता' : 'Preferences & Account'}
          </h3>

          {/* Dark Mode Row */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
            <div className="flex items-center gap-2.5 text-xs font-bold text-[var(--fg)]">
              <Moon className="w-4 h-4 text-[var(--primary)]" />
              <span>{t('dark_mode')}</span>
            </div>
            <ThemeToggle showLabel />
          </div>

          {/* Language Row */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
            <div className="flex items-center gap-2.5 text-xs font-bold text-[var(--fg)]">
              <Languages className="w-4 h-4 text-[var(--primary)]" />
              <span>{t('language')}</span>
            </div>
            <button
              type="button"
              onClick={toggleLang}
              className="px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold text-[var(--primary)] hover:border-[var(--primary)] cursor-pointer"
            >
              {lang === 'en' ? 'नेपालीमा बदल्नुहोस्' : 'Switch to English'}
            </button>
          </div>

          {/* Log Out */}
          <div className="pt-2">
            <button
              type="button"
              onClick={logout}
              className="w-full py-3 px-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent-text)] font-extrabold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('log_out')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
