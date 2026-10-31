'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Job } from '../types';
import { avColor, haversineKm, initials, npr, starsHtml } from '../lib/constants';
import { catName, trText, toNepaliNum } from '../lib/i18n';
import { sharedMapManager, MAPBOX_TOKEN } from '../lib/mapbox';
import { CategoryIconTile } from './ui/CategoryIconTile';
import { UrgentBadge, FeaturedBadge, VerifiedBadge, JobStatusBadge } from './ui/StatusBadge';
import { PaymentBadges } from './ui/PaymentBadges';
import {
  MapPin,
  Globe,
  Calendar,
  ShieldCheck,
  CheckCircle,
  Phone,
  MessageCircle,
  MessageSquare,
  Lock,
  ChevronRight,
  Send,
  AlertCircle,
} from 'lucide-react';

function getGeneralArea(address?: string): string {
  if (!address) return 'Approximate area';
  const parts = address.split(',').map((p) => p.trim());
  return parts[parts.length - 1] || parts[0];
}

export const JobDetail: React.FC<{ job: Job }> = ({ job }) => {
  const { t, lang, me, pos, userById, ratingOf, openSheet, openChat, withdrawOffer, showToast } = useApp();
  const mapEl = useRef<HTMLDivElement>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const approxOffset = React.useMemo(() => {
    const baseLat = typeof job.lat === 'number' && !Number.isNaN(job.lat) ? job.lat : 27.6789;
    const baseLng = typeof job.lng === 'number' && !Number.isNaN(job.lng) ? job.lng : 85.2774;
    let hash = 0;
    for (let i = 0; i < job.id.length; i++) {
      hash = (hash << 5) - hash + job.id.charCodeAt(i);
      hash |= 0;
    }
    const latOff = ((Math.abs(hash) % 100) - 50) * 0.00004;
    const lngOff = (((Math.abs(hash) >> 4) % 100) - 50) * 0.00004;
    return {
      lat: baseLat + latOff,
      lng: baseLng + lngOff,
    };
  }, [job.id, job.lat, job.lng]);

  const [prevJobId, setPrevJobId] = useState(job.id);
  if (prevJobId !== job.id) {
    setPrevJobId(job.id);
    setMapVisible(false);
  }

  useEffect(() => {
    if (!mapVisible || job.type !== 'In-person' || !mapEl.current) return;
    const el = mapEl.current;
    let alive = true;

    (async () => {
      const centerLng = approxOffset.lng;
      const centerLat = approxOffset.lat;
      const map = await sharedMapManager.getOrCreateMap(el, [centerLng, centerLat], 13.5);
      if (!alive || !map) return;
      sharedMapManager.updatePrivacyCircle([centerLng, centerLat], 0.45);
    })();

    return () => {
      alive = false;
      sharedMapManager.detachFrom(el);
    };
  }, [mapVisible, approxOffset, job.type]);

  const host = userById(job.hostId);
  const hr = ratingOf(job.hostId, 'host');
  const dist = job.type === 'Virtual' ? null : haversineKm(pos, job);
  const myBid = me ? job.bids.find((b) => b.workerId === me.id) : undefined;
  const isMine = me?.id === job.hostId;
  const generalArea = getGeneralArea(job.address);
  const isAssigned = job.status === 'assigned' || job.status === 'done';
  const assignedBid = job.bids.find((b) => b.id === job.assignedBidId);
  const assignedWorker = assignedBid ? userById(assignedBid.workerId) : null;

  // Phone number for direct contact if assigned
  const contactPhone = isMine
    ? (assignedWorker?.phone || '9801234567')
    : (host?.phone || '9801111111');

  return (
    <div className="text-[var(--fg)] pb-2">
      {/* Header Badges */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <JobStatusBadge status={job.status} lang={lang} />
          {job.urgent && <UrgentBadge lang={lang} />}
          {job.featured && <FeaturedBadge lang={lang} />}
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-bold text-[var(--primary)] border border-[var(--primary-border)]">
            <CategoryIconTile cat={job.cat} size="sm" />
            <span>{catName(job.cat, lang)}</span>
          </div>
        </div>
      </div>

      {/* Task Title */}
      <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug mb-3">
        {trText(job.title, lang)}
      </h2>

      {/* Price Banner */}
      <div className="flex justify-between items-baseline p-3.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] mb-4">
        <div>
          <span className="text-[11px] font-bold text-[var(--fg-muted)] uppercase tracking-wider block mb-0.5">
            {lang === 'ne' ? 'तोकिएको बजेट' : 'Task Budget'}
          </span>
          <div className="font-mukta text-3xl font-black text-[var(--primary)] leading-none">
            {npr(job.price)}
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block px-2 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary-border)]">
            {job.ptype === 'Hourly' ? t('hourly') : t('flat')}
          </span>
          {job.ptype === 'Flat' && job.hours ? (
            <span className="block text-[11px] font-bold text-[var(--fg-subtle)] mt-1">
              ≈ {npr(Math.round(job.price / job.hours))}{t('per_hr')}
            </span>
          ) : null}
        </div>
      </div>

      {/* Meta tags (Location & Time) */}
      <div className="flex items-center gap-2 flex-wrap mb-4 text-xs font-semibold">
        <span className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[var(--fg)]">
          {dist === null ? (
            <>
              <Globe className="w-3.5 h-3.5 text-[var(--fg-muted)]" />
              <span>{t('virtual')}</span>
            </>
          ) : (
            <>
              <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>
                {toNepaliNum(dist.toFixed(1), lang)} {lang === 'ne' ? 'कि.मी. टाढा' : 'km away'}
              </span>
            </>
          )}
        </span>

        {job.when && (
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[var(--fg)]">
            <Calendar className="w-3.5 h-3.5 text-[var(--fg-subtle)]" />
            <span>{trText(job.when, lang)}</span>
          </span>
        )}
      </div>

      {/* Accepted Payment Methods Row */}
      <div className="mb-4 p-3 rounded-xl border border-[var(--line)] bg-[var(--surface)]">
        <div className="text-[11px] font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-1.5">
          {lang === 'ne' ? 'स्वीकार्य भुक्तानी माध्यमहरू' : 'Accepted Payment Methods'}
        </div>
        <PaymentBadges size="md" lang={lang} />
      </div>

      {/* Photos Gallery with Fullscreen Lightbox */}
      {job.photos && job.photos.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-1.5">
            {lang === 'ne' ? 'कामका तस्बिरहरू' : 'Task Photos'} ({job.photos.length})
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {job.photos.map((p, i) => (
              <img
                key={i}
                src={p}
                onClick={() => setLightboxImg(p)}
                alt={`${job.title} - photo ${i + 1}`}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border border-[var(--line)] shadow-xs cursor-pointer hover:opacity-90 transition-opacity shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal for Full-Resolution Photo Inspection */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={lightboxImg}
            alt="Full size preview"
            className="max-w-full max-h-[88vh] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}

      {/* Description */}
      <div className="mb-5">
        <h3 className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-1.5">
          {lang === 'ne' ? 'कामको विवरण' : 'Task Details'}
        </h3>
        <p className="text-sm text-[var(--fg)] leading-relaxed whitespace-pre-line font-medium bg-[var(--surface-2)] p-4 rounded-2xl border border-[var(--line)]">
          {job.desc
            ? trText(job.desc, lang)
            : lang === 'ne'
            ? 'कुनै अतिरिक्त विवरण उपलब्ध छैन।'
            : 'No additional description provided.'}
        </p>
      </div>

      {/* Location Map Section */}
      {job.type === 'In-person' && (
        <div className="mb-5 rounded-2xl overflow-hidden border border-[var(--line)] shadow-xs bg-[var(--surface-2)]">
          {!mapVisible ? (
            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center flex-none">
                  <MapPin className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-sm text-[var(--fg)] truncate">
                    {trText(generalArea, lang)} {lang === 'ne' ? 'क्षेत्र' : 'area'}
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--fg-muted)] flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--success)]" />
                    <span>{lang === 'ne' ? 'गोपनीयताका लागि अनुमानित क्षेत्र' : 'Approximate area for privacy'}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMapVisible(true)}
                className="px-3.5 py-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--primary)] border border-[var(--primary-border)] text-xs font-bold transition-all shadow-2xs whitespace-nowrap flex items-center gap-1.5 flex-none cursor-pointer"
              >
                <span>🗺️</span>
                <span>{lang === 'ne' ? 'नक्सामा हेर्नुहोस्' : 'See on map'}</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="relative w-full h-44 bg-[var(--surface-2)]">
                <div ref={mapEl} className="w-full h-full" />
                <button
                  type="button"
                  onClick={() => setMapVisible(false)}
                  className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-lg bg-[var(--surface)]/95 text-[var(--fg)] text-[11px] font-bold border border-[var(--line)] shadow-xs cursor-pointer backdrop-blur-xs"
                >
                  ✕ {lang === 'ne' ? 'नक्सा बन्द गर्नुहोस्' : 'Hide map'}
                </button>
                {!MAPBOX_TOKEN && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--surface-2)] p-4 text-center">
                    <p className="text-xs font-bold text-[var(--fg)]">Mapbox Token Required</p>
                    <p className="text-[11px] text-[var(--fg-muted)] mt-1 max-w-xs">
                      Set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Poster Profile Card */}
      <div className="mb-5">
        <h3 className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-1.5">
          {lang === 'ne' ? 'काम पोस्ट गर्ने व्यक्ति' : 'Posted By'}
        </h3>
        <div
          className="p-3.5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--primary)] transition-colors cursor-pointer flex items-center gap-3 shadow-xs"
          onClick={() => openSheet('profile', { userId: job.hostId, role: 'host' })}
        >
          <div
            className="w-11 h-11 rounded-full text-white font-black flex items-center justify-center text-sm flex-none shadow-xs"
            style={{ background: avColor(host?.name) }}
          >
            {initials(host?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-[var(--fg)] truncate">
                {host?.name ? trText(host.name, lang) : t('poster')}
              </span>
              {host?.kycStatus === 'verified' && (
                <VerifiedBadge size="sm" lang={lang} showLabel={false} />
              )}
            </div>
            <div className="text-xs text-[var(--fg-muted)] font-medium flex items-center gap-1.5 mt-0.5">
              <span className="stars">{starsHtml(hr.avg)}</span>
              <span>
                {hr.avg ? toNepaliNum(hr.avg.toFixed(1), lang) : t('new_helper')} ({toNepaliNum(hr.count, lang)} {t('reviews')})
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-[var(--primary)] flex items-center gap-0.5">
            {t('tap_profile')} <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Direct Contact Options (In-app Chat, Call, Viber, WhatsApp) */}
      {(isAssigned || (myBid && myBid.chat.length > 0)) && (
        <div className="mb-5 p-3.5 rounded-2xl border border-[var(--primary-border)] bg-[var(--primary-soft)]">
          <h4 className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider mb-2">
            {lang === 'ne' ? 'सम्पर्क माध्यमहरू' : 'Direct Contact Options'}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* In-app chat */}
            <button
              type="button"
              onClick={() => {
                const targetBid = myBid || assignedBid;
                if (targetBid) openChat(job.id, targetBid.id, isMine ? 'host' : 'worker');
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow-2xs hover:bg-[var(--primary-hover)] transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t('contact_chat')}</span>
            </button>

            {/* Direct Call */}
            <a
              href={`tel:${contactPhone}`}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--success)] text-white text-xs font-bold shadow-2xs hover:opacity-90 transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{t('contact_call')}</span>
            </a>

            {/* Viber */}
            <a
              href={`viber://chat?number=%2B977${contactPhone}`}
              onClick={(e) => {
                if (!navigator.userAgent.includes('Mobile')) {
                  e.preventDefault();
                  showToast(`Viber: +977-${contactPhone}`);
                }
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#7360F2] text-white text-xs font-bold shadow-2xs hover:bg-[#604ED9] transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{t('contact_viber')}</span>
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/977${contactPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#25D366] text-white text-xs font-bold shadow-2xs hover:bg-[#1EBE5D] transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('contact_whatsapp')}</span>
            </a>
          </div>
        </div>
      )}

      {/* Action Buttons for Worker & Poster */}
      {isMine ? (
        <div className="space-y-2">
          <button
            type="button"
            className="w-full py-3 px-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] font-bold text-xs hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            onClick={() => openSheet('inbox', { jobId: job.id })}
          >
            {job.bids.length > 0
              ? `${lang === 'ne' ? 'आएका प्रस्तावहरू हेर्नुहोस्' : 'View Offers'} (${job.bids.length})`
              : (lang === 'ne' ? 'हाल कुनै प्रस्ताव आएको छैन' : 'No offers yet')}
          </button>
        </div>
      ) : myBid ? (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-[var(--primary-soft)] border border-[var(--primary-border)] flex items-center gap-2.5 text-xs text-[var(--primary)] font-bold">
            <CheckCircle className="w-4 h-4 text-[var(--primary)] flex-none" />
            <div>
              {t('you_offered')} · <b>{npr(myBid.amount)}</b>
            </div>
          </div>
          <div className="flex gap-2">
            {myBid.chat.length > 0 && (
              <button
                type="button"
                className="flex-1 py-3 px-4 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                onClick={() => openChat(job.id, myBid.id, 'worker')}
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t('open_chat')}</span>
              </button>
            )}
            {job.status === 'open' && (
              <button
                type="button"
                className="py-3 px-4 rounded-xl border border-[var(--accent-border)] bg-[var(--surface)] text-[var(--accent)] hover:bg-[var(--accent-soft)] font-bold text-sm transition-colors cursor-pointer"
                onClick={() => withdrawOffer(job.id)}
              >
                {t('withdraw')}
              </button>
            )}
          </div>
        </div>
      ) : job.status === 'open' ? (
        <div className="space-y-3">
          {me?.kycStatus !== 'verified' ? (
            <div className="p-3.5 rounded-2xl bg-[var(--warning-soft)] border border-[var(--warning-border)] flex items-start gap-2.5 text-xs text-[var(--warning)] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[var(--warning)] flex-none mt-0.5" />
              <div>
                <p className="font-bold">
                  {lang === 'ne' ? '🛡️ KYC प्रमाणीकरण आवश्यक' : '🛡️ Nepal KYC Required to Apply'}
                </p>
                <p className="text-[11px] text-[var(--fg-muted)] font-normal mt-0.5">
                  {lang === 'ne'
                    ? 'आवेदन दिनका लागि नेपाली नागरिकता वा राष्ट्रिय परिचयपत्र प्रमाणित हुनुपर्छ।'
                    : 'Nepali citizenship or National ID verification is required to bid.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[var(--primary-soft)] border border-[var(--primary-border)] flex items-center gap-2.5 text-xs text-[var(--primary)] font-semibold">
              <Lock className="w-4 h-4 text-[var(--primary)] flex-none" />
              <div>{t('cannot_msg_first')}</div>
            </div>
          )}

          {/* Primary CTA (Vibrant Crimson Red) */}
          <button
            type="button"
            className="w-full py-3.5 px-4 rounded-xl bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white font-extrabold text-sm transition-all shadow-cta active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            onClick={() => {
              if (me?.kycStatus !== 'verified') {
                openSheet('kyc', { jobId: job.id });
              } else {
                openSheet('offerForm', { jobId: job.id });
              }
            }}
          >
            {me?.kycStatus !== 'verified' ? (
              <span>{lang === 'ne' ? 'KYC प्रमाणित गरी Apply गर्नुहोस्' : 'Verify KYC & Apply'}</span>
            ) : (
              <span>{t('make_offer')}</span>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
};
