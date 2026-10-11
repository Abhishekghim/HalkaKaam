'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Job, Coordinates } from '../types';
import { loadMapbox, MAPBOX_TOKEN, MAPBOX_STYLE, createGeoJsonCircle, MapboxMap } from '../lib/mapbox';
import { npr } from '../lib/constants';
import { X, ArrowRight } from 'lucide-react';

interface WorkerFeedMapProps {
  jobs: { job: Job; dist: number | null }[];
  userPos: Coordinates;
  radius: number;
  onSelectJob: (job: Job) => void;
  lang: string;
}

export const WorkerFeedMap: React.FC<WorkerFeedMapProps> = ({
  jobs,
  userPos,
  radius,
  onSelectJob,
  lang,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<{ remove: () => void }[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    let alive = true;
    if (!mapContainerRef.current) return;

    (async () => {
      const mapboxgl = await loadMapbox();
      if (!alive || !mapContainerRef.current || !mapboxgl || !MAPBOX_TOKEN) return;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: MAPBOX_STYLE,
        center: [userPos.lng, userPos.lat],
        zoom: 12.8,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

      map.on('load', () => {
        if (!alive) return;

        // Radius circle around user
        const radiusGeoJson = createGeoJsonCircle([userPos.lng, userPos.lat], radius);
        map.addSource('user-radius', {
          type: 'geojson',
          data: radiusGeoJson,
        });

        map.addLayer({
          id: 'user-radius-fill',
          type: 'fill',
          source: 'user-radius',
          paint: {
            'fill-color': '#003893',
            'fill-opacity': 0.08,
          },
        });

        map.addLayer({
          id: 'user-radius-line',
          type: 'line',
          source: 'user-radius',
          paint: {
            'line-color': '#003893',
            'line-width': 1.5,
            'line-dasharray': [3, 3],
          },
        });
      });

      mapRef.current = map;
    })();

    return () => {
      alive = false;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // single map initialization for feed view

  // Update radius circle if radius or userPos changes without recreating map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource('user-radius') as { setData?: (data: unknown) => void } | undefined;
    if (source && typeof source.setData === 'function') {
      source.setData(createGeoJsonCircle([userPos.lng, userPos.lat], radius));
    }
  }, [userPos.lat, userPos.lng, radius]);

  // Sync job markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let alive = true;
    (async () => {
      const mapboxgl = await loadMapbox();
      if (!alive || !mapRef.current || !mapboxgl) return;

      // Clear previous markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Add user location marker
      const userDotEl = document.createElement('div');
      userDotEl.className = 'w-4 h-4 rounded-full bg-[var(--primary)] border-2 border-white shadow-md animate-pulse';
      const userMarker = new mapboxgl.Marker({ element: userDotEl })
        .setLngLat([userPos.lng, userPos.lat])
        .addTo(mapRef.current);
      markersRef.current.push(userMarker);

      // Add markers for jobs with valid coordinates
      jobs.forEach(({ job }) => {
        if (job.lat === undefined || job.lng === undefined || job.type === 'Virtual') return;

        const el = document.createElement('div');
        el.className = `cursor-pointer transition-transform hover:scale-110 active:scale-95 px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-md flex items-center gap-1 border ${
          job.urgent
            ? 'bg-[var(--accent-fill)] text-white border-white'
            : 'bg-[var(--surface)] text-[var(--primary)] border-[var(--line)]'
        }`;
        el.innerHTML = `<span>${npr(job.price)}</span>`;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedJob(job);
          mapRef.current?.flyTo({
            center: [job.lng, job.lat],
            zoom: 14.2,
            speed: 1.2,
          });
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([job.lng, job.lat])
          .addTo(mapRef.current!);

        markersRef.current.push(marker);
      });
    })();

    return () => {
      alive = false;
    };
  }, [jobs, userPos]);

  return (
    <div className="relative w-full h-[calc(100vh-230px)] min-h-[460px] rounded-2xl overflow-hidden border border-[var(--line)] shadow-xs bg-[var(--surface-2)]">
      <div ref={mapContainerRef} className="w-full h-full" />

      {!MAPBOX_TOKEN && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--surface)]/95 p-6 text-center">
          <p className="text-sm font-bold text-[var(--fg)]">Mapbox Token Required</p>
          <p className="text-xs text-[var(--fg-muted)] mt-1 max-w-sm">
            Set <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded font-mono text-[var(--fg)]">NEXT_PUBLIC_MAPBOX_TOKEN</code> in <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded font-mono text-[var(--fg)]">.env.local</code> to explore jobs on the interactive map.
          </p>
        </div>
      )}

      {/* Selected Job Floating Card */}
      {selectedJob && (
        <div className="absolute bottom-4 left-4 right-4 z-20 max-w-md mx-auto bg-[var(--surface)] rounded-2xl p-4 shadow-xl border border-[var(--line)] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider">
                {selectedJob.cat}
              </span>
              <h3 className="text-sm font-extrabold text-[var(--fg)] truncate mt-0.5">
                {selectedJob.title}
              </h3>
              <p className="text-xs text-[var(--fg-muted)] truncate mt-0.5">
                {selectedJob.address || 'Kathmandu'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedJob(null)}
              aria-label="Close card"
              className="w-6 h-6 rounded-full bg-[var(--surface-2)] hover:bg-[var(--line)] text-[var(--fg-muted)] hover:text-[var(--fg)] flex items-center justify-center text-xs flex-none cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-[var(--line)] flex items-center justify-between">
            <div className="text-base font-extrabold text-[var(--primary)] font-mono">
              {npr(selectedJob.price)}
              <span className="text-xs font-normal text-[var(--fg-muted)] ml-1">
                {selectedJob.ptype === 'Hourly' ? '/hr' : ''}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectJob(selectedJob)}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:bg-[var(--primary-hover)] transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <span>{lang === 'ne' ? 'विवरण हेर्नुहोस्' : 'View Details'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
