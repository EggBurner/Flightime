'use client';
import { useRouter } from 'next/navigation';
import { useFlightTime } from '../hooks/useFlightTime';
import { useAudio } from '../providers/AudioProvider';

const SPEED_CYCLE = [1, 2, 4, 8, 16] as const;

export default function BriefingPage() {
  const router = useRouter();
  const { h, m, active, speed, setSpeed, origin, destination } = useFlightTime();
  const { cabinOn, engineOn, toggleCabin, toggleEngine } = useAudio();

  const cycleSpeed = () => {
    const idx = SPEED_CYCLE.indexOf(speed as typeof SPEED_CYCLE[number]);
    setSpeed(SPEED_CYCLE[(idx + 1) % SPEED_CYCLE.length]);
  };

  const hNum = parseInt(h, 10);
  const mNum = parseInt(m, 10);
  const clockLabel = hNum > 0 ? `${hNum}h ${mNum}m` : `${mNum}m`;

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0d0d0d',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      gap: '1.5rem',
      padding: '2rem',
    }}>
      {/* Pill label */}
      <div style={{
        border: '1px solid #a855f7',
        borderRadius: '999px',
        padding: '0.25rem 0.85rem',
        fontSize: '0.65rem',
        letterSpacing: '0.18em',
        color: '#a855f7',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
      }}>
        <span style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: '#a855f7',
          boxShadow: '0 0 6px #a855f7',
          flexShrink: 0,
          display: 'inline-block',
        }} />
        IN-FLIGHT
      </div>

      <p style={{ fontSize: '0.85rem', color: '#444', margin: 0 }}>
        Deep immersion.
      </p>

      {/* Clock */}
      <div style={{ textAlign: 'center', lineHeight: 1 }}>
        <div style={{
          fontSize: 'clamp(3.5rem, 15vw, 8rem)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: active ? '#c084fc' : '#2a2a2a',
          textShadow: active
            ? '0 0 40px rgba(168,85,247,0.6), 0 0 80px rgba(168,85,247,0.3), 0 0 120px rgba(168,85,247,0.15)'
            : 'none',
          transition: 'color 0.4s, text-shadow 0.4s',
        }}>
          {active ? clockLabel : '--'}
        </div>
        <div style={{
          fontSize: '0.6rem',
          letterSpacing: '0.22em',
          color: '#333',
          textTransform: 'uppercase',
          marginTop: '0.5rem',
        }}>
          Time Remaining
        </div>
      </div>

      {/* Info card */}
      <div style={{
        border: '1px solid #1e1e1e',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        width: '100%',
        maxWidth: '340px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        background: '#111',
      }}>
        {/* Route row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.55rem', letterSpacing: '0.15em', color: '#444', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Origin</div>
            <div style={{ fontSize: '0.95rem', color: '#ccc', fontWeight: 500 }}>
              {origin || '—'}
            </div>
          </div>
          <svg width="20" height="8" viewBox="0 0 20 8" fill="none" style={{ flexShrink: 0, opacity: 0.25 }}>
            <path d="M0 4h18M14 1l4 3-4 3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: '0.55rem', letterSpacing: '0.15em', color: '#444', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Destination</div>
            <div style={{ fontSize: '0.95rem', color: '#a855f7', fontWeight: 500 }}>
              {destination || '—'}
            </div>
          </div>
        </div>

        {/* Controls row */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Btn onClick={cycleSpeed} label={`${speed}×`} active={false} neutral />
          <Btn onClick={toggleCabin} label="Cabin Chime" active={cabinOn} />
          <Btn onClick={toggleEngine} label="Engine" active={engineOn} />
        </div>
      </div>

      {/* Map button */}
      <button
        onClick={() => router.back()}
        style={{
          marginTop: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: '#111',
          border: '1px solid #222',
          borderRadius: '8px',
          color: '#888',
          padding: '0.55rem 1.25rem',
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          cursor: 'pointer',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Map
      </button>
    </main>
  );
}

function Btn({ active, onClick, label, neutral }: {
  active: boolean;
  onClick: () => void;
  label: string;
  neutral?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        border: `1px solid ${active ? '#a855f7' : '#2a2a2a'}`,
        borderRadius: '6px',
        color: active ? '#a855f7' : neutral ? '#ccc' : '#555',
        padding: '0.3rem 0.7rem',
        fontSize: '0.7rem',
        letterSpacing: '0.05em',
        cursor: 'pointer',
        transition: 'border-color 0.15s, color 0.15s',
      }}
    >
      {label}
    </button>
  );
}
