import React from 'react';

export const Wordmark: React.FC<{
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}> = ({ className = '', style, onClick }) => {
  return (
    <div
      className={`wordmark ${className}`}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <span className="h">हल्का</span> <span className="k">काम</span>
    </div>
  );
};

