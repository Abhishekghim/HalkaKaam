'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Job } from '../types';
import { hasUnread, useApp } from '../context/AppContext';
import { avColor, initials, npr, starsHtml } from '../lib/constants';

type OfferSort = 'price' | 'rating' | 'new';

export const InboxSheet: React.FC<{ job: Job }> = ({ job }) => {
  const { t, me, userById, ratingOf, assignWorker, featureJob, cancelJob, openChat, openSheet, markInboxSeen } = useApp();
  const [sort, setSort] = useState<OfferSort>('price');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // remember which offers are "new" at open time, then mark all as seen
  const [newIds] = useState(() => new Set(job.bids.filter((b) => !b.seenByHost).map((b) => b.id)));
  useEffect(() => { markInboxSeen(job.id); }, [job.id, job.bids.length, markInboxSeen]);

  // two-step confirm auto-resets so a stray tap can't assign by accident
  useEffect(() => {
    if (!confirmId) return;
    const timer = setTimeout(() => setConfirmId(null), 3500);
    return () => clearTimeout(timer);
  }, [confirmId]);

  const bids = useMemo(() => {
    const arr = [...job.bids];
    if (sort === 'price') arr.sort((a, b) => a.amount - b.amount);
    if (sort === 'rating') arr.sort((a, b) => ratingOf(b.workerId, 'worker').avg - ratingOf(a.workerId, 'worker').avg);
    if (sort === 'new') arr.sort((a, b) => b.createdAt - a.createdAt);
    // the chosen helper always stays on top
    return arr.sort((a, b) => Number(b.id === job.assignedBidId) - Number(a.id === job.assignedBidId));
  }, [job.bids, job.assignedBidId, sort, ratingOf]);

  const onAssign = (bidId: string) => {
    if (confirmId === bidId) { assignWorker(job.id, bidId); setConfirmId(null); }
    else setConfirmId(bidId);
  };

  return (
    <div>
      <h2>{job.title}</h2>
      <p className="desc">
        📥 {job.bids.length} {job.bids.length === 1 ? t('offers_inbox_one') : t('offers_inbox')} · {t('only_you_see')}
      </p>

      {job.status === 'assigned' && (
        <div style={{ marginBottom: 16 }}>
          <button className="btn btn-green btn-lg" onClick={() => openSheet('workerReview', { jobId: job.id })}>✓ {t('mark_done')}</button>
          <button className="changelink" style={{ width: '100%', color: 'var(--slate)' }} onClick={() => openSheet('report', { jobId: job.id })}>
            ⚠️ {t('report_issue')}
          </button>
        </div>
      )}
      {job.status === 'closed' && <div className="infobox amber"><span className="ic">🔒</span><div>{t('job_closed')}</div></div>}

      {job.status === 'open' && (
        <div className="btnrow" style={{ marginBottom: 16 }}>
          {!job.featured && (
            <button className="btn btn-ghost btn-sm" style={{ flex: 1, borderColor: 'var(--gold)' }} onClick={() => featureJob(job.id)}>★ {t('feature_post')}</button>
          )}
          <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => cancelJob(job.id)}>✕ {t('cancel_job')}</button>
        </div>
      )}

      {job.bids.length > 1 && (
        <div className="sortbar">
          {(['price', 'rating', 'new'] as OfferSort[]).map((k) => (
            <button key={k} className={`sortbtn ${sort === k ? 'on' : ''}`} onClick={() => setSort(k)}>
              {k === 'price' ? t('sort_price_low') : k === 'rating' ? t('sort_rating') : t('sort_new')}
            </button>
          ))}
        </div>
      )}

      {bids.length === 0 ? (
        <div className="empty"><div className="big">⏳</div><b>{t('waiting')}</b><p>{t('only_host_sees')}</p></div>
      ) : (
        bids.map((b) => {
          const w = userById(b.workerId);
          const r = ratingOf(b.workerId, 'worker');
          const chosen = job.assignedBidId === b.id;
          const locked = !!job.assignedBidId && !chosen;
          const unread = me ? hasUnread(b, 'host', me.id) : false;
          const showProfile = () => openSheet('profile', { userId: b.workerId, role: 'worker' });

          return (
            <div key={b.id} className="offer" style={locked ? { opacity: 0.6 } : undefined}>
              <div className="head">
                <div className="av av-md" style={{ background: avColor(w?.name), cursor: 'pointer' }} onClick={showProfile}>{initials(w?.name)}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="nm" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} onClick={showProfile}>
                    {w?.name}
                    {newIds.has(b.id) && <span className="newchip" style={{ marginLeft: 0 }}>{t('new_count')}</span>}
                  </div>
                  <div className="sub">
                    <span className="stars">{starsHtml(r.avg)}</span> {r.avg ? r.avg.toFixed(1) : t('new_helper')} · {r.count} {t('tasks_done')}
                  </div>
                </div>
                <div className="amt">
                  <b>{npr(b.amount)}</b>
                  <span>{t('private_bid')}</span>
                </div>
              </div>

              <div className="pitch">{b.pitch}</div>
              {b.counterAmount && <div className="pending-counter">⏳ {npr(b.counterAmount)} · {t('counter_waiting')}</div>}

              {locked ? (
                <span className="lockchip">🔒 {t('chat_locked')}</span>
              ) : chosen ? (
                <div className="btnrow" style={{ alignItems: 'center' }}>
                  <span className="chosenchip">✓ {t('chosen')}</span>
                  <button className="btn btn-primary" onClick={() => openChat(job.id, b.id, 'host')}>
                    💬 {t('open_chat')} {unread && <span className="dot-unread" />}
                  </button>
                </div>
              ) : job.status === 'open' ? (
                <div className="btnrow">
                  <button className="btn btn-ghost" onClick={() => openChat(job.id, b.id, 'host')}>
                    💬 {b.chat.length ? t('continue_chat') : t('start_chat')} {unread && <span className="dot-unread" />}
                  </button>
                  <button className={`btn btn-primary ${confirmId === b.id ? 'confirming' : ''}`} onClick={() => onAssign(b.id)}>
                    {confirmId === b.id ? t('assign_confirm') : t('choose')}
                  </button>
                </div>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
};
