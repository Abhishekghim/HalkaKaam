'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme, t, lang } = useApp();
  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        onClick={toggleTheme}
        aria-label={isDark ? t('light_mode') : t('dark_mode')}
        title={isDark ? t('light_mode') : t('dark_mode')}
        className={`group relative inline-flex h-8 w-15 flex-none items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 select-none ${
          isDark
            ? 'bg-[var(--surface-elevated)] border border-[var(--border)] shadow-inner'
            : 'bg-[var(--surface-2)] border border-[var(--line)] shadow-inner'
        }`}
      >
        {/* Track Ambient Icons */}
        <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] pointer-events-none">
          <Sun
            className={`w-3.5 h-3.5 transition-opacity duration-300 ${
              isDark ? 'text-amber-500/40 opacity-40' : 'opacity-0'
            }`}
          />
          <Moon
            className={`w-3.5 h-3.5 transition-opacity duration-300 ${
              isDark ? 'opacity-0' : 'text-slate-400/60 opacity-60'
            }`}
          />
        </div>

        {/* Smooth Animated Sliding Thumb */}
        <div
          className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isDark
              ? 'translate-x-7 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-900/50'
              : 'translate-x-0 bg-gradient-to-tr from-amber-400 to-amber-300 text-white shadow-md shadow-amber-500/40'
          }`}
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5 fill-white text-white drop-shadow-2xs transition-transform duration-300 rotate-0" />
          ) : (
            <Sun className="w-3.5 h-3.5 fill-white text-white drop-shadow-2xs transition-transform duration-300 rotate-0" />
          )}
        </div>
      </button>

      {showLabel && (
        <span className="text-xs font-bold text-[var(--fg)] select-none">
          {isDark
            ? lang === 'ne'
              ? 'डार्क मोड'
              : 'Dark Mode'
            : lang === 'ne'
            ? 'लाइट मोड'
            : 'Light Mode'}
        </span>
      )}
    </div>
  );
};
