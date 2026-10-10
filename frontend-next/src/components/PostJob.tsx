'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CATS, CATICON, catName } from '../lib/i18n';
import { JobType, PriceType } from '../types';

export const PostJob: React.FC = () => {
  const { t, lang, pos, publishJob, setTab, showToast } = useApp();

  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('Moving Help');
  const [type, setType] = useState<JobType>('In-person');
  const [lat, setLat] = useState(pos.lat);
  const [lng, setLng] = useState(pos.lng);
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [desc, setDesc] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [ptype, setPtype] = useState<PriceType>('Flat');
  const [price, setPrice] = useState('');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Mount Leaflet pin map when type === 'In-person'
  useEffect(() => {
    let isMounted = true;
    if (type !== 'In-person' || !mapContainerRef.current) return;

    async function initPostMap() {
      const L = (await import('leaflet')).default;
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current).setView([lat, lng], 15);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: 'hk-pin',
        html: `<div class="pinbox">📍</div>`,
        iconSize: [0, 0],
      });

      const marker = L.marker([lat, lng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        const newLL = marker.getLatLng();
        setLat(newLL.lat);
        setLng(newLL.lng);
      });

      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        setLat(e.latlng.lat);
        setLng(e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    initPostMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [type]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result && photos.length < 3) {
        setPhotos([...photos, reader.result as string]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast(t('need_title'));
      return;
    }
    const numPrice = Number(price);
    if (!numPrice || numPrice <= 0) {
      showToast(t('need_price'));
      return;
    }

    const whenText = date
      ? `${date} ${time ? 'at ' + time : ''}`
      : 'Flexible timing';

    publishJob({
      title: title.trim(),
      cat,
      type,
      price: numPrice,
      ptype,
      lat,
      lng,
      address: address.trim() || undefined,
      when: whenText,
      desc: desc.trim(),
      photos,
      emoji: [CATICON[cat] || '📦'],
    });
  };

  return (
    <div>
      <div className="backrow">
        <button className="backbtn" onClick={() => setTab('jobs')}>
          ‹
        </button>
        <h2>{t('post_title')}</h2>
      </div>

      <form onSubmit={handlePublish}>
        <div className="field">
          <label>{t('f_what')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('f_what_ph')}
            required
          />
        </div>

        <div className="field">
          <label>{t('f_category')}</label>
          <div className="catgrid">
            {CATS.map((c) => (
              <button
                key={c}
                type="button"
                className={`catcell ${cat === c ? 'on' : ''}`}
                onClick={() => setCat(c)}
              >
                <div className="ic">{CATICON[c]}</div>
                {catName(c, lang)}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>{t('f_where')}</label>
          <div className="choices">
            <button
              type="button"
              className={`choice ${type === 'In-person' ? 'on' : ''}`}
              onClick={() => setType('In-person')}
            >
              <span className="ic">📍</span>
              {t('f_inperson')}
            </button>
            <button
              type="button"
              className={`choice ${type === 'Virtual' ? 'on' : ''}`}
              onClick={() => setType('Virtual')}
            >
              <span className="ic">🌐</span>
              {t('f_online')}
            </button>
          </div>
        </div>

        {type === 'In-person' && (
          <div className="field">
            <div ref={mapContainerRef} className="map" style={{ height: '200px' }} />
            <div className="maphint">
              {t('f_pin')} · {lat.toFixed(4)}, {lng.toFixed(4)}
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('f_address_ph')}
              style={{ marginTop: '10px' }}
            />
          </div>
        )}

        <div className="field">
          <label>{t('f_when')}</label>
          <div className="choices">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label>{t('f_desc')}</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={t('f_desc_ph')}
          />
        </div>

        <div className="field">
          <label>{t('f_photos')}</label>
          <div className="photos">
            {photos.map((p, i) => (
              <div key={i} className="photo-slot filled">
                <img src={p} alt="" />
                <button
                  type="button"
                  className="rm"
                  onClick={() => handleRemovePhoto(i)}
                >
                  ✕
                </button>
              </div>
            ))}
            {photos.length < 3 && (
              <label className="photo-slot cursor-pointer">
                ＋
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

        <div className="field">
          <label>{t('f_price_type')}</label>
          <div className="choices">
            <button
              type="button"
              className={`choice ${ptype === 'Flat' ? 'on' : ''}`}
              onClick={() => setPtype('Flat')}
            >
              {t('flat')}
            </button>
            <button
              type="button"
              className={`choice ${ptype === 'Hourly' ? 'on' : ''}`}
              onClick={() => setPtype('Hourly')}
            >
              {t('hourly')}
            </button>
          </div>
        </div>

        <div className="field">
          <label>{t('f_price')}</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={t('f_amount_ph')}
            min="50"
            step="10"
            inputMode="numeric"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg">
          {t('publish')}
        </button>
        <p
          style={{
            textAlign: 'center',
            fontSize: 'var(--fs-sm)',
            color: 'var(--slate)',
            marginTop: '12px',
          }}
        >
          {t('free_phase')}
        </p>
      </form>
    </div>
  );
};

