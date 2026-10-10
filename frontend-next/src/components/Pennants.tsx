import React from 'react';

export const Pennants: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style,
}) => {
  return (
    <div className={`pennants ${className}`} style={style}>
      <i></i>
      <i></i>
    </div>
  );
};

