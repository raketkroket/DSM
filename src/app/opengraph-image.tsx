import { ImageResponse } from 'next/og';

export const alt = 'Dedicated Security Management B.V. — Uw veiligheid, onze verantwoordelijkheid.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#0b1e33',
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 64, height: 64, border: '3px solid #ffffff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 600 }}>
            D
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 30, fontWeight: 600 }}>Dedicated</span>
            <span style={{ fontSize: 16, letterSpacing: 6, color: '#a9bdcc' }}>SECURITY MANAGEMENT</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 84, lineHeight: 1, letterSpacing: -3, fontWeight: 600 }}>Uw veiligheid,</span>
          <span style={{ fontSize: 84, lineHeight: 1.1, letterSpacing: -2, color: '#a9bdcc', fontStyle: 'italic' }}>onze verantwoordelijkheid.</span>
        </div>
        <div style={{ display: 'flex', fontSize: 22, color: 'rgba(255,255,255,0.7)' }}>
          Bouwplaatsen · Evenementen · Objecten · Cameratoezicht · Risicoanalyses
        </div>
      </div>
    ),
    size,
  );
}
