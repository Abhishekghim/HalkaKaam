'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { CategoryIconTile } from './ui/CategoryIconTile';
import { CATS, catName } from '../lib/i18n';
import { ChevronRight } from 'lucide-react';

interface CategoryGridProps {
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string;
  className?: string;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
  selectedCategory,
  className = '',
}) => {
  const { lang, jobs } = useApp();

  const getJobCount = (category: string) => {
    return jobs.filter((j) => j.cat === category && j.status === 'open').length;
  };

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 ${className}`}>
      {CATS.map((cat) => {
        const isSelected = selectedCategory === cat;
        const count = getJobCount(cat);

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory && onSelectCategory(cat)}
            className={`group text-left p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer card-lift ${
              isSelected
                ? 'bg-[var(--primary-soft)] border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-xs'
                : 'bg-[var(--surface)] border-[var(--line)] hover:border-[var(--primary)]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <CategoryIconTile cat={cat} size="md" />
              <ChevronRight className="w-4 h-4 text-[var(--fg-subtle)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
              {catName(cat, lang)}
            </h3>
            <p className="text-[11px] text-[var(--fg-muted)] mt-0.5">
              {count > 0 ? (
                <span>
                  {count} {lang === 'ne' ? 'खुला काम' : `${count === 1 ? 'open task' : 'open tasks'}`}
                </span>
              ) : (
                <span>{lang === 'ne' ? 'काम पोस्ट गर्नुहोस्' : 'Post task'}</span>
              )}
            </p>
          </button>
        );
      })}
    </div>
  );
};

