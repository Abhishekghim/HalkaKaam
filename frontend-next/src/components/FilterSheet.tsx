'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { FeedFilters, SortPreference } from '../types';

export const FilterSheet: React.FC = () => {
  const { lang, filters, setFilters, closeSheet } = useApp();

  const options: { key: SortPreference; label: string; sub: string; icon: string }[] = [
    {
      key: 'distance',
      label: lang === 'ne' ? 'डिफल्ट' : 'Default',
      sub: lang === 'ne' ? 'नजिकको पहिले' : 'Nearest to you first',
      icon: '📍',
    },
    {
      key: 'price_high',
      label: lang === 'ne' ? 'रकम: धेरैबाट थोरै' : 'Price: High to Low',
      sub: lang === 'ne' ? 'सबैभन्दा बढी तलब पहिले' : 'Best paying first',
      icon: '📉',
    },
    {
      key: 'price_low',
      label: lang === 'ne' ? 'रकम: थोरैबाट धेरै' : 'Price: Low to High',
      sub: lang === 'ne' ? 'सबैभन्दा कम तलब पहिले' : 'Lowest paying first',
      icon: '📈',
    },
    {
      key: 'newest',
      label: lang === 'ne' ? 'नयाँ पहिले' : 'Newest',
      sub: lang === 'ne' ? 'हालै पोस्ट गरिएका' : 'Recently posted first',
      icon: '⏱️',
    },
  ];

  const pick = (key: SortPreference) => {
    setFilters((prev: FeedFilters) => ({ ...prev, sortBy: key }));
    closeSheet();
  };

  return (
    <div className="pb-2 text-slate-900">
      <h2 className="text-xl font-extrabold tracking-tight pr-10">
        {lang === 'ne' ? 'क्रम मिलाउनुहोस्' : 'Sort by'}
      </h2>
      <p className="text-xs text-slate-500 mt-0.5 mb-4">
        {lang === 'ne' ? 'कामहरू कसरी देखाउने छान्नुहोस्' : 'Choose how tasks are listed'}
      </p>

      <div className="flex flex-col gap-2">
        {options.map((o) => {
          const on = filters.sortBy === o.key;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => pick(o.key)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                on
                  ? 'border-2 border-blue-600 bg-blue-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <span className="text-xl w-7 text-center flex-none">{o.icon}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold">{o.label}</span>
                <span className="block text-xs text-slate-500">{o.sub}</span>
              </span>
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] flex-none ${
                  on ? 'bg-blue-600 text-white' : 'border border-slate-300'
                }`}
              >
                {on ? '✓' : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
