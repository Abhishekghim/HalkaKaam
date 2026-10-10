'use client';

import React, { useState } from 'react';
import { Job } from '../types';
import { useApp } from '../context/AppContext';

interface ReviewModalProps {
  type: 'workerReview' | 'hostReview' | 'report';
  job: Job;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ type, job }) => {
  const {
    t,
    userById,
    submitWorkerReview,
    submitHostReview,
    showToast,
    closeSheet,
  } = useApp();

  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);
  const [comment, setComment] = useState('');

  const assignedBid = job.bids.find((x) => x.id === job.assignedBidId);
  const worker = userById(assignedBid?.workerId || '');
  const host = userById(job.hostId);

  const handleWorkerReviewSubmit = () => {
    if (!a || !b || !c) {
      showToast(t('rate_all'));
      return;
    }
    submitWorkerReview(job.id, a, b, c, comment);
  };

  const handleHostReviewSubmit = () => {
    if (!a || !b || !c) {
      showToast(t('rate_all'));
      return;
    }
    submitHostReview(job.id, a, b, c, comment);
  };

  const handleReportSubmit = () => {
    showToast('🙏 Report received');
    closeSheet();
  };

  const renderStarPicker = (val: number, setVal: (n: number) => void) => {
    return (
      <div className="starpick">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={n <= val ? 'on' : ''}
            onClick={() => setVal(n)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (type === 'report') {
    return (
      <div>
        <h2>{t('report_issue')}</h2>
        <p className="desc">{t('both_ways')}</p>
        <div className="field">
          <textarea
            placeholder={t('comment_ph')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-lg" onClick={handleReportSubmit}>
          {t('send')}
        </button>
      </div>
    );
  }

  if (type === 'workerReview') {
    return (
      <div>
        <h2>
          {t('review_worker')}: {worker?.name || 'Helper'}
        </h2>
        <p className="desc">{t('both_ways')}</p>

        <div className="raterow">
          <div className="lbl">{t('rate_punctual')}</div>
          {renderStarPicker(a, setA)}
        </div>

        <div className="raterow">
          <div className="lbl">{t('rate_quality')}</div>
          {renderStarPicker(b, setB)}
        </div>

        <div className="raterow">
          <div className="lbl">{t('rate_attitude')}</div>
          {renderStarPicker(c, setC)}
        </div>

        <div className="field">
          <label>{t('public_comment')}</label>
          <textarea
            placeholder={t('comment_ph')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={handleWorkerReviewSubmit}
        >
          {t('mark_done')}
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>
        {t('review_host')}: {host?.name || 'Poster'}
      </h2>
      <p className="desc">{t('both_ways')}</p>

      <div className="raterow">
        <div className="lbl">{t('rate_payment')}</div>
        {renderStarPicker(a, setA)}
      </div>

      <div className="raterow">
        <div className="lbl">{t('rate_comm')}</div>
        {renderStarPicker(b, setB)}
      </div>

      <div className="raterow">
        <div className="lbl">{t('rate_safety')}</div>
        {renderStarPicker(c, setC)}
      </div>

      <div className="field">
        <label>{t('public_comment')}</label>
        <textarea
          placeholder={t('comment_ph')}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <button
        className="btn btn-primary btn-lg"
        onClick={handleHostReviewSubmit}
      >
        {t('publish_review')}
      </button>
    </div>
  );
};

