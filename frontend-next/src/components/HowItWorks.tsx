'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { FileEdit, Users, CheckCircle2, Shield } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const { lang, t } = useApp();

  const steps = [
    {
      num: '01',
      icon: <FileEdit className="w-6 h-6 text-[var(--primary)]" />,
      title: lang === 'ne' ? '१. काम पोस्ट गर्नुहोस्' : '1. Post what you need',
      desc:
        lang === 'ne'
          ? 'तपाईंलाई के सहयोग चाहिएको हो लेख्नुहोस्, स्थान र आफ्नो उचित बजेट तोक्नुहोस्।'
          : 'Tell us what task needs doing, when, and what fair NPR budget you have in mind.',
      tint: 'bg-[var(--primary-soft)] border-[var(--primary-border)]',
    },
    {
      num: '02',
      icon: <Users className="w-6 h-6 text-[var(--accent)]" />,
      title: lang === 'ne' ? '२. सहयोगी छान्नुहोस्' : '2. Choose your helper',
      desc:
        lang === 'ne'
          ? 'नजिकैका विद्यार्थी तथा सहयोगीका प्रस्तावहरू, नागरिकता प्रमाणीकरण र रेटिङ हेरेर छान्नुहोस्।'
          : 'Compare local pitches, check KYC government ID verification badges, and customer ratings.',
      tint: 'bg-[var(--accent-soft)] border-[var(--accent)]/20',
    },
    {
      num: '03',
      icon: <CheckCircle2 className="w-6 h-6 text-[var(--success)]" />,
      title: lang === 'ne' ? '३. ढुक्क भएर भुक्तानी गर्नुहोस्' : '3. Pay upon completion',
      desc:
        lang === 'ne'
          ? 'काम पूरा भएपछि eSewa, Khalti, IME Pay वा नगदबाट सुरक्षित रूपमा भुक्तानी गर्नुहोस्।'
          : 'Once the task is finished to your complete satisfaction, pay via digital wallet or cash.',
      tint: 'bg-[var(--success-soft)] border-[var(--success)]/20',
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-[var(--surface-2)]/60 border-b border-[var(--line)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>{lang === 'ne' ? 'सरल तथा भरपर्दो प्रक्रिया' : 'Simple & Trustworthy'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--fg)] tracking-tight">
            {lang === 'ne' ? 'यसले कसरी काम गर्छ? (३ सरल चरण)' : 'How Halka Kaam Works in 3 Simple Steps'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[var(--fg-muted)]">
            {lang === 'ne'
              ? 'झन्झटमुक्त सेवा — कुनै अग्रिम शुल्क छैन, काम सकिएपछि मात्र सिधै भुक्तानी।'
              : 'Zero upfront platform fees. Hire directly, communicate freely, pay when done.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="relative rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xs card-lift"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${s.tint}`}>
                  {s.icon}
                </div>
                <span className="text-2xl font-black font-mukta text-[var(--fg-subtle)]/40">
                  {s.num}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-[var(--fg)] mb-2">
                {s.title}
              </h3>
              <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

