'use client';

import React from 'react';
import {
  Sparkles,
  Wrench,
  Truck,
  Package,
  GraduationCap,
  Laptop,
  Sprout,
  ShoppingBag,
  Zap,
  HelpCircle,
} from 'lucide-react';

interface CategoryIconTileProps {
  cat: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  urgent?: boolean;
}

export const CategoryIconTile: React.FC<CategoryIconTileProps> = ({
  cat,
  size = 'md',
  className = '',
  urgent = false,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 rounded-md',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-14 h-14 rounded-2xl',
  };

  const iconSizes = {
    sm: 13,
    md: 18,
    lg: 24,
    xl: 28,
  };

  const isize = iconSizes[size];
  const baseBox = `flex items-center justify-center shrink-0 transition-transform ${sizeClasses[size]}`;

  if (urgent) {
    return (
      <div
        className={`${baseBox} bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] shadow-2xs ${className}`}
        title="Urgent Task"
      >
        <Zap size={isize} strokeWidth={2.2} className="shrink-0" />
      </div>
    );
  }

  // Unified brand color code: semantic icon tokens for consistent high contrast in both modes
  const unifiedStyle = `${baseBox} bg-[var(--icon-bg)] text-[var(--icon)] border border-[var(--icon-border)] shadow-2xs ${className}`;

  const renderIcon = () => {
    switch (cat) {
      case 'Home Cleaning':
        return <Sparkles size={isize} strokeWidth={2} className="shrink-0" />;
      case 'Repairs / Handyman':
        return <Wrench size={isize} strokeWidth={2} className="shrink-0" />;
      case 'Moving Help':
        return <Truck size={isize} strokeWidth={2} className="shrink-0" />;
      case 'Pick-up / Delivery':
        return <Package size={isize} strokeWidth={2} className="shrink-0" />;
      case 'Quick Tutoring':
        return <GraduationCap size={isize} strokeWidth={2} className="shrink-0" />;
      case 'Tech Support':
        return <Laptop size={isize} strokeWidth={2} className="shrink-0" />;
      case 'Gardening':
        return <Sprout size={isize} strokeWidth={2} className="shrink-0" />;
      case 'Errands / Other':
        return <ShoppingBag size={isize} strokeWidth={2} className="shrink-0" />;
      default:
        return <HelpCircle size={isize} strokeWidth={2} className="shrink-0" />;
    }
  };

  return <div className={unifiedStyle}>{renderIcon()}</div>;
};
