'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { POPULAR_LOCATIONS, NEPAL_PROVINCES } from '../lib/nepal-geo';
import { loadMapbox, MAPBOX_TOKEN, MAPBOX_STYLE, MapboxMap } from '../lib/mapbox';
import { Coordinates } from '../types';
import {
  MapPin,
  ArrowLeft,
  Navigation,
  Check,
  Sliders,
  Search,
  X,
  Map as MapIcon,
  Loader2,
  ChevronDown,
} from 'lucide-react';

const clampKm = (km: number) => Math.max(1, Math.min(25, Math.round(km)));

const RADIUS_PRESETS = [
  { km: 2, labelEn: '2 km', subEn: 'Neighborhood', labelNe: '२ कि.मी.', subNe: 'टोल' },
  { km: 5, labelEn: '5 km', subEn: 'City', labelNe: '५ कि.मी.', subNe: 'शहर' },
  { km: 10, labelEn: '10 km', subEn: 'Valley', labelNe: '१० कि.मी.', subNe: 'उपत्यका' },
  { km: 25, labelEn: '25 km', subEn: 'Wider area', labelNe: '२५ कि.मी.', subNe: 'वरपर' },
];

export const ScreenLocation: React.FC = () => {
  const {
    t,
    lang,
    toggleLang,
    goAuth,
    setView,
    locSet,
    pos,
    locName,
    radius: currentRadius,
    confirmLocation,
  } = useApp();

  const [tmpPos, setTmpPos] = useState<Coordinates>({ ...pos });
  const [tmpName, setTmpName] = useState<string>(locName || 'Kathmandu, Bagmati');
  const [radius, setRadius] = useState<number>(currentRadius || 5);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locFeedback, setLocFeedback] = useState<{ text: string; success: boolean } | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);

  const ringPx = () => (ringRef.current ? ringRef.current.getBoundingClientRect().width / 2 || 90 : 90);

  const kmFromZoom = (zoom: number, lat: number) => {
    const mpp = (40075016.686 * Math.cos((lat * Math.PI) / 180)) / (512 * Math.pow(2, zoom));
    return (mpp * ringPx()) / 1000;
  };

  const zoomForKm = (km: number, lat: number) => {
    const targetMpp = (km * 1000) / ringPx();
    return Math.log2((40075016.686 * Math.cos((lat * Math.PI) / 180)) / (512 * targetMpp));
  };

  const syncFromMap = () => {
    const map = mapRef.current;
    if (!map) return;
    const c = map.getCenter();
    setRadius(clampKm(kmFromZoom(map.getZoom(), c.lat)));
    setTmpPos({ lat: c.lat, lng: c.lng });
  };

  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;
    let alive = true;

    (async () => {
      const mapboxgl = await loadMapbox();
      if (!alive || !mapContainerRef.current || !mapboxgl) return;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: MAPBOX_STYLE,
        center: [tmpPos.lng, tmpPos.lat],
        zoom: zoomForKm(radius, tmpPos.lat),
        attributionControl: false,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
      map.on('move', syncFromMap);
      map.on('zoom', syncFromMap);

      mapRef.current = map;
      setTimeout(() => {
        if (!mapRef.current) return;
        mapRef.current.resize();
      }, 150);
    })();

    return () => {
      alive = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [showMap]);

  const handleSlider = (km: number) => {
    setRadius(km);
    const map = mapRef.current;
    if (map) {
      try {
        const c = map.getCenter();
        map.setZoom(zoomForKm(km, c.lat));
      } catch {}
    }
  };

  const flyTo = (c: Coordinates) => {
    const map = mapRef.current;
    if (map) map.flyTo({ center: [c.lng, c.lat] });
  };

  const handleUseMyLocation = () => {
    setIsLocating(true);
    setLocFeedback(null);

    if (!navigator.geolocation) {
      setIsLocating(false);
      setLocFeedback({
        text: lang === 'ne' ? 'लोकेसन अनुमति पाइएन। तलबाट शहर छान्नुहोस्।' : 'Could not access GPS. Please pick a city below.',
        success: false,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (p) => {
        setIsLocating(false);
        const c = { lat: p.coords.latitude, lng: p.coords.longitude };
        setTmpPos(c);
        const name = lang === 'ne' ? 'मेरो हालको स्थान (GPS)' : 'My Current Location (GPS)';
        setTmpName(name);
        setLocFeedback({
          text: lang === 'ne' ? '✓ तपाईंको लोकेसन पत्ता लाग्यो' : '✓ Location detected via GPS',
          success: true,
        });
        flyTo(c);
      },
      () => {
        setIsLocating(false);
        setLocFeedback({
          text: lang === 'ne' ? 'लोकेसन अनुमति अस्वीकार भयो। कृपया तलबाट छान्नुहोस्।' : 'GPS access was denied. Please pick a city below.',
          success: false,
        });
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelectLoc = (loc: typeof POPULAR_LOCATIONS[0]) => {
    const name = lang === 'ne' ? loc.ne : loc.name.split('(')[0].trim();
    setTmpPos({ lat: loc.lat, lng: loc.lng });
    setTmpName(name);
    setSearchQuery('');
    setLocFeedback({
      text: lang === 'ne' ? `✓ ${name} चयन गरियो` : `✓ ${name} selected`,
      success: true,
    });
    flyTo({ lat: loc.lat, lng: loc.lng });
  };

  // Filtered list based on search query or province
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return POPULAR_LOCATIONS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.ne.includes(q) ||
        l.district.toLowerCase().includes(q) ||
        l.province.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const displayedHubs = useMemo(() => {
    if (selectedProvince === 'All') return POPULAR_LOCATIONS.slice(0, 10);
    return POPULAR_LOCATIONS.filter((l) => l.province === selectedProvince);
  }, [selectedProvince]);

  const handleBack = () => (locSet ? setView('app') : goAuth());

  return (
    <div id="locstep" className="min-h-screen bg-[var(--bg)] text-[var(--fg)] p-4 sm:p-6 transition-colors">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--fg)] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
            title={t('back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-black text-[var(--fg)] tracking-tight">
              {t('where_title')}
            </h1>
            <p className="text-xs text-[var(--fg-muted)] mt-0.5">
              {lang === 'ne' ? 'नजिकका कामहरू हेर्न आफ्नो लोकेसन छान्नुहोस्' : 'Select your area to discover nearby tasks'}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleLang}
            className="px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold text-[var(--primary)] shadow-2xs hover:bg-[var(--surface-2)] cursor-pointer"
          >
            {lang === 'en' ? 'नेपाली' : 'English'}
          </button>
        </div>

        {/* ===================================================================
            SECTION 1: WHERE ARE YOU? (1-Click GPS or Search/Pick Hub)
            =================================================================== */}
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[var(--fg)] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[var(--primary)]" />
              <span>{lang === 'ne' ? 'तपाईंको ठेगाना' : '1. Choose Location'}</span>
            </span>
            <span className="text-xs font-bold text-[var(--primary)] bg-[var(--primary-soft)] border border-[var(--primary-border)] px-2.5 py-0.5 rounded-full">
              {tmpName.split(',')[0]}
            </span>
          </div>

          {/* 1-Click GPS Auto-Detect Button */}
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="w-full p-3.5 rounded-xl border-2 border-[var(--primary-border)] hover:border-[var(--primary)] bg-[var(--primary-soft)]/40 hover:bg-[var(--primary-soft)] text-left flex items-center justify-between gap-3 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center flex-none shadow-xs group-hover:scale-105 transition-transform">
                {isLocating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Navigation className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-extrabold text-[var(--fg)] group-hover:text-[var(--primary)] transition-colors">
                  {lang === 'ne' ? 'मेरो हालको लोकेसन प्रयोग गर्नुहोस्' : 'Use My Current Location'}
                </span>
                <span className="block text-xs text-[var(--fg-muted)] truncate">
                  {isLocating
                    ? (lang === 'ne' ? 'GPS पत्ता लगाउँदै...' : 'Detecting GPS coordinates...')
                    : (lang === 'ne' ? 'जीपीएसबाट स्वचालित पत्ता लगाउनुहोस्' : 'Auto-detect via GPS in 1 click')}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-[var(--surface)] text-[var(--primary)] border border-[var(--primary-border)] flex-none shadow-2xs">
              GPS
            </span>
          </button>

          {/* Feedback Banner */}
          {locFeedback && (
            <div
              className={`p-2.5 rounded-xl text-xs font-bold text-center transition-all ${
                locFeedback.success
                  ? 'bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success)]/30'
                  : 'bg-[var(--accent-soft)] text-[var(--accent-text)] border border-[var(--accent)]/30'
              }`}
            >
              {locFeedback.text}
            </div>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--line)]" />
            </div>
            <span className="relative bg-[var(--surface)] px-3 text-[11px] font-bold text-[var(--fg-muted)] uppercase tracking-wider">
              {lang === 'ne' ? 'वा शहर खोज्नुहोस्' : 'Or search city / area'}
            </span>
          </div>

          {/* Search Input Box */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'ne'
                  ? 'शहर वा ठाउँको नाम खोज्नुहोस् (उदा: बानेश्वर, पोखरा, पाटन)...'
                  : 'Search city, area or district (e.g. Baneshwor, Pokhara, Patan)...'
              }
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-sm font-semibold text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[var(--line)] text-[var(--fg-muted)] hover:text-[var(--fg)] flex items-center justify-center cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Instant Search Results Dropdown List */}
          {searchQuery.trim().length > 0 ? (
            <div className="space-y-1 max-h-48 overflow-y-auto p-1 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--fg-muted)]">
                  {lang === 'ne' ? 'कुनै ठाउँ भेटिएन।' : 'No matching location found.'}
                </div>
              ) : (
                searchResults.map((loc) => (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => handleSelectLoc(loc)}
                    className="w-full p-2.5 rounded-lg text-left text-xs font-bold hover:bg-[var(--surface)] text-[var(--fg)] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="block font-extrabold text-[var(--fg)]">
                        {lang === 'ne' ? loc.ne : loc.name.split('(')[0]}
                      </span>
                      <span className="text-[10px] text-[var(--fg-muted)] font-medium">
                        {loc.district} · {loc.province}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--primary)] font-bold">
                      {lang === 'ne' ? 'छान्नुहोस् ›' : 'Select ›'}
                    </span>
                  </button>
                ))
              )}
            </div>
          ) : (
            /* Popular Hub Quick Chips */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[var(--fg-muted)]">
                <span>{lang === 'ne' ? 'लोकप्रिय शहरहरू:' : 'Popular Nepal Hubs:'}</span>
                {/* Optional Province Filter Dropdown */}
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="bg-transparent border-none text-[11px] font-bold text-[var(--primary)] outline-none cursor-pointer"
                >
                  <option value="All">{lang === 'ne' ? 'सबै प्रदेश' : 'All Provinces'}</option>
                  <option value="Bagmati">Bagmati (बागमती)</option>
                  <option value="Gandaki">Gandaki (गण्डकी)</option>
                  <option value="Koshi">Koshi (कोशी)</option>
                  <option value="Lumbini">Lumbini (लुम्बिनी)</option>
                  <option value="Madhesh">Madhesh (मधेश)</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {displayedHubs.map((loc) => {
                  const locTitle = lang === 'ne' ? loc.ne : loc.name.split('(')[0].trim();
                  const isSelected = tmpName === locTitle || tmpName.startsWith(locTitle);
                  return (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => handleSelectLoc(loc)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[var(--primary)] text-white shadow-xs ring-1 ring-[var(--primary)]'
                          : 'bg-[var(--surface-2)] text-[var(--fg)] border border-[var(--line)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                      }`}
                    >
                      <span>{locTitle}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================
            SECTION 2: HOW FAR WILL YOU GO? (RADIUS PRESETS + SLIDER)
            =================================================================== */}
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[var(--fg)] uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[var(--primary)]" />
              <span>{t('how_far')}</span>
            </span>
            <span className="font-mukta font-black text-xl text-[var(--primary)]">
              {radius} km {lang === 'ne' ? 'दायरा' : 'radius'}
            </span>
          </div>

          {/* Quick Distance Presets Pills */}
          <div className="grid grid-cols-4 gap-2">
            {RADIUS_PRESETS.map((preset) => {
              const isPicked = radius === preset.km;
              return (
                <button
                  key={preset.km}
                  type="button"
                  onClick={() => handleSlider(preset.km)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isPicked
                      ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-xs font-black'
                      : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg)] hover:border-[var(--primary)]'
                  }`}
                >
                  <span className="block text-sm font-extrabold">
                    {lang === 'ne' ? preset.labelNe : preset.labelEn}
                  </span>
                  <span
                    className={`block text-[10px] mt-0.5 ${
                      isPicked ? 'text-white/80' : 'text-[var(--fg-muted)]'
                    }`}
                  >
                    {lang === 'ne' ? preset.subNe : preset.subEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Slider Bar */}
          <div className="pt-2">
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={radius}
              onChange={(e) => handleSlider(Number(e.target.value))}
              className="w-full h-2 bg-[var(--surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
            />
            <div className="flex justify-between text-[11px] font-semibold text-[var(--fg-muted)] mt-1">
              <span>1 km ({lang === 'ne' ? 'टोल' : 'Local'})</span>
              <span>10 km ({lang === 'ne' ? 'उपत्यका' : 'Valley'})</span>
              <span>25 km ({lang === 'ne' ? 'वरपर' : 'Wider'})</span>
            </div>
          </div>
        </div>

        {/* ===================================================================
            SECTION 3: OPTIONAL MAP PIN ADJUSTER (COLLAPSIBLE)
            =================================================================== */}
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center flex-none">
                <MapIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-[var(--fg)] block">
                  {lang === 'ne' ? 'नक्सामा पिन र दायरा हेर्नुहोस्' : 'Adjust Pin on Map (Optional)'}
                </span>
                <span className="text-[11px] text-[var(--fg-muted)] block">
                  {showMap
                    ? (lang === 'ne' ? 'नक्सा बन्द गर्न ट्याप गर्नुहोस्' : 'Tap to collapse map')
                    : (lang === 'ne' ? 'नक्सा तानेर दायरा समायोजन गर्न सकिन्छ' : 'Drag and zoom interactive map')}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-[var(--primary)]">
              {showMap ? (lang === 'ne' ? 'लुकाउनुहोस् ▲' : 'Hide ▲') : (lang === 'ne' ? 'खोल्नुहोस् ▼' : 'Open ▼')}
            </span>
          </button>

          {showMap && (
            <div className="p-3 border-t border-[var(--line)] bg-[var(--surface-2)]">
              <div className="relative h-60 rounded-xl overflow-hidden border border-[var(--line)]">
                <div ref={mapContainerRef} className="w-full h-full" />
                <div ref={ringRef} className="mappick-ring"><span className="dot" /></div>
              </div>
              <p className="text-[11px] text-[var(--fg-muted)] text-center mt-2 font-medium">
                {t('drag_hint')}
              </p>
            </div>
          )}
        </div>

        {/* ===================================================================
            SECTION 4: CONFIRMATION & PRIMARY ACTION CTA
            =================================================================== */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => confirmLocation(tmpPos, tmpName, radius)}
            className="w-full py-4 px-6 rounded-2xl bg-[var(--accent-fill)] hover:bg-[var(--accent-hover)] text-white text-base font-black shadow-cta active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>
              {lang === 'ne'
                ? `स्थान लागू गर्नुहोस्: ${tmpName.split(',')[0]} (${radius} कि.मी.)`
                : `Apply: ${tmpName.split(',')[0]} (${radius} km radius)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
