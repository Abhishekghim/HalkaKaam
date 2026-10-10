'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { AREAS, haversineKm } from '../lib/constants';
import { addTiles, LeafletMap, loadLeaflet } from '../lib/leaflet';
import { Coordinates } from '../types';

const clampKm = (km: number) => Math.max(1, Math.min(15, Math.round(km)));

export const ScreenLocation: React.FC = () => {
  const { t, lang, toggleLang, goAuth, setView, locSet, pos, locName, radius: currentRadius, confirmLocation } = useApp();

  const [tmpPos, setTmpPos] = useState<Coordinates>({ ...pos });
  const [tmpName, setTmpName] = useState<string>(locName);
  const [radius, setRadius] = useState<number>(currentRadius || 4);
  const [selectedAreaIdx, setSelectedAreaIdx] = useState<number | null>(null);
  const [locStatus, setLocStatus] = useState<{ text: string; type: 'ok' | 'err' | '' } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  /* These helpers only read refs, so they are safe to use inside Leaflet event handlers. */
  const ringPx = () => (ringRef.current ? ringRef.current.getBoundingClientRect().width / 2 || 90 : 90);

  const kmFromZoom = (map: LeafletMap) => {
    const c = map.getCenter();
    const cp = map.latLngToContainerPoint(c);
    const edge = map.containerPointToLatLng([cp.x, cp.y - ringPx()]);
    return haversineKm({ lat: c.lat, lng: c.lng }, { lat: edge.lat, lng: edge.lng });
  };

  const zoomForKm = (map: LeafletMap, km: number) => {
    const c = map.getCenter();
    const mppNow = (40075016.686 * Math.cos((c.lat * Math.PI) / 180)) / Math.pow(2, map.getZoom() + 8);
    const targetMpp = (km * 1000) / ringPx();
    return map.getZoom() + Math.log2(mppNow / targetMpp);
  };

  const syncFromMap = () => {
    const map = mapRef.current;
    if (!map) return;
    setRadius(clampKm(kmFromZoom(map)));
    const c = map.getCenter();
    setTmpPos({ lat: c.lat, lng: c.lng });
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      const L = await loadLeaflet();
      if (!alive || !mapContainerRef.current) return;
      const map = L.map(mapContainerRef.current, { zoomControl: true, scrollWheelZoom: true, zoomSnap: 0 })
        .setView([tmpPos.lat, tmpPos.lng], 13);
      addTiles(L, map);
      mapRef.current = map;
      const startKm = radius;
      try { map.setZoom(zoomForKm(map, startKm), { animate: false }); } catch { /* noop */ }
      map.on('move zoom moveend zoomend', syncFromMap);
      setTimeout(() => {
        if (!mapRef.current) return;
        mapRef.current.invalidateSize();
        try { mapRef.current.setZoom(zoomForKm(mapRef.current, startKm), { animate: false }); } catch { /* noop */ }
      }, 120);
    })();
    return () => {
      alive = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // mount once — map events keep state in sync afterwards
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSlider = (km: number) => {
    setRadius(km);
    const map = mapRef.current;
    if (map) {
      try { map.setZoom(zoomForKm(map, km), { animate: false }); } catch { /* noop */ }
    }
  };

  const flyTo = (c: Coordinates) => {
    const map = mapRef.current;
    if (map) map.setView([c.lat, c.lng], map.getZoom());
  };

  const handleUseMyLocation = () => {
    setLocStatus({ text: '⏳ ' + t('locating'), type: '' });
    if (!navigator.geolocation) {
      setLocStatus({ text: '⚠️ ' + t('loc_denied'), type: 'err' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const c = { lat: p.coords.latitude, lng: p.coords.longitude };
        setTmpPos(c);
        setTmpName(t('your_location'));
        setSelectedAreaIdx(null);
        setLocStatus({ text: '✓ ' + t('loc_found'), type: 'ok' });
        flyTo(c);
      },
      () => setLocStatus({ text: '⚠️ ' + t('loc_denied'), type: 'err' }),
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handlePickArea = (idx: number) => {
    const ar = AREAS[idx];
    const name = lang === 'ne' ? ar.ne : ar.name;
    setTmpPos({ lat: ar.lat, lng: ar.lng });
    setTmpName(name);
    setSelectedAreaIdx(idx);
    setLocStatus({ text: '✓ ' + name, type: 'ok' });
    flyTo(ar);
  };

  // Back: inside the app → return to it; during onboarding → back to sign-in
  const handleBack = () => (locSet ? setView('app') : goAuth());

  return (
    <div id="locstep" className="screen-full">
      <div className="loc-shell">
        <div className="loc-head">
          <div className="top">
            <button className="backbtn" onClick={handleBack} aria-label={t('back')}>‹</button>
            <button className="lang-switch" style={{ marginLeft: 'auto' }} onClick={toggleLang}>
              {t('other_lang')}
            </button>
          </div>
          <h1>{t('where_title')}</h1>
          <p className="sub">{t('where_sub')}</p>
        </div>

        <div className="loc-main">
          <div className="mappick">
            <div ref={mapContainerRef} className="mappick-map" />
            <div ref={ringRef} className="mappick-ring"><span className="dot" /></div>
            <div className="mappick-hint">{t('drag_hint')}</div>
          </div>

          <div className="loc-controls">
            <button className="locopt" onClick={handleUseMyLocation}>
              <div className="ic">📍</div>
              <div>
                <b>{t('use_my_loc')}</b>
                <span>{t('use_my_loc_sub')}</span>
              </div>
            </button>

            {locStatus && <div className={`locstatus ${locStatus.type}`}>{locStatus.text}</div>}

            <div className="distbox">
              <div className="row">
                <b>{t('how_far')}</b>
                <span className="val">{radius} km</span>
              </div>
              <input
                type="range" min="1" max="15" step="1" value={radius}
                onChange={(e) => handleSlider(Number(e.target.value))}
                aria-label={t('how_far')}
              />
              <div className="distmarks"><span>1 km</span><span>7 km</span><span>15 km</span></div>
            </div>

            <div className="pick-area-label">{t('pick_area')}</div>
            <div className="catgrid">
              {AREAS.map((ar, i) => (
                <button key={ar.name} className={`catcell ${selectedAreaIdx === i ? 'on' : ''}`} onClick={() => handlePickArea(i)}>
                  <div className="ic">🏙️</div>
                  {lang === 'ne' ? ar.ne : ar.name}
                </button>
              ))}
            </div>

            <button className="btn btn-primary btn-lg loc-apply" onClick={() => confirmLocation(tmpPos, tmpName, radius)}>
              {t('apply_loc')} ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
