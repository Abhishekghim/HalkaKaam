'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { npr } from '../lib/constants';
import { CATICON, catName } from '../lib/i18n';

export const WorkerOffers: React.FC = () => {
  const {
    t,
    lang,
    jobs,
    me,
    openChat,
    openSheet,
    setTab,
  } = useApp();

  const myBidsJobs = jobs.filter((j) =>
    me ? j.bids.some((b) => b.workerId === me.id) : false
  );

  if (!myBidsJobs.length) {
    return (
      <div>
        <div className="shead">
          <h2>{t('my_offers')}</h2>
        </div>
        <div className="empty">
          <div className="big">🤝</div>
          <b>{t('my_offers')}</b>
          <p>{t('land_want_work_sub')}</p>
          <div style={{ marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={() => setTab('feed')}>
              {t('nav_find')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="shead">
        <h2>{t('my_offers')}</h2>
      </div>

      {myBidsJobs.map((j) => {
        const myBid = j.bids.find((b) => b.workerId === me?.id);
        if (!myBid) return null;

        const isAssigned = j.assignedBidId === myBid.id;
        const isDone = j.status === 'done';
        const hasChat = myBid.chat && myBid.chat.length > 0;
        const otherAssigned = j.assignedBidId && !isAssigned;

        return (
          <div key={j.id} className="card" style={{ marginBottom: '14px' }}>
            <div className="top" style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <h3 style={{ fontSize: 'var(--fs-lg)', fontWeight: 700 }}>{j.title}</h3>
              <div className="jc-price" style={{ textAlign: 'right' }}>
                <div className="amt" style={{ color: 'var(--green)', fontWeight: 800 }}>
                  {npr(myBid.amount)}
                </div>
                <div className="per" style={{ fontSize: 'var(--fs-xs)', color: 'var(--slate)' }}>
                  {t('your_offer')}
                </div>
              </div>
            </div>

            <div className="meta" style={{ marginTop: '10px' }}>
              <span className="tag cat">
                {CATICON[j.cat] || '📦'} {catName(j.cat, lang)}
              </span>
              <span
                className={`status ${
                  isDone
                    ? 'st-done'
                    : isAssigned
                    ? 'st-assigned'
                    : otherAssigned
                    ? 'st-assigned'
                    : 'st-open'
                }`}
              >
                {isDone
                  ? t('completed') + ' ✓'
                  : isAssigned
                  ? t('you_assigned')
                  : otherAssigned
                  ? t('not_chosen')
                  : t('waiting')}
              </span>
            </div>

            <div
              style={{
                background: 'var(--bg-soft)',
                padding: '12px 14px',
                borderRadius: '12px',
                margin: '12px 0',
                fontSize: 'var(--fs-sm)',
                lineHeight: 1.5,
              }}
            >
              <b>{t('your_pitch')}:</b> {myBid.pitch}
            </div>

            {/* Chat or Review Actions */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {isDone && !j.reviews.workerToHost && (
                <button
                  className="btn btn-outline"
                  style={{ minHeight: '44px', padding: '8px 14px', fontSize: 'var(--fs-sm)' }}
                  onClick={() => openSheet('hostReview', { jobId: j.id })}
                >
                  ⭐ {t('review_host')}
                </button>
              )}

              {(isAssigned || hasChat) && (
                <button
                  className="btn btn-primary"
                  style={{ minHeight: '44px', padding: '8px 14px', fontSize: 'var(--fs-sm)' }}
                  onClick={() => openChat(j.id, myBid.id, 'worker')}
                >
                  💬 {t('open_chat')}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

