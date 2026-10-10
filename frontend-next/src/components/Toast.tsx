'use client';

import React from 'react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();
  if (!toast) return null;

  return <div className="toast">{toast}</div>;
};

