import type { Metadata, Viewport } from 'next';
import { Inter, Zen_Kaku_Gothic_New } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const zen = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-zen',
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
  // Prevents iOS from zooming into focused inputs and leaving the page zoomed.
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f6f3' },
    { media: '(prefers-color-scheme: dark)', color: '#161615' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${inter.variable} ${zen.variable}`}>
      <body className="font-sans bg-canvas text-ink antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
