import type * as Leaflet from 'leaflet';

export type LeafletLib = typeof Leaflet;
export type LeafletMap = Leaflet.Map;

/** Leaflet touches `window`, so it must be loaded lazily on the client. */
export async function loadLeaflet(): Promise<LeafletLib> {
  const mod = await import('leaflet');
  return ((mod as unknown as { default?: LeafletLib }).default ?? mod) as LeafletLib;
}

export function addTiles(L: LeafletLib, map: LeafletMap) {
  return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap',
  }).addTo(map);
}

export function pinIcon(L: LeafletLib, label = '📍') {
  return L.divIcon({
    className: 'hk-pin',
    html: `<div class="pinbox">${label}</div>`,
    iconSize: [0, 0],
  });
}

