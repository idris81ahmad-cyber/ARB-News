import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ARB News — The Pulse of Nigeria';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 72,
          background: 'linear-gradient(135deg, #006400 0%, #007a33 55%, #0b3d1f 100%)',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 42, marginBottom: 16 }}>🇳🇬</div>
        <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -1 }}>
          ARB News
        </div>
        <div style={{ fontSize: 36, color: '#FFD700', marginTop: 12 }}>
          The Pulse of Nigeria
        </div>
        <div style={{ fontSize: 24, marginTop: 28, opacity: 0.9, maxWidth: 800 }}>
          Politics · Sports · Business · Culture · Live Nigerian headlines
        </div>
      </div>
    ),
    { ...size },
  );
}
