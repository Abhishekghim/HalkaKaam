'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { JobDetail } from './JobDetail';
import { OfferForm } from './OfferForm';
import { InboxSheet } from './InboxSheet';
import { ReviewModal } from './ReviewModal';
import { ProfileView } from './ProfileView';
import { FilterSheet } from './FilterSheet';
import { KycModal } from './KycModal';
import { X } from 'lucide-react';

export const SheetModal: React.FC = () => {
  const { sheet, closeSheet, jobById, userById } = useApp();

  if (!sheet) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeSheet();
    }
  };

  const job = sheet.jobId ? jobById(sheet.jobId) : undefined;
  const user = sheet.userId ? userById(sheet.userId) : undefined;

  const renderContent = () => {
    switch (sheet.type) {
      case 'filters':
        return <FilterSheet />;

      case 'jobDetail':
        return job ? <JobDetail job={job} /> : null;

      case 'offerForm':
        return job ? <OfferForm job={job} /> : null;

      case 'inbox':
        return job ? <InboxSheet job={job} /> : null;

      case 'workerReview':
        return job ? <ReviewModal type="workerReview" job={job} /> : null;

      case 'hostReview':
        return job ? <ReviewModal type="hostReview" job={job} /> : null;

      case 'report':
        return job ? <ReviewModal type="report" job={job} /> : null;

      case 'profile':
        return <ProfileView user={user} role={sheet.role} />;

      case 'kyc':
        return <KycModal jobId={sheet.jobId} />;

      default:
        return null;
    }
  };

  return (
    <div className="sheet-wrap open" onClick={handleBackdropClick}>
      <div className="sheet relative" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={closeSheet}
          aria-label="Close modal"
          className="absolute right-4 top-3.5 w-8 h-8 rounded-full bg-[var(--surface-2)] hover:bg-[var(--line)] text-[var(--fg-muted)] hover:text-[var(--fg)] border border-[var(--line)] flex items-center justify-center transition-colors text-xs font-bold z-20 cursor-pointer shadow-2xs"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="grab" />
        <div className="inner">{renderContent()}</div>
      </div>
    </div>
  );
};
