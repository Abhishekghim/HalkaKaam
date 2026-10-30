'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CATS, CATICON, catName } from '../lib/i18n';
import { loadMapbox, MAPBOX_TOKEN, MAPBOX_STYLE, MapboxMap } from '../lib/mapbox';
import { JobType, PriceType } from '../types';
import { POPULAR_LOCATIONS } from '../lib/nepal-geo';
import { compressImageFile } from '../lib/image-compress';
import { CategoryIconTile } from './ui/CategoryIconTile';
import { PAYMENT_METHODS, PaymentMethodId } from './ui/PaymentBadges';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Globe,
  Calendar,
  Clock,
  Sparkles,
  Camera,
  X,
  Banknote,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

export const PostJob: React.FC = () => {
  const { t, lang, pos, publishJob, setTab, showToast } = useApp();

  // Wizard Step (1: What, 2: Where, 3: When, 4: Budget)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: What
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('Home Cleaning');
  const [desc, setDesc] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  // Step 2: Where
  const [type, setType] = useState<JobType>('In-person');
  const [lat, setLat] = useState(pos.lat);
  const [lng, setLng] = useState(pos.lng);
  const [address, setAddress] = useState('');
  const [showMap, setShowMap] = useState(false);

  // Step 3: When
  const [datePreset, setDatePreset] = useState<'today' | 'tomorrow' | 'weekend' | 'custom'>('today');
  const [customDate, setCustomDate] = useState('');
  const [timeSlot, setTimeSlot] = useState<string>('Afternoon (12–4 PM)');

  // Step 4: Budget & Payment
  const [ptype, setPtype] = useState<PriceType>('Flat');
  const [price, setPrice] = useState('800');
  const [acceptedPayments, setAcceptedPayments] = useState<PaymentMethodId[]>([
    'esewa',
    'khalti',
    'imepay',
    'cash',
  ]);

  // Error feedback
  const [validationError, setValidationError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapboxMap | null>(null);
  const markerRef = useRef<unknown>(null);

  // Mount Mapbox pin map when needed
  useEffect(() => {
    let isMounted = true;
    if (type !== 'In-person' || !showMap || !mapContainerRef.current) return;

    async function initPostMap() {
      const mapboxgl = await loadMapbox();
      if (!isMounted || !mapContainerRef.current || !mapboxgl) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: MAPBOX_STYLE,
        center: [lng, lat],
        zoom: 14,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

      const marker = new mapboxgl.Marker({ draggable: true, color: '#DC143C' })
        .setLngLat([lng, lat])
        .addTo(map);

      marker.on('dragend', () => {
        const pt = marker.getLngLat();
        setLat(pt.lat);
        setLng(pt.lng);
      });

      map.on('click', (e) => {
        marker.setLngLat(e.lngLat);
        setLat(e.lngLat.lat);
        setLng(e.lngLat.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setTimeout(() => mapInstanceRef.current?.resize(), 250);
    }

    initPostMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [type, showMap]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, { maxWidth: 1000, quality: 0.72 });
      setPhotos((prev) => (prev.length < 3 ? [...prev, compressed] : prev));
    } catch {
      showToast(lang === 'ne' ? 'तस्बिर अपलोड गर्न सकिएन।' : 'Failed to compress image.');
    } finally {
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const togglePaymentMethod = (methodId: PaymentMethodId) => {
    if (acceptedPayments.includes(methodId)) {
      if (acceptedPayments.length > 1) {
        setAcceptedPayments(acceptedPayments.filter((p) => p !== methodId));
      }
    } else {
      setAcceptedPayments([...acceptedPayments, methodId]);
    }
  };

  // Step Validation & Navigation
  const handleNextStep = () => {
    setValidationError(null);

    if (step === 1) {
      if (!title.trim()) {
        setValidationError(lang === 'ne' ? 'कृपया कामको शीर्षक लेख्नुहोस्।' : 'Please enter a task title.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (type === 'In-person' && !address.trim()) {
        setAddress('Kathmandu Valley');
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    setValidationError(null);
    if (step > 1) setStep((step - 1) as 1 | 2 | 3 | 4);
    else setTab('jobs');
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const numPrice = Number(price);
    if (!numPrice || numPrice < 50) {
      setValidationError(lang === 'ne' ? 'न्यूनतम बजेट रु ५० हुनुपर्छ।' : 'Minimum budget is रु 50.');
      return;
    }

    let resolvedWhen = 'Flexible timing';
    if (datePreset === 'today') {
      resolvedWhen = `Today, ${timeSlot}`;
    } else if (datePreset === 'tomorrow') {
      resolvedWhen = `Tomorrow, ${timeSlot}`;
    } else if (datePreset === 'weekend') {
      resolvedWhen = `This weekend, ${timeSlot}`;
    } else if (customDate) {
      resolvedWhen = `${customDate}, ${timeSlot}`;
    }

    publishJob({
      title: title.trim(),
      cat,
      type,
      price: numPrice,
      ptype,
      lat,
      lng,
      address: address.trim() || undefined,
      when: resolvedWhen,
      desc: desc.trim(),
      photos,
      emoji: [CATICON[cat] || '📦'],
    });
  };

  const stepLabels = [
    { num: 1, title: t('step_what') },
    { num: 2, title: t('step_where') },
    { num: 3, title: t('step_when') },
    { num: 4, title: t('step_budget') },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={handlePrevStep}
          className="p-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg)] hover:border-[var(--primary)] transition-colors cursor-pointer"
          title={t('back')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-black text-[var(--fg)]">
            {lang === 'ne' ? 'नयाँ काम पोस्ट गर्नुहोस्' : 'Post a New Task'}
          </h2>
          <span className="text-xs text-[var(--fg-muted)] font-semibold">
            {lang === 'ne' ? `चरण ${step} / ४` : `Step ${step} of 4`}
          </span>
        </div>
        <div className="w-9" />
      </div>

      {/* Animated Step Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {stepLabels.map((s) => (
            <div
              key={s.num}
              onClick={() => s.num < step && setStep(s.num as 1 | 2 | 3 | 4)}
              className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                s.num === step
                  ? 'text-[var(--primary)]'
                  : s.num < step
                  ? 'text-[var(--success)] cursor-pointer'
                  : 'text-[var(--fg-subtle)]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black select-none ${
                  s.num === step
                    ? 'bg-[var(--primary)] text-white shadow-xs'
                    : s.num < step
                    ? 'bg-[var(--success-soft)] text-[var(--success)]'
                    : 'bg-[var(--surface-2)] text-[var(--fg-subtle)]'
                }`}
              >
                {s.num < step ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
              </div>
              <span className="hidden sm:inline">{s.title}</span>
            </div>
          ))}
        </div>
        <div className="h-1.5 w-full bg-[var(--surface-2)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-300 rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Validation Message */}
      {validationError && (
        <div className="mb-4 p-3 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-border)] text-xs text-[var(--accent-text)] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-none" />
          <span>{validationError}</span>
        </div>
      )}

      {/* FORM BODY */}
      <form onSubmit={step === 4 ? handlePublish : (e) => { e.preventDefault(); handleNextStep(); }}>
        {/* STEP 1: WHAT */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-[var(--fg)] uppercase tracking-wider mb-2">
                {t('f_category')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CATS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCat(c)}
                    className={`p-3 rounded-2xl border text-left flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                      cat === c
                        ? 'border-[var(--primary)] bg-[var(--primary-soft)] ring-2 ring-[var(--ring)]'
                        : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--primary)]'
                    }`}
                  >
                    <CategoryIconTile cat={c} size="md" />
                    <span className="text-xs font-bold text-[var(--fg)] line-clamp-1">
                      {catName(c, lang)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[var(--fg)] uppercase tracking-wider mb-2">
                {t('f_what')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  lang === 'ne'
                    ? 'जस्तै: तेस्रो तल्लामा टेबल सार्न सहयोग चाहियो'
                    : 'e.g. Need help moving study tables to 3rd floor'
                }
                className="w-full p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-sm font-semibold text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-[var(--fg)] uppercase tracking-wider mb-2">
                {t('f_desc')} (वैकल्पिक / Optional)
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder={
                  lang === 'ne'
                    ? 'कामको थप विवरण लेख्नुहोस् (सामानको आकार, के-के सामग्री उपलब्ध छन्, आदि)...'
                    : 'Add more details (materials needed, lift availability, specific tools, etc)...'
                }
                rows={3}
                className="w-full p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-sm font-semibold text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>

            {/* Photo upload */}
            <div>
              <label className="block text-xs font-bold text-[var(--fg)] uppercase tracking-wider mb-2">
                {t('f_photos')} (अधिकतम ३ वटा)
              </label>
              <div className="flex gap-2.5 flex-wrap">
                {photos.map((p, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[var(--line)]">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center text-xs cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 3 && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-[var(--line)] hover:border-[var(--primary)] bg-[var(--surface-2)] flex flex-col items-center justify-center gap-1 text-[var(--fg-muted)] cursor-pointer transition-colors">
                    <Camera className="w-5 h-5" />
                    <span className="text-[10px] font-bold">थप्नुहोस्</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: WHERE */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* In-Person vs Virtual */}
            <div>
              <label className="block text-xs font-bold text-[var(--fg)] uppercase tracking-wider mb-2">
                {t('f_where')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('In-person')}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    type === 'In-person'
                      ? 'border-[var(--primary)] bg-[var(--primary-soft)] ring-2 ring-[var(--ring)]'
                      : 'border-[var(--line)] bg-[var(--surface)]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--fg)]">{t('f_inperson')}</h4>
                    <p className="text-[11px] text-[var(--fg-muted)]">{lang === 'ne' ? 'घर/स्थानमै आएर' : 'On-site in person'}</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setType('Virtual')}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    type === 'Virtual'
                      ? 'border-[var(--primary)] bg-[var(--primary-soft)] ring-2 ring-[var(--ring)]'
                      : 'border-[var(--line)] bg-[var(--surface)]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--fg)]">{t('f_online')}</h4>
                    <p className="text-[11px] text-[var(--fg-muted)]">{lang === 'ne' ? 'अनलाइन / रिमोट' : 'Remote / Online'}</p>
                  </div>
                </button>
              </div>
            </div>

            {type === 'In-person' && (
              <>
                {/* Popular Nepal Areas Quick Pick */}
                <div>
                  <label className="block text-xs font-bold text-[var(--fg)] uppercase tracking-wider mb-2">
                    {lang === 'ne' ? 'प्रमुख स्थान छान्नुहोस्' : 'Select Nepal Area'}
                  </label>
                  <div className="flex gap-2 flex-wrap max-h-36 overflow-y-auto p-1">
                    {POPULAR_LOCATIONS.slice(0, 8).map((loc) => (
                      <button
                        key={loc.name}
                        type="button"
                        onClick={() => {
                          setAddress(loc.name);
                          setLat(loc.lat);
                          setLng(loc.lng);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                          address === loc.name
                            ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                            : 'bg-[var(--surface)] border-[var(--line)] text-[var(--fg)] hover:border-[var(--primary)]'
                        }`}
                      >
                        {lang === 'ne' ? loc.ne : loc.name.split('(')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specific Address Input */}
                <div>
                  <label className="block text-xs font-bold text-[var(--fg)] uppercase tracking-wider mb-2">
                    {lang === 'ne' ? 'टोल / ठेगाना' : 'Specific Landmark / Street'}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={
                      lang === 'ne'
                        ? 'जस्तै: नयाँ बजार, कीर्तिपुर (वा नजिकको चोक)'
                        : 'e.g. Naya Bazar, Kirtipur (or nearest chowk)'
                    }
                    className="w-full p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-sm font-semibold text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>

                {/* Map toggle */}
                <div>
                  {!showMap ? (
                    <button
                      type="button"
                      onClick={() => setShowMap(true)}
                      className="px-3.5 py-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--primary)] border border-[var(--primary-border)] text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-[var(--accent)]" />
                      <span>{lang === 'ne' ? '🗺️ नक्सामा पिन मिलाउनुहोस्' : '🗺️ Adjust Pin on Map'}</span>
                    </button>
                  ) : (
                    <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] h-48 bg-[var(--surface-2)]">
                      <div ref={mapContainerRef} className="w-full h-full" />
                      <button
                        type="button"
                        onClick={() => setShowMap(false)}
                        className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-lg bg-[var(--surface)] text-[var(--fg)] text-[11px] font-bold border border-[var(--line)] shadow-xs cursor-pointer"
                      >
                        ✕ {lang === 'ne' ? 'नक्सा बन्द' : 'Hide map'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 3: WHEN */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold text-[var(--fg)] uppercase tracking-wider mb-2">
                {lang === 'ne' ? 'काम कहिले गर्ने?' : 'When do you need it?'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'today', label: lang === 'ne' ? 'आज (Today)' : 'Today' },
                  { id: 'tomorrow', label: lang === 'ne' ? 'भोलि (Tomorrow)' : 'Tomorrow' },
                  { id: 'weekend', label: lang === 'ne' ? 'सप्ताहान्त (Weekend)' : 'This weekend' },
                  { id: 'custom', label: lang === 'ne' ? 'मिती रोज्नुहोस्' : 'Custom date' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setDatePreset(p.id as 'today' | 'tomorrow' | 'weekend' | 'custom')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      datePreset === p.id
                        ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-xs'
                        : 'border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] hover:border-[var(--primary)]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {datePreset === 'custom' && (
              <div>
                <label className="block text-xs font-bold text-[var(--fg)] uppercase tracking-wider mb-2">
                  {lang === 'ne' ? 'मिती चयन गर्नुहोस्' : 'Select Date'}
                </label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-sm font-semibold text-[var(--fg)]"
                />
              </div>
            )}

            {/* Time slot preference */}
            <div>
              <label className="block text-xs font-bold text-[var(--fg)] uppercase tracking-wider mb-2">
                {lang === 'ne' ? 'कुन समयमा उपयुक्त?' : 'Time of Day'}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  'Morning (8 AM–12 PM)',
                  'Afternoon (12–4 PM)',
                  'Evening (4–8 PM)',
                  'Flexible timing',
                ].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                      timeSlot === slot
                        ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)] ring-1 ring-[var(--primary)]'
                        : 'border-[var(--line)] bg-[var(--surface)] text-[var(--fg)]'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-[var(--fg-muted)] flex-none" />
                    <span>{slot}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: BUDGET & PAYMENT */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Price Type */}
            <div>
              <label className="block text-xs font-bold text-[var(--fg)] uppercase tracking-wider mb-2">
                {t('f_price_type')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPtype('Flat')}
                  className={`p-3.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                    ptype === 'Flat'
                      ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-xs'
                      : 'border-[var(--line)] bg-[var(--surface)] text-[var(--fg)]'
                  }`}
                >
                  {t('flat')} (निश्चित दर)
                </button>
                <button
                  type="button"
                  onClick={() => setPtype('Hourly')}
                  className={`p-3.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                    ptype === 'Hourly'
                      ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-xs'
                      : 'border-[var(--line)] bg-[var(--surface)] text-[var(--fg)]'
                  }`}
                >
                  {t('hourly')} (प्रति घण्टा)
                </button>
              </div>
            </div>

            {/* NPR Amount Input & Quick Chips */}
            <div>
              <label className="block text-xs font-bold text-[var(--fg)] uppercase tracking-wider mb-2">
                {lang === 'ne' ? 'बजेट रकम (NPR रु)' : 'Budget Amount in NPR (रु)'}
              </label>
              <div className="relative mb-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mukta font-extrabold text-lg text-[var(--primary)]">
                  रु
                </span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="800"
                  min="50"
                  step="50"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xl font-mukta font-black text-[var(--fg)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]"
                  required
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex gap-2 flex-wrap">
                {['350', '500', '800', '1200', '1500', '2500'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPrice(amt)}
                    className={`px-3 py-1 rounded-full text-xs font-bold font-mukta border transition-colors cursor-pointer ${
                      price === amt
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                        : 'bg-[var(--surface)] border-[var(--line)] text-[var(--fg)] hover:border-[var(--primary)]'
                    }`}
                  >
                    रु {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Accepted Payment Options */}
            <div>
              <label className="block text-xs font-bold text-[var(--fg)] uppercase tracking-wider mb-2">
                {lang === 'ne' ? 'स्वीकार्य भुक्तानी माध्यमहरू' : 'Accepted Payment Methods for this Task'}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {PAYMENT_METHODS.map((pm) => {
                  const isChecked = acceptedPayments.includes(pm.id);
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => togglePaymentMethod(pm.id)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                        isChecked
                          ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)] shadow-xs'
                          : 'border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] hover:border-[var(--primary)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-none ${pm.iconBg} ${pm.iconBorder}`}>
                          {pm.id === 'cash' ? (
                            <Banknote className="w-4 h-4 text-[var(--primary)]" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10 dark:ring-white/10" style={{ backgroundColor: pm.brandColor }} />
                          )}
                        </span>
                        <span className="font-extrabold">{lang === 'ne' ? pm.ne : pm.name}</span>
                      </div>
                      {isChecked && <Check className="w-4 h-4 text-[var(--primary)] stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION BUTTONS */}
        <div className="mt-8 pt-4 border-t border-[var(--line)] flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-5 py-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg)] hover:border-[var(--primary)] text-xs font-bold transition-colors cursor-pointer"
            >
              {t('back')}
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <span>{t('next')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white text-sm font-black shadow-cta active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{lang === 'ne' ? 'काम पोस्ट गर्नुहोस् (Publish)' : 'Publish Task'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
