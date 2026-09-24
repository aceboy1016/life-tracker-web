import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-noto-jp',
  preload: false,
});

export const metadata: Metadata = {
  title: 'LifeTracker - 最後にいつやったか記録するアプリ',
  description: '最後にいつ、何をしたかを記録・追跡するライフログアプリ',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LifeTracker',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eeeeec' },
    { media: '(prefers-color-scheme: dark)', color: '#0e0e0d' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`}>
      <body className="font-sans bg-canvas text-ink antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
