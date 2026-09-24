import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#2d2b28' }}>
        <svg width="180" height="180" viewBox="0 0 40 40">
          <path d="M20 9.5a10.5 10.5 0 1 1-10.5 10.5" fill="none" stroke="#f7f6f3" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="9.5" cy="20" r="3" fill="#9fb4a8" />
          <path d="M20 14.5V20l3.5 2.5" fill="none" stroke="#f7f6f3" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    size
  );
}
