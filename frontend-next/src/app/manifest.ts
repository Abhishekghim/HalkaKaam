import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'साझा काम · Sajha Kaam',
    short_name: 'Sajha Kaam',
    description: 'Hyperlocal peer-to-peer gig marketplace for Nepal. No work is too small — साझा काम, ठूलो सम्मान.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F8FAFC',
    theme_color: '#003893',
    scope: '/',
    lang: 'ne',
    categories: ['productivity', 'business', 'utilities'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

