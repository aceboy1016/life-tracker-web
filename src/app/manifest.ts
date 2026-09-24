import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LifeTracker',
    short_name: 'LifeTracker',
    description: '最後にいつ、何をしたかを記録・追跡するライフログアプリ',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f6f3',
    theme_color: '#f7f6f3',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
