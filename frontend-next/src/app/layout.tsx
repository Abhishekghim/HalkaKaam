import type { Metadata, Viewport } from 'next';
import { Inter, Mukta } from 'next/font/google';
import 'mapbox-gl/dist/mapbox-gl.css';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import { PwaInstallPrompt } from '../components/ui/PwaInstallPrompt';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const mukta = Mukta({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['devanagari', 'latin'],
  variable: '--font-mukta',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#003893',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'साझा काम · Sajha Kaam',
  description: 'A peer-to-peer gig marketplace for Nepal. No work is too small — साझा काम, ठूलो सम्मान.',
  applicationName: 'Sajha Kaam',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sajha Kaam',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mukta.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var t = localStorage.getItem('hk-theme');
                var d = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                var theme = t || (d ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', theme);
                if (theme === 'dark') document.documentElement.classList.add('dark');
              } catch(e) {}
            })();
            if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
              window.addEventListener('load', function() {
                if ('caches' in window) {
                  caches.keys().then(function(keys) {
                    keys.forEach(function(k) {
                      if (k !== 'sajha-kaam-v4') caches.delete(k);
                    });
                  });
                }
                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                  reg.update();
                }).catch(function(){});
              });
            }`,
          }}
        />
      </head>
      <body>
        <AppProvider>
          <PwaInstallPrompt />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
