import type { ReactNode } from 'react';

/** Shared ARB News chrome for Open Graph / Twitter image cards. */
export function OgBrandShell({
  eyebrow,
  title,
  footer,
}: {
  eyebrow?: string;
  title: string;
  footer?: string;
}): ReactNode {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 56,
        background: 'linear-gradient(135deg, #006400 0%, #007a33 50%, #0b3d1f 100%)',
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 40 }}>🇳🇬</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>
            ARB News
          </div>
          <div style={{ fontSize: 18, color: '#FFD700' }}>The Pulse of Nigeria</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1040 }}>
        {eyebrow ? (
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              background: '#FFD700',
              color: '#111',
              fontSize: 20,
              fontWeight: 700,
              padding: '8px 16px',
              borderRadius: 999,
            }}
          >
            {eyebrow}
          </div>
        ) : null}
        <div
          style={{
            fontSize: title.length > 90 ? 44 : 52,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: -1,
          }}
        >
          {title}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 22,
          opacity: 0.95,
          borderTop: '2px solid rgba(255, 215, 0, 0.45)',
          paddingTop: 20,
        }}
      >
        <div>{footer ?? 'arb-news-next.vercel.app'}</div>
        <div style={{ color: '#FFD700', fontWeight: 700 }}>Live Naija headlines</div>
      </div>
    </div>
  );
}
