'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Pennants } from './Pennants';
import { Wordmark } from './Wordmark';
import { ThemeToggle } from './ui/ThemeToggle';
import {
  Smartphone,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  User,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';

export const ScreenAuth: React.FC = () => {
  const {
    t,
    lang,
    authStep,
    setAuthStep,
    authPhone,
    authName,
    authArea,
    sendOtp,
    verifyOtp,
    loginAsTestAccount,
    setView,
    toggleLang,
    showToast,
  } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [identifier, setIdentifier] = useState(authPhone || '');
  const [fullName, setFullName] = useState(authName || '');
  const [area, setArea] = useState(authArea || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        const trimmedName = fullName.trim();
        const trimmedPhone = identifier.trim().replace(/\D/g, '');

        if (trimmedName.length < 2) {
          setError(lang === 'ne' ? 'कृपया पूरा नाम लेख्नुहोस्।' : 'Please enter your full name.');
          setSubmitting(false);
          return;
        }

        if (trimmedPhone.length < 8) {
          setError(lang === 'ne' ? 'कृपया मान्य मोबाइल नम्बर प्रविष्ट गर्नुहोस्।' : 'Please enter a valid mobile number.');
          setSubmitting(false);
          return;
        }

        const ok = sendOtp(trimmedName, trimmedPhone, area.trim());
        if (!ok) {
          setError(lang === 'ne' ? 'मोबाइल नम्बर वा विवरण अमान्य छ।' : 'Invalid mobile number or details.');
        }
      } else {
        const trimmedId = identifier.trim();
        if (!trimmedId) {
          setError(lang === 'ne' ? 'मोबाइल नम्बर आवश्यक छ।' : 'Mobile number is required.');
          setSubmitting(false);
          return;
        }

        const cleanPhone = trimmedId.replace(/\D/g, '');
        const ok = sendOtp(fullName || 'User', cleanPhone || trimmedId, area);
        if (!ok) {
          setError(lang === 'ne' ? 'मोबाइल नम्बर ९८XXXXXXXX हुनुपर्छ।' : 'Mobile must start with 98/97 (10 digits).');
          setSubmitting(false);
          return;
        }

        if (password.trim().length > 0) {
          verifyOtp('123456');
          return;
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!otp.trim()) {
      setError(lang === 'ne' ? 'कृपया कोड प्रविष्ट गर्नुहोस्।' : 'Please enter the verification code.');
      setSubmitting(false);
      return;
    }

    const ok = verifyOtp(otp.trim());
    if (!ok) {
      setError(lang === 'ne' ? 'कोड मिलेन। कृपया डेमो कोड १२३४५६ प्रयोग गर्नुहोस्।' : 'Invalid code. Please use demo code 123456.');
      setSubmitting(false);
    }
  };

  // STEP 2: OTP Verification Screen
  if (authStep === 2) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-8 text-[var(--fg)]">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Top Actions */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setAuthStep(1)}
              className="text-xs font-bold text-[var(--fg-muted)] hover:text-[var(--fg)] flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('back')}</span>
            </button>
            <ThemeToggle />
          </div>

          <div className="bg-[var(--surface)] rounded-3xl border border-[var(--line)] p-6 sm:p-7 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-[var(--fg)]">
                {t('enter_code')}
              </h2>
              <p className="mt-1.5 text-xs text-[var(--fg-muted)]">
                {t('code_sent_to')}{' '}
                <span className="font-bold text-[var(--fg)]">+977 {authPhone}</span>
              </p>
            </div>

            {/* Demo Notice */}
            <div className="mb-5 rounded-2xl bg-[var(--primary-soft)] border border-[var(--primary-border)] p-3 text-xs text-[var(--primary)] flex items-center justify-between gap-2 font-medium">
              <span>
                {lang === 'ne' ? 'डेमो कोड: ' : 'Demo code: '}
                <b className="font-mono font-bold">123456</b>
              </span>
              <button
                type="button"
                onClick={() => setOtp('123456')}
                className="text-xs font-bold underline cursor-pointer text-[var(--primary)] hover:opacity-80"
              >
                {lang === 'ne' ? 'भरिदिनुहोस्' : 'Auto-fill'}
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleVerify}>
              <div>
                <label htmlFor="otp" className="mb-1 block text-xs font-bold text-[var(--fg)] uppercase tracking-wider">
                  {lang === 'ne' ? '६-अङ्कको कोड (OTP)' : '6-digit OTP code'}
                </label>
                <input
                  id="otp"
                  type="text"
                  required
                  maxLength={6}
                  inputMode="numeric"
                  autoFocus
                  placeholder="123456"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-center font-mono text-xl font-bold tracking-widest text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              {error && (
                <p role="alert" className="rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/30 p-3 text-xs font-semibold text-[var(--accent-text)]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white text-sm font-black shadow-cta transition-all cursor-pointer disabled:opacity-60"
              >
                <span>{submitting ? 'Verifying…' : (lang === 'ne' ? 'प्रमाणित गर्नुहोस्' : 'Verify & Continue')}</span>
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-[var(--line)] flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setAuthStep(1)}
                className="text-[var(--fg-muted)] hover:text-[var(--fg)] font-semibold cursor-pointer"
              >
                ← {lang === 'ne' ? 'नम्बर बदल्नुहोस्' : 'Change number'}
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(lang === 'ne' ? 'नयाँ कोड पठाइयो: १२३४५६' : 'New code sent: 123456');
                }}
                className="text-[var(--primary)] hover:underline font-bold cursor-pointer"
              >
                {lang === 'ne' ? 'पुनः कोड पठाउनुहोस्' : 'Resend code'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 1: Main Login & Signup Card
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-8 text-[var(--fg)]">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 mb-1">
            <Pennants />
            <Wordmark className="text-2xl" />
          </div>
          <p className="text-xs font-bold text-[var(--fg-muted)]">
            {lang === 'ne' ? 'नेपालको पियर-टु-पियर गिग प्लेटफर्म' : 'Hyperlocal Nepal Gig Marketplace'}
          </p>
        </div>

        <div className="bg-[var(--surface)] rounded-3xl border border-[var(--line)] p-6 sm:p-7 shadow-sm">
          {/* Top Row: Language and Theme Switch */}
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={toggleLang}
              className="text-xs font-bold text-[var(--primary)] hover:underline cursor-pointer"
            >
              {lang === 'en' ? 'नेपालीमा हेर्नुहोस्' : 'Switch to English'}
            </button>
            <ThemeToggle />
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mb-5 flex rounded-xl bg-[var(--surface-2)] p-1 border border-[var(--line)]">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[var(--surface)] text-[var(--fg)] shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              {lang === 'ne' ? 'साइन इन (Sign in)' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[var(--surface)] text-[var(--fg)] shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              {lang === 'ne' ? 'नयाँ खाता (Register)' : 'New Account'}
            </button>
          </div>

          {/* Quick 1-Click Demo Login Banner */}
          <div className="mb-5 rounded-2xl bg-[var(--primary-soft)] border border-[var(--primary-border)] p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider block">
                  Quick Demo Access
                </span>
                <span className="text-xs font-black text-[var(--fg)] truncate block">
                  Kiran Bista (KYC Verified Tasker)
                </span>
              </div>
              <button
                type="button"
                onClick={loginAsTestAccount}
                className="px-3 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-extrabold shadow-xs transition-all whitespace-nowrap flex items-center gap-1 flex-none cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Login</span>
              </button>
            </div>
          </div>

          {/* Main Phone / Credentials Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div>
                <label htmlFor="fullname" className="mb-1 block text-xs font-bold text-[var(--fg)] uppercase tracking-wider">
                  {lang === 'ne' ? 'पूरा नाम' : 'Full name'}
                </label>
                <input
                  id="fullname"
                  type="text"
                  required
                  placeholder={lang === 'ne' ? 'उदा. सुनिता गुरुङ' : 'e.g. Sunita Gurung'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-sm font-semibold text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label htmlFor="identifier" className="mb-1 block text-xs font-bold text-[var(--fg)] uppercase tracking-wider">
                {lang === 'ne' ? 'मोबाइल नम्बर (+977)' : 'Nepal Mobile Number (+977)'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--fg-muted)]">
                  🇳🇵 +977
                </span>
                <input
                  id="identifier"
                  type="tel"
                  required
                  placeholder="98XXXXXXXX"
                  maxLength={10}
                  className="w-full pl-20 pr-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-sm font-semibold text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="area" className="mb-1 block text-xs font-bold text-[var(--fg)] uppercase tracking-wider">
                  {lang === 'ne' ? 'स्थान / टोल' : 'Your area in Nepal'}
                </label>
                <input
                  id="area"
                  type="text"
                  placeholder={lang === 'ne' ? 'उदा. कीर्तिपुर, बानेश्वर, पोखरा' : 'e.g. Kirtipur, Pokhara'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-sm font-semibold text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>
            )}

            {mode === 'signin' && (
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-bold text-[var(--fg)] uppercase tracking-wider">
                    {lang === 'ne' ? 'पासवर्ड (वा सिधै OTP)' : 'Password (or enter via OTP)'}
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-sm font-semibold text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p role="alert" className="rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/30 px-3 py-2 text-xs font-semibold text-[var(--accent-text)]">
                {error}
              </p>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white text-sm font-black shadow-cta transition-all cursor-pointer disabled:opacity-60"
            >
              <span>
                {submitting
                  ? 'Sending OTP…'
                  : mode === 'signin'
                  ? (password ? (lang === 'ne' ? 'साइन इन गर्नुहोस्' : 'Sign In') : (lang === 'ne' ? 'OTP प्राप्त गरी अघि बढ्नुहोस्' : 'Continue with Phone OTP'))
                  : (lang === 'ne' ? 'OTP पठाउनुहोस्' : 'Send Verification OTP')}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Bottom Switcher */}
          <p className="mt-5 text-center text-xs text-[var(--fg-muted)]">
            {mode === 'signin' ? (
              <>
                {lang === 'ne' ? 'नयाँ हुनुहुन्छ? ' : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); }}
                  className="font-bold text-[var(--primary)] hover:underline cursor-pointer"
                >
                  {lang === 'ne' ? 'खाता खोल्नुहोस्' : 'Create an account'}
                </button>
              </>
            ) : (
              <>
                {lang === 'ne' ? 'पहिले नै खाता छ? ' : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); }}
                  className="font-bold text-[var(--primary)] hover:underline cursor-pointer"
                >
                  {lang === 'ne' ? 'साइन इन गर्नुहोस्' : 'Sign in'}
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
