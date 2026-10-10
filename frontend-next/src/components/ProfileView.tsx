'use client';

import React, { useState } from 'react';
import { User } from '../types';
import { useApp } from '../context/AppContext';
import { avColor, initials, starsHtml } from '../lib/constants';

interface ProfileViewProps {
  user?: User | null;
  role?: 'worker' | 'host';
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, role = 'worker' }) => {
  const {
    t,
    me,
    ratingOf,
    reviewsOf,
    updateUserBio,
    logout,
  } = useApp();

  const targetUser = user || me;
  const isMe = me && targetUser && me.id === targetUser.id;

  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState(targetUser?.bio || '');

  if (!targetUser) return null;

  const rWorker = ratingOf(targetUser.id, 'worker');
  const rHost = ratingOf(targetUser.id, 'host');
  const activeRating = role === 'worker' ? rWorker : rHost;
  const reviews = reviewsOf(targetUser.id, role);

  const handleSaveBio = () => {
    updateUserBio(targetUser.id, bioText);
    setEditingBio(false);
  };

  return (
    <div>
      <div className="personrow" style={{ cursor: 'default' }}>
        <div
          className="av av-lg"
          style={{ background: avColor(targetUser.name) }}
        >
          {initials(targetUser.name)}
        </div>
        <div>
          <div className="nm" style={{ fontSize: 'var(--fs-lg)' }}>
            {targetUser.name}
          </div>
          <div className="rt">
            {targetUser.campus || 'Nepal'} · {t('joined')}{' '}
            {new Date(targetUser.created || Date.now()).toLocaleDateString('en-GB', {
              month: 'short',
              year: 'numeric',
            })}
          </div>
          <div className="rt">
            <span
              className="stars"
              dangerouslySetInnerHTML={{ __html: starsHtml(activeRating.avg) }}
            />{' '}
            {activeRating.avg ? activeRating.avg.toFixed(1) : t('new_helper')}{' '}
            {role === 'worker' ? t('as_worker') : t('as_host')} ({activeRating.count})
          </div>
        </div>
      </div>

      {/* Bio section */}
      {isMe ? (
        <div style={{ marginBottom: '16px' }}>
          {editingBio ? (
            <div>
              <div className="field">
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  placeholder="Share a few words about what you do..."
                />
              </div>
              <div className="btnrow">
                <button className="btn btn-primary" onClick={handleSaveBio}>
                  {t('save')}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setEditingBio(false)}
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {targetUser.bio && (
                <p
                  style={{
                    fontSize: 'var(--fs-md)',
                    color: 'var(--slate)',
                    lineHeight: 1.55,
                    marginBottom: '10px',
                  }}
                >
                  {targetUser.bio}
                </p>
              )}
              <button
                className="btn btn-outline"
                style={{ minHeight: '44px', padding: '8px 16px', fontSize: 'var(--fs-sm)' }}
                onClick={() => setEditingBio(true)}
              >
                ✏️ {t('edit_profile')}
              </button>
            </div>
          )}
        </div>
      ) : (
        targetUser.bio && (
          <p
            style={{
              fontSize: 'var(--fs-md)',
              color: 'var(--slate)',
              lineHeight: 1.55,
              marginBottom: '16px',
            }}
          >
            {targetUser.bio}
          </p>
        )
      )}

      {/* Reviews list */}
      <div className="shead" style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: 'var(--fs-lg)' }}>{t('reviews')}</h2>
      </div>

      {reviews.length > 0 ? (
        reviews.map((rv, i) => (
          <div key={i} className="pubreview">
            <div className="who">
              {rv.from} · <span className="stars">{'★'.repeat(rv.stars)}</span> · {rv.job}
            </div>
            <div className="txt">{rv.txt}</div>
          </div>
        ))
      ) : (
        <div className="pubreview">
          <div className="txt" style={{ color: 'var(--slate)' }}>
            {t('no_reviews')}
            {targetUser.baseCount
              ? ` · ${targetUser.baseRating}★ (${targetUser.baseCount})`
              : ''}
          </div>
        </div>
      )}

      {/* Logout button */}
      {isMe && (
        <div style={{ marginTop: '30px' }}>
          <button className="btn btn-danger" onClick={logout}>
            🚪 {t('log_out')}
          </button>
        </div>
      )}
    </div>
  );
};

