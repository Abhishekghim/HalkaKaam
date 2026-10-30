'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { avColor, initials, Stars } from '../lib/constants';
import { Role } from '../types';
import {
  Award,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Globe,
  Home,
  LogOut,
  MapPin,
  MessageSquare,
  Moon,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Star,
  Sun,
} from 'lucide-react';

interface ProfileViewProps {
  userId?: string;
  role?: Role;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ userId, role: initialRole }) => {
  const {
    t,
    lang,
    setLang,
    theme,
    toggleTheme,
    me,
    mode,
    setMode,
    setTab,
    userById,
    jobs,
    ratingOf,
    reviewsOf,
    updateMyBio,
    openSheet,
    logout,
    showToast,
  } = useApp();

  const targetId = userId || me?.id;
  const user = userById(targetId);
  const isMe = Boolean(me && user && me.id === user.id);

  const [viewRole, setViewRole] = useState<Role>(initialRole || mode || 'worker');
  const [activeSection, setActiveSection] = useState<'overview' | 'reviews' | 'settings'>('overview');
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState(user?.bio || '');

  if (!user) return null;

  const rating = ratingOf(user.id, viewRole);
  const reviews = reviewsOf(user.id, viewRole);

  const completedJobs = jobs.filter((j) => {
    if (j.status !== 'completed') return false;
    if (viewRole === 'host') return j.hostId === user.id;
    const assigned = j.bids.find((b) => b.id === j.assignedBidId);
    return assigned?.workerId === user.id;
  }).length;

  const assignedJobs = jobs.filter((j) => {
    if (viewRole === 'host') return j.hostId === user.id && j.status !== 'cancelled';
    const assigned = j.bids.find((b) => b.id === j.assignedBidId);
    return assigned?.workerId === user.id;
  }).length;

  const reliability =
    assignedJobs > 0 ? Math.min(100, Math.round((completedJobs / assignedJobs) * 100)) : 100;

  const isVerified =
    user.kycStatus === 'verified' || (user.baseCount || 0) >= 2 || rating.count >= 2;

  const canSeeContact =
    isMe ||
    Boolean(
      me &&
        jobs.some((j) => {
          if (j.status !== 'assigned' && j.status !== 'completed') return false;
          const assignedBid = j.bids.find((b) => b.id === j.assignedBidId);
          if (!assignedBid) return false;
          return (
            (j.hostId === me.id && assignedBid.workerId === user.id) ||
            (j.hostId === user.id && assignedBid.workerId === me.id)
          );
        })
    );

  const handleSaveBio = () => {
    updateMyBio(bioDraft.trim());
    setEditingBio(false);
    showToast(lang === 'ne' ? 'प्रोफाइल विवरण सुरक्षित गरियो' : 'Bio updated');
  };

  const joinYear = user.created ? new Date(user.created).getFullYear() : 2025;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* 1. Unified Profile Card */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--line)]">
          <div className="flex items-center gap-4">
            <div className="relative flex-none">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-sm"
                style={{ backgroundColor: avColor(user.name) }}
              >
                {initials(user.name)}
              </div>
              {isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--ok)] text-white flex items-center justify-center ring-2 ring-[var(--surface)]"
                  title="Verified"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-[var(--fg)]">
                  {user.name}
                </h1>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--ok-tint)] text-[var(--ok)] text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {lang === 'ne' ? 'प्रमाणित' : 'Verified'}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs font-semibold text-[var(--fg-muted)]">
                {user.campus && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
                    {user.campus}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {lang === 'ne' ? `सदस्य: ${joinYear}` : `Joined ${joinYear}`}
                </span>
              </div>
            </div>
          </div>

          {/* Role Stats Toggle (Worker vs Host reputation) */}
          <div className="inline-flex self-start sm:self-center p-1 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
            <button
              type="button"
              onClick={() => setViewRole('worker')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewRole === 'worker'
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              {lang === 'ne' ? 'कामदार' : 'Worker'}
            </button>
            <button
              type="button"
              onClick={() => setViewRole('host')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewRole === 'host'
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              {lang === 'ne' ? 'पोस्टर' : 'Host'}
            </button>
          </div>
        </div>

        {/* Clean 3-Metric Stat Row */}
        <div className="grid grid-cols-3 gap-3 py-4 border-b border-[var(--line)] text-center">
          <div>
            <div className="text-lg sm:text-xl font-black text-[var(--fg)]">{completedJobs}</div>
            <div className="text-[11px] font-bold text-[var(--fg-muted)]">
              {viewRole === 'worker'
                ? lang === 'ne'
                  ? 'सम्पन्न काम'
                  : 'Tasks Done'
                : lang === 'ne'
                  ? 'पोस्ट गरिएका'
                  : 'Tasks Hosted'}
            </div>
          </div>

          <div className="border-x border-[var(--line)]">
            <div className="inline-flex items-center gap-1 text-lg sm:text-xl font-black text-[var(--fg)]">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{rating.count > 0 ? rating.avg.toFixed(1) : 'New'}</span>
            </div>
            <div className="text-[11px] font-bold text-[var(--fg-muted)]">
              {rating.count} {lang === 'ne' ? 'समीक्षा' : 'Reviews'}
            </div>
          </div>

          <div>
            <div className="text-lg sm:text-xl font-black text-[var(--ok)]">{reliability}%</div>
            <div className="text-[11px] font-bold text-[var(--fg-muted)]">
              {lang === 'ne' ? 'विश्वसनीयता' : 'Reliability'}
            </div>
          </div>
        </div>

        {/* Inline Bio */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--fg-muted)]">
              {t('bio_label')}
            </span>
            {isMe && !editingBio && (
              <button
                type="button"
                onClick={() => {
                  setBioDraft(user.bio || '');
                  setEditingBio(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{lang === 'ne' ? 'सम्पादन' : 'Edit'}</span>
              </button>
            )}
          </div>

          {editingBio ? (
            <div className="space-y-2.5 mt-2">
              <textarea
                rows={3}
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                placeholder={t('bio_ph')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] resize-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBio(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--fg-muted)] hover:bg-[var(--surface-2)] cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSaveBio}
                  className="px-4 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-bold cursor-pointer"
                >
                  {t('save_bio')}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
              {user.bio ||
                (isMe
                  ? lang === 'ne'
                    ? 'आफ्नो सीप र अनुभवको बारेमा छोटो विवरण थप्नुहोस्।'
                    : 'Add a short bio about your skills and availability.'
                  : lang === 'ne'
                    ? 'कुनै विवरण राखिएको छैन।'
                    : 'No bio provided yet.')}
            </p>
          )}
        </div>

        {/* Contact Bar when viewing another user with unlocked contact */}
        {!isMe && user.phone && canSeeContact && (
          <div className="mt-4 pt-4 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--fg)]">
              <Phone className="w-4 h-4 text-[var(--ok)]" />
              <span>+977 {user.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`tel:+977${user.phone}`}
                className="px-3 py-1.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold"
              >
                {lang === 'ne' ? 'कल गर्नुहोस्' : 'Call'}
              </a>
              <a
                href={`https://wa.me/977${user.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[var(--ok)] text-white text-xs font-bold"
              >
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 2. Own Profile Segmented Tabs (Keeps KYC, Reviews, and Settings organized) */}
      {isMe ? (
        <>
          <div className="grid grid-cols-3 p-1 rounded-xl border border-[var(--line)] bg-[var(--surface)]">
            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className={`py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeSection === 'overview'
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              {lang === 'ne' ? 'प्रमाणीकरण (KYC)' : 'Account & KYC'}
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('reviews')}
              className={`py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeSection === 'reviews'
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              {lang === 'ne' ? `समीक्षा (${reviews.length})` : `Reviews (${reviews.length})`}
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('settings')}
              className={`py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeSection === 'settings'
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              {lang === 'ne' ? 'सेटिङहरू' : 'Settings'}
            </button>
          </div>

          {/* Section 1: Account & KYC */}
          {activeSection === 'overview' && (
            <div className="space-y-4">
              {/* KYC Status Card */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
                {user.kycStatus === 'verified' ? (
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[var(--ok-tint)] text-[var(--ok)] flex items-center justify-center flex-none">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-extrabold text-[var(--fg)]">
                        {lang === 'ne' ? 'KYC पहिचान प्रमाणित छ' : 'KYC Identity Verified'}
                      </h3>
                      <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                        {lang === 'ne'
                          ? 'तपाईं साझा काममा जुनसुकै काममा प्रस्ताव पठाउन र काम लिन योग्य हुनुहुन्छ।'
                          : 'You are verified to apply for tasks and accept jobs on Sajha Kaam.'}
                      </p>
                      {user.kycData && (
                        <div className="mt-3 pt-3 border-t border-[var(--line)] flex flex-wrap gap-4 text-xs text-[var(--fg-muted)]">
                          <span>
                            <strong className="text-[var(--fg)]">ID:</strong>{' '}
                            {user.kycData.docType.toUpperCase()} ({user.kycData.idNumber})
                          </span>
                          {user.phone && (
                            <span>
                              <strong className="text-[var(--fg)]">Phone:</strong> +977 {user.phone}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : user.kycStatus === 'pending' ? (
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[var(--warn-tint)] text-[var(--warn)] flex items-center justify-center flex-none">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[var(--fg)]">
                        {lang === 'ne' ? 'KYC समीक्षाको क्रममा छ' : 'KYC Verification Pending'}
                      </h3>
                      <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                        {lang === 'ne'
                          ? 'तपाईंको कागजात परीक्षण हुँदैछ।'
                          : 'Your submitted ID documents are currently being reviewed.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[var(--warn-tint)] text-[var(--warn)] flex items-center justify-center flex-none">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[var(--fg)]">
                          {lang === 'ne' ? 'KYC प्रमाणीकरण बाँकी छ' : 'Verify Your Identity (KYC)'}
                        </h3>
                        <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                          {lang === 'ne'
                            ? 'काममा प्रस्ताव पठाउन नागरिकता वा परिचयपत्र अपलोड गर्नुहोस्।'
                            : 'Required before applying to tasks. Takes less than 1 minute.'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openSheet('kyc')}
                      className="px-4 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-extrabold whitespace-nowrap cursor-pointer"
                    >
                      {lang === 'ne' ? 'अहिले प्रमाणित गर्नुहोस्' : 'Verify Now'}
                    </button>
                  </div>
                )}
              </div>

              {/* Active Mode Switch Card */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--fg)]">
                    {lang === 'ne' ? 'हालको मोड' : 'Current App Mode'}
                  </h3>
                  <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                    {mode === 'worker'
                      ? lang === 'ne'
                        ? 'तपाईं काम खोज्ने (Worker) मोडमा हुनुहुन्छ'
                        : 'You are browsing as a Worker (Find Tasks)'
                      : lang === 'ne'
                        ? 'तपाईं काम दिने (Host) मोडमा हुनुहुन्छ'
                        : 'You are in Host Mode (Post & Manage Tasks)'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = mode === 'worker' ? 'host' : 'worker';
                    setMode(nextMode);
                    setTab(nextMode === 'worker' ? 'feed' : 'jobs');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--primary)] text-xs font-bold text-[var(--fg)] cursor-pointer"
                >
                  {mode === 'worker' ? (
                    <>
                      <Home className="w-3.5 h-3.5 text-[var(--primary)]" />
                      <span>{lang === 'ne' ? 'Host मोडमा जानुहोस्' : 'Switch to Host'}</span>
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-3.5 h-3.5 text-[var(--primary)]" />
                      <span>{lang === 'ne' ? 'Worker मोडमा जानुहोस्' : 'Switch to Worker'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Section 2: Reviews */}
          {activeSection === 'reviews' && (
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
              {reviews.length === 0 ? (
                <div className="py-8 text-center">
                  <MessageSquare className="w-7 h-7 text-[var(--fg-subtle)] mx-auto mb-2" />
                  <p className="text-sm font-bold text-[var(--fg-muted)]">{t('no_reviews')}</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--line)]">
                  {reviews.map((r, i) => (
                    <div key={i} className="py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-extrabold text-[var(--fg)]">
                          {r.from || (lang === 'ne' ? 'प्रयोगकर्ता' : 'Community Member')}
                        </span>
                        <Stars value={r.stars} size={13} />
                      </div>
                      <p className="text-xs text-[var(--fg-muted)] mb-1">{r.txt}</p>
                      <span className="text-[11px] font-semibold text-[var(--fg-subtle)]">
                        {r.job}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 3: Settings */}
          {activeSection === 'settings' && (
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] divide-y divide-[var(--line)] overflow-hidden">
              {/* Language */}
              <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-[var(--primary)]" />
                  <div>
                    <div className="text-sm font-bold text-[var(--fg)]">
                      {lang === 'ne' ? 'भाषा (Language)' : 'Language'}
                    </div>
                    <div className="text-xs text-[var(--fg-muted)]">
                      {lang === 'ne' ? 'नेपाली वा अंग्रेजी छान्नुहोस्' : 'Choose Nepali or English'}
                    </div>
                  </div>
                </div>
                <div className="inline-flex p-1 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
                  <button
                    type="button"
                    onClick={() => setLang('ne')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      lang === 'ne' ? 'bg-[var(--primary)] text-white' : 'text-[var(--fg-muted)]'
                    }`}
                  >
                    नेपाली
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      lang === 'en' ? 'bg-[var(--primary)] text-white' : 'text-[var(--fg-muted)]'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="w-4 h-4 text-sky-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                  )}
                  <div>
                    <div className="text-sm font-bold text-[var(--fg)]">
                      {lang === 'ne' ? 'थिम (Appearance)' : 'Appearance'}
                    </div>
                    <div className="text-xs text-[var(--fg-muted)]">
                      {theme === 'dark'
                        ? lang === 'ne'
                          ? 'डार्क मोड सक्रिय छ'
                          : 'Dark mode is active'
                        : lang === 'ne'
                          ? 'लाइट मोड सक्रिय छ'
                          : 'Light mode is active'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => toggleTheme(e)}
                  className="px-3.5 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--primary)] text-xs font-bold text-[var(--fg)] cursor-pointer"
                >
                  {theme === 'dark'
                    ? lang === 'ne'
                      ? 'लाइट मोड'
                      : 'Switch to Light'
                    : lang === 'ne'
                      ? 'डार्क मोड'
                      : 'Switch to Dark'}
                </button>
              </div>

              {/* Logout */}
              <div className="p-4 sm:p-5">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-2.5 px-4 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Viewing Another User's Profile (Clean Reviews List) */
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-[var(--primary)]" />
            <h2 className="text-sm font-extrabold text-[var(--fg)]">
              {t('reviews')} ({reviews.length})
            </h2>
          </div>
          {reviews.length === 0 ? (
            <p className="text-xs text-[var(--fg-muted)] py-4 text-center">{t('no_reviews')}</p>
          ) : (
            <div className="divide-y divide-[var(--line)]">
              {reviews.map((r, i) => (
                <div key={i} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-[var(--fg)]">{r.from}</span>
                    <Stars value={r.stars} size={13} />
                  </div>
                  <p className="text-xs text-[var(--fg-muted)]">{r.txt}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
