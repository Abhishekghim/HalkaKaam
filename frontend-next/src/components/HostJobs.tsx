'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { npr } from '../lib/constants';
import { CATICON, catName } from '../lib/i18n';

export const HostJobs: React.FC = () => {
  const {
    t,
    lang,
    jobs,
    me,
    userById,
    setTab,
    openSheet,
  } = useApp();

  const myPostedJobs = jobs
    .filter((j) => (me ? j.hostId === me.id : false))
    .sort((a, b) => b.createdAt - a.createdAt);

  const getAssignedWorkerName = (j: any) => {
    const b = j.bids.find((x: any) => x.id === j.assignedBidId);
    return userById(b?.workerId)?.name || '—';
  };

  if (!myPostedJobs.length) {
    return (
      <div>
        <div className="shead">
          <h2>{t('nav_myjobs')}</h2>
        </div>
        <div className="empty">
          <div className="big">🗂️</div>
          <b>{t('nav_myjobs')}</b>
          <p>{t('land_need_help_sub')}</p>
          <div style={{ marginTop: '20px' }}>
            <button className="btn btn-primary btn-lg" onClick={() => setTab('post')}>
              ＋ {t('post_title')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="shead">
        <h2>{t('nav_myjobs')}</h2>
      </div>

      {myPostedJobs.map((j) => {
        const off = j.bids.length;
        return (
          <div
            key={j.id}
            className={`jobcard ${j.featured ? 'featured' : ''}`}
            onClick={() => openSheet('inbox', { jobId: j.id })}
          >
            <div className="top">
              <h3>{j.title}</h3>
              <div className="jc-price">
                <div className="amt">{npr(j.price)}</div>
                <div className="per">
                  {j.ptype === 'Hourly' ? t('hourly') : t('flat')}
                </div>
              </div>
            </div>

            <div className="meta">
              <span className="tag cat">
                {CATICON[j.cat] || '📦'} {catName(j.cat, lang)}
              </span>
              <span
                className={`status ${
                  j.status === 'open'
                    ? 'st-open'
                    : j.status === 'assigned'
                    ? 'st-assigned'
                    : 'st-done'
                }`}
              >
                {j.status === 'open'
                  ? t('only_host_sees')
                  : j.status === 'assigned'
                  ? `${t('in_progress')} · ${getAssignedWorkerName(j)}`
                  : `${t('completed')} ✓`}
              </span>
            </div>

            <div className="applied">
              📥 {off} {off === 1 ? t('offers_inbox_one') : t('offers_inbox')} ›
            </div>
          </div>
        );
      })}
    </div>
  );
};

