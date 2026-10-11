'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { FeedFilters, SortPreference } from '../types';
import { MapPin, TrendingUp, TrendingDown, Clock, Check, SlidersHorizontal } from 'lucide-react';

export const FilterSheet: React.FC = () => {
  const { lang, filters, setFilters, closeSheet } = useApp();

  const options: {
    key: SortPreference;
    label: string;
    sub: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      key: 'distance',
      label: lang === 'ne' ? 'डिफल्ट (नजिकको पहिले)' : 'Default (Nearest First)',
      sub: lang === 'ne' ? 'तपाईंको लोकेसनबाट सबैभन्दा नजिक' : 'Closest to your current location',
      icon: MapPin,
    },
    {
      key: 'price_high',
      label: lang === 'ne' ? 'रकम: धेरैबाट थोरै' : 'Price: High to Low',
      sub: lang === 'ne' ? 'सबैभन्दा बढी बजेट भएको काम' : 'Highest paying tasks first',
      icon: TrendingUp,
    },
    {
      key: 'price_low',
      label: lang === 'ne' ? 'रकम: थोरैबाट धेरै' : 'Price: Low to High',
      sub: lang === 'ne' ? 'सानो वा छिटो बजेट काम' : 'Lower budget quick tasks first',
      icon: TrendingDown,
    },
    {
      key: 'newest',
      label: lang === 'ne' ? 'नयाँ पहिले' : 'Newest Posted',
      sub: lang === 'ne' ? 'हालै पोस्ट गरिएका ताजा कामहरू' : 'Recently posted tasks first',
      icon: Clock,
    },
  ];

  const pick = (key: SortPreference) => {
    setFilters((prev: FeedFilters) => ({ ...prev, sortBy: key }));
    closeSheet();
  };

  return (
    <div className="pb-3 text-[var(--fg)]">
      <div className="flex items-center gap-2.5 mb-1.5 pr-10">
        <div className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center flex-none">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--fg)]">
            {lang === 'ne' ? 'कामहरूको क्रम मिलाउनुहोस्' : 'Sort & Filter Tasks'}
          </h2>
          <p className="text-xs text-[var(--fg-muted)]">
            {lang === 'ne' ? 'तपाईंलाई उपयुक्त लाग्ने क्रम छान्नुहोस्' : 'Choose how marketplace tasks are ordered'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 mt-5">
        {options.map((o) => {
          const on = filters.sortBy === o.key;
          const Icon = o.icon;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => pick(o.key)}
              className={`flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                on
                  ? 'border-[var(--primary)] bg-[var(--primary-soft)] shadow-xs ring-1 ring-[var(--primary)]'
                  : 'border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] hover:border-[var(--line-hover)]'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-none transition-colors ${
                  on
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--surface-2)] text-[var(--fg-muted)]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`block text-sm font-bold ${on ? 'text-[var(--primary)] font-extrabold' : 'text-[var(--fg)]'}`}>
                  {o.label}
                </span>
                <span className="block text-xs text-[var(--fg-muted)] mt-0.5">
                  {o.sub}
                </span>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-none transition-colors ${
                  on
                    ? 'bg-[var(--primary)] text-white'
                    : 'border border-[var(--line)] text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
