import React from 'react';

export const Pennants: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style,
}) => {
  return (
    <img
      src="/icons/logo.png"
      alt="Sajha Kaam Logo"
      className={`w-8 h-8 rounded-lg object-contain bg-white shrink-0 select-none ${className}`}
      style={style}
    />
  );
};
