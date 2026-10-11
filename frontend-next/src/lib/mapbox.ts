import type mapboxgl from 'mapbox-gl';

export type MapboxLib = typeof mapboxgl;
export type MapboxMap = mapboxgl.Map;

export const MAPBOX_TOKEN = (process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '').trim();
export const MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v12';

/**
 * Lazy loads mapbox-gl on the client side with the configured public access token.
 */
export async function loadMapbox(): Promise<MapboxLib | null> {
  if (typeof window === 'undefined') return null;
  const mod = await import('mapbox-gl');
  const lib = ((mod as unknown as { default?: MapboxLib }).default ?? mod) as MapboxLib;
  lib.accessToken = MAPBOX_TOKEN;
  return lib;
}

/**
 * Generates a GeoJSON Polygon representing a circle at a given [lng, lat] with a radius in kilometers.
 */
export function createGeoJsonCircle(
  center: [number, number],
  radiusInKm: number,
  points = 64
): GeoJSON.Feature<GeoJSON.Polygon> {
  const [lng, lat] = center;
  const coords: [number, number][] = [];
  const distanceX = radiusInKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  const distanceY = radiusInKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([lng + x, lat + y]);
  }
  // Close polygon
  coords.push(coords[0]);

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
  };
}

/**
 * SPA Shared Map Manager (Trick 2 & Single-Page Navigation)
 *
 * Keeps a single Mapbox GL instance alive in memory across the entire app session.
 * When users navigate from Job A to Job B, or switch between Map/List views,
 * the existing map container is reparented and smoothly flies to the new coordinates.
 *
 * Cost: Exactly 1 map load instead of 1 load per job view!
 */
class SharedMapManager {
  private map: mapboxgl.Map | null = null;
  private container: HTMLDivElement | null = null;
  private initPromise: Promise<mapboxgl.Map | null> | null = null;
  private sourceId = 'privacy-area';

  async getOrCreateMap(
    targetEl: HTMLElement,
    initialCoords: [number, number],
    zoom = 13.5
  ): Promise<mapboxgl.Map | null> {
    if (typeof window === 'undefined') return null;
    const mapboxgl = await loadMapbox();
    if (!mapboxgl || !MAPBOX_TOKEN) return null;

    if (this.map && this.container) {
      // Reparent existing container (0 map loads!)
      if (this.container.parentElement !== targetEl) {
        targetEl.appendChild(this.container);
      }
      this.map.resize();
      this.map.flyTo({
        center: initialCoords,
        zoom: zoom,
        essential: true,
        speed: 1.4,
      });
      return this.map;
    }

    if (this.initPromise) {
      const m = await this.initPromise;
      if (m && this.container && this.container.parentElement !== targetEl) {
        targetEl.appendChild(this.container);
        m.resize();
        m.flyTo({ center: initialCoords, zoom: zoom });
      }
      return m;
    }

    this.initPromise = (async () => {
      this.container = document.createElement('div');
      this.container.style.width = '100%';
      this.container.style.height = '100%';
      this.container.className = 'hk-reusable-map-container';

      targetEl.appendChild(this.container);

      const map = new mapboxgl.Map({
        container: this.container,
        style: MAPBOX_STYLE,
        center: initialCoords,
        zoom: zoom,
        attributionControl: false,
        scrollZoom: true,
        dragPan: true,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
      this.map = map;

      return new Promise<mapboxgl.Map>((resolve) => {
        map.once('load', () => {
          resolve(map);
        });
      });
    })();

    return this.initPromise;
  }

  /**
   * Trick 3: Show an Approximate "Area Circle" dynamically
   * Updates existing GeoJSON source without reloading the map!
   */
  updatePrivacyCircle(center: [number, number], radiusKm = 0.45) {
    if (!this.map) return;
    const geojson = createGeoJsonCircle(center, radiusKm);

    const apply = () => {
      if (!this.map) return;
      const source = this.map.getSource(this.sourceId) as mapboxgl.GeoJSONSource | undefined;
      if (source) {
        source.setData(geojson);
      } else {
        this.map.addSource(this.sourceId, {
          type: 'geojson',
          data: geojson,
        });

        if (!this.map.getLayer('privacy-area-fill')) {
          this.map.addLayer({
            id: 'privacy-area-fill',
            type: 'fill',
            source: this.sourceId,
            paint: {
              'fill-color': '#003893',
              'fill-opacity': 0.15,
            },
          });
        }

        if (!this.map.getLayer('privacy-area-line')) {
          this.map.addLayer({
            id: 'privacy-area-line',
            type: 'line',
            source: this.sourceId,
            paint: {
              'line-color': '#003893',
              'line-width': 2,
              'line-dasharray': [2, 2],
            },
          });
        }
      }
    };

    if (this.map.isStyleLoaded()) {
      apply();
    } else {
      this.map.once('load', apply);
    }
  }

  /**
   * Detaches the map DOM element and parks it offscreen
   * keeping WebGL alive in background for subsequent views.
   */
  detachFrom(parentEl: HTMLElement) {
    if (this.container && this.container.parentElement === parentEl) {
      let pool = document.getElementById('hk-shared-map-pool');
      if (!pool) {
        pool = document.createElement('div');
        pool.id = 'hk-shared-map-pool';
        pool.style.display = 'none';
        document.body.appendChild(pool);
      }
      pool.appendChild(this.container);
    }
  }

  getMap(): mapboxgl.Map | null {
    return this.map;
  }
}

export const sharedMapManager = new SharedMapManager();
