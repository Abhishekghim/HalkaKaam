'use client';

import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Job } from '../types';
import { avColor, haversineKm, initials, npr, starsHtml } from '../lib/constants';
import { CATICON, catName } from '../lib/i18n';
import { addTiles, LeafletMap, loadLeaflet, pinIcon } from '../lib/leaflet';

export const JobDetail: React.FC<{ job: Job }> = ({ job }) => {
  const { t, lang, me, pos, userById, ratingOf, openSheet, openChat, withdrawOffer } = useApp();
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (job.type !== 'In-person') return;
    let alive = true;
    (async () => {
      const L = await loadLeaflet();
      if (!alive || !mapEl.current) return;
      const map = L.map(mapEl.current, { zoomControl: false, attributionControl: false, dragging: true }).setView([job.lat, job.lng], 14);
      addTiles(L, map);
      L.marker([job.lat, job.lng], { icon: pinIcon(L) }).addTo(map);
      mapRef.current = map;
      setTimeout(() => mapRef.current?.invalidateSize(), 250);
    })();
    return () => {
      alive = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [job.id, job.type, job.lat, job.lng]);

  const host = userById(job.hostId);
  const hr = ratingOf(job.hostId, 'host');
  const dist = job.type === 'Virtual' ? null : haversineKm(pos, job);
  const myBid = me ? job.bids.find((b) => b.workerId === me.id) : undefined;
  const isMine = me?.id === job.hostId;

  return (
    <div>
      <h2>{job.title}</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '12px 0 14px' }}>
        <div className="price" style={{ fontSize: 'var(--fs-2xl)' }}>{npr(job.price)}</div>
        <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--slate)' }}>
          {job.ptype === 'Hourly' ? t('hourly') : t('flat')}
          {job.ptype === 'Flat' && job.hours ? ` · ≈ ${npr(Math.round(job.price / job.hours))}${t('per_hr')}` : ''}
        </span>
      </div>

      <div className="meta" style={{ marginBottom: 14 }}>
        {job.urgent && <span className="tag urgent">🔥 {t('urgent')}</span>}
        <span className="tag cat">{CATICON[job.cat] || '📦'} {catName(job.cat, lang)}</span>
        <span className="tag dist">{dist === null ? '🌐 ' + t('virtual') : `📍 ${dist.toFixed(1)} km`}</span>
        <span className="tag">🗓 {job.when}</span>
      </div>

      {(job.photos.length > 0 || job.emoji.length > 0) && (
        <div className="pstrip">
          {job.photos.map((p, i) => <img key={i} src={p} alt="" />)}
          {job.photos.length === 0 && job.emoji.map((e, i) => <div key={i} className="emo">{e}</div>)}
        </div>
      )}

      <p className="desc" style={{ whiteSpace: 'pre-line' }}>{job.desc}</p>

      {job.type === 'In-person' && (
        <div style={{ marginBottom: 16 }}>
          <div ref={mapEl} className="map" style={{ height: 180 }} />
          {job.address && <div className="maphint" style={{ textAlign: 'left' }}>📍 {job.address}</div>}
        </div>
      )}

      <div className="personrow" style={{ cursor: 'pointer' }} onClick={() => openSheet('profile', { userId: job.hostId, role: 'host' })}>
        <div className="av av-md" style={{ background: avColor(host?.name) }}>{initials(host?.name)}</div>
        <div>
          <div className="nm">{host?.name || t('poster')}</div>
          <div className="rt">
            <span className="stars">{starsHtml(hr.avg)}</span> {hr.avg ? hr.avg.toFixed(1) : t('new_helper')} ({hr.count} {t('reviews')})
          </div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 'var(--fs-xs)', color: 'var(--accent)', fontWeight: 700 }}>{t('tap_profile')} ›</div>
      </div>

      {isMine ? null : myBid ? (
        <>
          <div className="infobox green"><span className="ic">✓</span><div>{t('you_offered')} · <b>{npr(myBid.amount)}</b></div></div>
          <div className="btnrow">
            {myBid.chat.length > 0 && (
              <button className="btn btn-primary" onClick={() => openChat(job.id, myBid.id, 'worker')}>💬 {t('open_chat')}</button>
            )}
            {job.status === 'open' && (
              <button className="btn btn-danger" onClick={() => withdrawOffer(job.id)}>{t('withdraw')}</button>
            )}
          </div>
        </>
      ) : job.status === 'open' ? (
        <>
          <div className="infobox blue"><span className="ic">🔒</span><div>{t('cannot_msg_first')}</div></div>
          <button className="btn btn-primary btn-lg" onClick={() => openSheet('offerForm', { jobId: job.id })}>🤝 {t('make_offer')}</button>
        </>
      ) : null}
    </div>
  );
};

