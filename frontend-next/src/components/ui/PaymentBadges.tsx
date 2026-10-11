'use client';

import React from 'react';
import { Banknote, ShieldCheck } from 'lucide-react';

export type PaymentMethodId = 'esewa' | 'khalti' | 'imepay' | 'cash';

export interface PaymentMethodOption {
  id: PaymentMethodId;
  name: string;
  ne: string;
  brandColor: string;
  iconBg: string;
  iconBorder: string;
  badgeClass: string;
  tag: string;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'esewa',
    name: 'eSewa',
    ne: 'ईसेवा',
    brandColor: '#60BB46',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-400/15',
    iconBorder: 'border-emerald-500/25 dark:border-emerald-400/30',
    badgeClass: 'rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] shadow-2xs hover:border-[var(--primary)]',
    tag: 'eSewa',
  },
  {
    id: 'khalti',
    name: 'Khalti',
    ne: 'खल्ती',
    brandColor: '#8B5CF6',
    iconBg: 'bg-purple-500/10 dark:bg-purple-400/15',
    iconBorder: 'border-purple-500/25 dark:border-purple-400/30',
    badgeClass: 'rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] shadow-2xs hover:border-[var(--primary)]',
    tag: 'Khalti',
  },
  {
    id: 'imepay',
    name: 'IME Pay',
    ne: 'आइएमई पे',
    brandColor: '#EF4444',
    iconBg: 'bg-rose-500/10 dark:bg-rose-400/15',
    iconBorder: 'border-rose-500/25 dark:border-rose-400/30',
    badgeClass: 'rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] shadow-2xs hover:border-[var(--primary)]',
    tag: 'IME Pay',
  },
  {
    id: 'cash',
    name: 'Cash on completion',
    ne: 'काम सकिएपछि नगद',
    brandColor: 'var(--primary)',
    iconBg: 'bg-[var(--primary-soft)]',
    iconBorder: 'border-[var(--primary-border)]',
    badgeClass: 'rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] shadow-2xs hover:border-[var(--primary)]',
    tag: 'Cash',
  },
];

interface PaymentBadgesProps {
  methods?: PaymentMethodId[];
  size?: 'sm' | 'md';
  className?: string;
  lang?: 'en' | 'ne';
}

export const PaymentBadges: React.FC<PaymentBadgesProps> = ({
  methods = ['esewa', 'khalti', 'imepay', 'cash'],
  size = 'sm',
  className = '',
  lang = 'en',
}) => {
  const activeMethods = PAYMENT_METHODS.filter((m) => methods.includes(m.id));
  const isSm = size === 'sm';

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      {activeMethods.map((m) => (
        <span
          key={m.id}
          className={`inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] shadow-2xs hover:border-[var(--primary)] hover:shadow-xs transition-all select-none group ${
            isSm
              ? 'gap-1.5 px-2 py-0.5 text-[10px] font-extrabold'
              : 'gap-2 px-2.5 py-1 text-xs font-extrabold'
          }`}
        >
          {/* Soft tinted rounded-square icon box like CategoryIconTile */}
          <span
            className={`flex items-center justify-center shrink-0 rounded-md border ${m.iconBg} ${m.iconBorder} ${
              isSm ? 'w-4 h-4' : 'w-5 h-5'
            }`}
          >
            {m.id === 'cash' ? (
              <Banknote className={`${isSm ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} text-[var(--primary)]`} />
            ) : (
              <span
                className={`${isSm ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full ring-1 ring-black/10 dark:ring-white/10`}
                style={{ backgroundColor: m.brandColor }}
              />
            )}
          </span>
          <span className="group-hover:text-[var(--primary)] transition-colors">
            {lang === 'ne' ? m.ne : m.tag}
          </span>
        </span>
      ))}
    </div>
  );
};

export const PaymentTrustStrip: React.FC<{ lang?: 'en' | 'ne'; className?: string }> = ({
  lang = 'en',
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs ${className}`}>
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary-border)] flex items-center justify-center flex-none">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-extrabold text-[var(--fg)]">
            {lang === 'ne' ? 'सुरक्षित तथा लचिलो भुक्तानी' : 'Safe & Direct Payment Options'}
          </p>
          <p className="text-[11px] text-[var(--fg-muted)]">
            {lang === 'ne' ? 'काम पूरा भएपछि मात्र भुक्तानी गर्नुहोस्' : 'Pay worker directly upon 100% job satisfaction'}
          </p>
        </div>
      </div>

      <PaymentBadges size="md" lang={lang} />
    </div>
  );
};

