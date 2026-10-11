'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[var(--fg)] text-[var(--bg)] font-bold text-xs sm:text-sm shadow-xl backdrop-blur-md border border-[var(--line)]/20 animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <CheckCircle2 className="w-4 h-4 text-[var(--success)] flex-none" />
      <span>{toast}</span>
    </div>
  );
};
