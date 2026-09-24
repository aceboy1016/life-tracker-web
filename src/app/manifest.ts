import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LifeTracker',
    short_name: 'LifeTracker',
    description: '最後にいつ、何をしたかを記録・追跡するライフログアプリ',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f4ef',
    theme_color: '#f5f4ef',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
