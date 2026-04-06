'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAudio } from '../providers/AudioProvider';
import 'leaflet/dist/leaflet.css';

const EARTH_RADIUS_KM = 6371;
const SPEED_OPTIONS = [1, 2, 4, 8, 16];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const φ1 = toRad(lat1), φ2 = toRad(lat2);
  const dφ = toRad(lat2 - lat1);
  const dλ = toRad(lng2 - lng1);
  const a = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

function greatCirclePoints(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  numPoints = 120
): [number, number][] {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const φ1 = toRad(lat1), λ1 = toRad(lng1);
  const φ2 = toRad(lat2), λ2 = toRad(lng2);

  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((φ2 - φ1) / 2) ** 2 +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2
      )
    );

  if (d === 0) return [[lat1, lng1]];

  const points: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);

    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);

    const φ = Math.atan2(z, Math.sqrt(x * x + y * y));
    const λ = Math.atan2(y, x);

    points.push([toDeg(φ), toDeg(λ)]);
  }

  // Unwrap longitudes so consecutive points never jump >180°.
  // Without this, paths crossing the antimeridian (e.g. LA→Sydney via Pacific)
  // get drawn the wrong way around the globe.
  for (let i = 1; i < points.length; i++) {
    const diff = points[i][1] - points[i - 1][1];
    if (diff > 180) points[i][1] -= 360;
    else if (diff < -180) points[i][1] += 360;
  }

  return points;
}

function getBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const φ1 = toRad(lat1), φ2 = toRad(lat2);
  const dλ = toRad(lng2 - lng1);
  const y = Math.sin(dλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function makeDotIcon(L: typeof import('leaflet'), color: string) {
  return L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 10px ${color}88"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function makePlaneIcon(L: typeof import('leaflet'), rotation: number) {
  return L.divIcon({
    html: `
      <div style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;">
        <svg width="34" height="34" viewBox="0 0 34 34" style="transform:rotate(${rotation}deg);filter:drop-shadow(0 0 8px #a855f7cc);transition:transform 0.05s linear" xmlns="http://www.w3.org/2000/svg">
          <!-- Top-down commercial jet silhouette, nose pointing up (y=0) -->
          <path d="
            M 17 2
            C 18.2 5, 18.8 9, 18.8 13
            L 32 20
            L 31 22
            L 18.8 18.5
            L 18.8 26
            L 24 30
            L 23 31.5
            L 17.5 29
            L 17 31
            L 16.5 29
            L 11 31.5
            L 10 30
            L 15.2 26
            L 15.2 18.5
            L 3 22
            L 2 20
            L 15.2 13
            C 15.2 9, 15.8 5, 17 2
            Z
          " fill="#c084fc"/>
          <!-- Cockpit highlight -->
          <ellipse cx="17" cy="7" rx="1.2" ry="2.5" fill="#e9d5ff" opacity="0.55"/>
        </svg>
      </div>`,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function parseParams(): { olat: number; olng: number; dlat: number; dlng: number; origin: string; destination: string } | null {
  const params = new URLSearchParams(window.location.search);
  const olat = parseFloat(params.get('olat') ?? '');
  const olng = parseFloat(params.get('olng') ?? '');
  const dlat = parseFloat(params.get('dlat') ?? '');
  const dlng = parseFloat(params.get('dlng') ?? '');
  if (isNaN(olat) || isNaN(olng) || isNaN(dlat) || isNaN(dlng)) return null;
  return {
    olat, olng, dlat, dlng,
    origin: params.get('origin') ?? '',
    destination: params.get('destination') ?? '',
  };
}

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function FlightMap() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const planeMarkerRef = useRef<import('leaflet').Marker | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animStateRef = useRef({
    elapsedSeconds: 0,
    lastTimestamp: 0,
    speed: 1,
    totalSeconds: 0,
    done: false,
    points: [] as [number, number][],
  });
  const lastRenderedSecond = useRef(-1);
  const saveKeyRef = useRef<string | null>(null);

  const [remaining, setRemaining] = useState(0);
  const [speed, setSpeed] = useState(() => {
    const raw = parseFloat(localStorage.getItem('ft_speed') ?? '');
    return SPEED_OPTIONS.includes(raw) ? raw : 1;
  });

  const handleSpeedChange = (s: number) => {
    setSpeed(s);
    animStateRef.current.speed = s;
    localStorage.setItem('ft_speed', String(s));
  };

  const { cabinOn, engineOn, cabinVol, engineVol, toggleCabin, toggleEngine, setCabinVolume, setEngineVolume } = useAudio();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return;

      const coords = parseParams();
      const posA: [number, number] = coords ? [coords.olat, coords.olng] : [51.5, -0.1];
      const posB: [number, number] = coords ? [coords.dlat, coords.dlng] : [40.71, -74.01];

      const minZoom = Math.ceil(Math.log2(containerRef.current.clientHeight / 256));

      const map = L.map(containerRef.current, {
        center: [30, -20],
        zoom: minZoom,
        minZoom,
        zoomControl: true,
        worldCopyJump: false,
        maxBounds: [[-85.051129, -360], [85.051129, 360]],
        maxBoundsViscosity: 1.0,
      });
      mapRef.current = map;

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      const points = greatCirclePoints(posA[0], posA[1], posB[0], posB[1]);

      const routeLine = L.polyline(points, {
        color: '#a855f7',
        weight: 2,
        opacity: 0.75,
        dashArray: '8 5',
      }).addTo(map);

      // Place markers using unwrapped coords so they appear in the same world
      // copy as the route (critical for antimeridian-crossing flights).
      L.marker(points[0], { icon: makeDotIcon(L, '#166534') }).addTo(map);
      L.marker(points[points.length - 1], { icon: makeDotIcon(L, '#991b1b') }).addTo(map);

      // Fit to the polyline bounds so routes crossing the antimeridian
      // (e.g. LA→Sydney via Pacific) center on the actual path, not the short
      // straight line between origin and destination.
      map.fitBounds(routeLine.getBounds(), { padding: [60, 60] });

      // Flight duration via Haversine
      const distanceKm = haversineKm(posA[0], posA[1], posB[0], posB[1]);
      const cruiseSpeed = distanceKm > 6000 ? 800 : distanceKm > 4000 ? 700 : 600;
      const totalSeconds = (distanceKm / cruiseSpeed) * 3600;

      // Persist/restore progress across page refreshes
      const saveKey = `ft_progress_${posA[0]}_${posA[1]}_${posB[0]}_${posB[1]}`;

      // Remove any stale progress from previous flights
      Object.keys(localStorage)
        .filter(k => k.startsWith('ft_progress_') && k !== saveKey)
        .forEach(k => localStorage.removeItem(k));

      const savedElapsed = parseFloat(localStorage.getItem(saveKey) ?? '');
      const resumeAt = (!isNaN(savedElapsed) && savedElapsed < totalSeconds) ? savedElapsed : 0;

      // Publish active flight metadata so /briefing can pick up the same timer
      saveKeyRef.current = saveKey;
      localStorage.setItem('ft_active', JSON.stringify({
        saveKey,
        totalSeconds,
        origin: coords?.origin ?? '',
        destination: coords?.destination ?? '',
      }));

      animStateRef.current.points = points;
      animStateRef.current.totalSeconds = totalSeconds;
      animStateRef.current.elapsedSeconds = resumeAt;
      animStateRef.current.lastTimestamp = 0;
      animStateRef.current.done = false;
      animStateRef.current.speed = parseFloat(localStorage.getItem('ft_speed') ?? '') || 1;
      lastRenderedSecond.current = -1;
      setRemaining(totalSeconds - resumeAt);

      // Save progress to localStorage every 5 seconds of real time
      saveIntervalRef.current = setInterval(() => {
        if (animStateRef.current.done) return;
        localStorage.setItem(saveKey, String(animStateRef.current.elapsedSeconds));
      }, 5000);

      // Plane marker — created once, position/rotation updated via DOM
      const initBearing = getBearing(posA[0], posA[1], points[1]?.[0] ?? posB[0], points[1]?.[1] ?? posB[1]);
      const planeMarker = L.marker(posA, {
        icon: makePlaneIcon(L, initBearing),
        zIndexOffset: 1000,
      }).addTo(map);
      planeMarkerRef.current = planeMarker;

      // Animation loop
      const animate = (timestamp: number) => {
        const state = animStateRef.current;
        if (state.lastTimestamp === 0) state.lastTimestamp = timestamp;

        const dtSeconds = ((timestamp - state.lastTimestamp) / 1000) * state.speed;
        state.lastTimestamp = timestamp;

        if (!state.done) {
          state.elapsedSeconds = Math.min(state.elapsedSeconds + dtSeconds, state.totalSeconds);
          const rem = state.totalSeconds - state.elapsedSeconds;
          const remRounded = Math.round(rem);

          if (remRounded !== lastRenderedSecond.current) {
            lastRenderedSecond.current = remRounded;
            setRemaining(rem);
          }

          const pts = state.points;
          const f = state.elapsedSeconds / state.totalSeconds;
          const rawIdx = f * (pts.length - 1);
          const idx = Math.min(Math.floor(rawIdx), pts.length - 2);
          const localF = rawIdx - idx;

          const pt = pts[idx];
          const ptNext = pts[Math.min(idx + 1, pts.length - 1)];
          const interpLat = pt[0] + (ptNext[0] - pt[0]) * localF;
          const interpLng = pt[1] + (ptNext[1] - pt[1]) * localF;
          const rot = getBearing(pt[0], pt[1], ptNext[0], ptNext[1]);

          // Update position and rotation without recreating the icon
          planeMarker.setLatLng([interpLat, interpLng]);
          const el = planeMarker.getElement();
          if (el) {
            const svg = el.querySelector('svg') as SVGElement | null;
            if (svg) svg.style.transform = `rotate(${rot}deg)`;
          }

          if (state.elapsedSeconds >= state.totalSeconds) {
            state.done = true;
            setRemaining(0);
            localStorage.removeItem(saveKey);
            return;
          }
        }

        animFrameRef.current = requestAnimationFrame(animate);
      };

      animFrameRef.current = requestAnimationFrame(animate);
    });

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      // Flush current elapsed so /briefing resumes from an accurate position
      const { elapsedSeconds, done } = animStateRef.current;
      if (!done && saveKeyRef.current) localStorage.setItem(saveKeyRef.current, String(elapsedSeconds));
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const [h, m, s] = (() => {
    const total = Math.max(0, Math.round(remaining));
    return [
      String(Math.floor(total / 3600)).padStart(2, '0'),
      String(Math.floor((total % 3600) / 60)).padStart(2, '0'),
      String(total % 60).padStart(2, '0'),
    ];
  })();

  const speedLabel = speed === 1 ? 'REAL TIME' : `${speed}× SPEED`;

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Responsive HUD styles */}
      <style>{`
        .fhud-wrap {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 1000;
          user-select: none;
          font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
          pointer-events: none;
        }
        .fhud-card {
          background: rgba(8,4,22,0.84);
          border: 1px solid rgba(168,85,247,0.22);
          border-radius: 14px;
          padding: 16px 28px 14px;
          display: flex;
          flex-direction: column;
          gap: 0;
          box-shadow: 0 0 48px rgba(168,85,247,0.07), 0 4px 28px rgba(0,0,0,0.55);
          backdrop-filter: blur(12px);
        }
        .fhud-label {
          font-size: 10px;
          letter-spacing: 5px;
          color: rgba(200,180,255,0.42);
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .fhud-clock {
          display: flex;
          align-items: center;
          line-height: 1;
        }
        .fhud-digit {
          font-size: 58px;
          font-weight: 300;
          color: #f0eaff;
          letter-spacing: -2px;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }
        .fhud-colon {
          font-size: 42px;
          font-weight: 300;
          color: #7c3aed;
          line-height: 1;
          margin: 0 3px;
          padding-bottom: 3px;
        }
        .fhud-status-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          font-size: 10px;
          letter-spacing: 3px;
          color: #a855f7;
          text-transform: uppercase;
          font-weight: 500;
        }
        .fhud-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #a855f7;
          box-shadow: 0 0 7px #a855f7;
          flex-shrink: 0;
        }
        .fhud-speed-row {
          display: flex;
          gap: 4px;
          margin-top: 8px;
          pointer-events: auto;
        }
        .fhud-spdbtn {
          border-radius: 5px;
          font-size: 10px;
          font-weight: 600;
          font-family: inherit;
          padding: 2px 7px;
          cursor: pointer;
          letter-spacing: 0.5px;
          transition: all 0.12s ease;
        }
        .fhud-audio-panel {
          margin-top: 8px;
          pointer-events: auto;
          border-top: 1px solid rgba(168,85,247,0.12);
          padding-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .fhud-audio-label {
          font-size: 10px;
          letter-spacing: 4px;
          color: rgba(200,180,255,0.38);
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 2px;
        }
        .fhud-audio-row {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .fhud-audio-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .fhud-audio-dot.on {
          background: #a855f7;
          box-shadow: 0 0 6px #a855f7;
        }
        .fhud-audio-dot.off {
          background: rgba(168,85,247,0.2);
        }
        .fhud-audio-name {
          flex: 1;
          font-size: 10px;
          color: rgba(220,210,255,0.65);
          font-weight: 500;
          letter-spacing: 0.3px;
          white-space: nowrap;
        }
        .fhud-audio-vol {
          width: 52px;
          height: 3px;
          accent-color: #a855f7;
          cursor: pointer;
          opacity: 0.7;
        }
        .fhud-audio-vol:hover { opacity: 1; }
        .fhud-audio-btn {
          background: transparent;
          border: 1px solid rgba(168,85,247,0.25);
          border-radius: 4px;
          color: rgba(168,85,247,0.55);
          font-size: 9px;
          padding: 2px 6px;
          cursor: pointer;
          font-family: inherit;
          font-weight: 600;
          letter-spacing: 0.5px;
          transition: all 0.12s ease;
          white-space: nowrap;
        }
        .fhud-audio-btn.on {
          background: rgba(168,85,247,0.2);
          border-color: rgba(168,85,247,0.6);
          color: #e9d5ff;
        }
        .fhud-audio-btn:hover {
          border-color: rgba(168,85,247,0.5);
          color: #d8b4fe;
        }
        .fhud-briefing-row {
          margin-top: 6px;
          pointer-events: auto;
        }
        .fhud-briefing {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(168,85,247,0.35);
          border-radius: 5px;
          color: #c4b5fd;
          font-family: inherit;
          font-size: 10px;
          font-weight: 600;
          padding: 4px 0;
          cursor: pointer;
          letter-spacing: 2px;
          text-transform: uppercase;
          transition: all 0.15s ease;
        }
        .fhud-briefing:hover {
          background: rgba(168,85,247,0.18);
          border-color: rgba(168,85,247,0.6);
        }
        @media (max-width: 640px) {
          .fhud-card {
            padding: 8px 14px 8px;
            border-radius: 10px;
          }
          .fhud-label {
            font-size: 7px;
            letter-spacing: 3px;
            margin-bottom: 4px;
          }
          .fhud-digit {
            font-size: 28px;
            letter-spacing: -1px;
          }
          .fhud-colon {
            font-size: 20px;
            margin: 0 2px;
            padding-bottom: 2px;
          }
          .fhud-status-row {
            font-size: 7px;
            letter-spacing: 2px;
            margin-top: 5px;
          }
          .fhud-dot {
            width: 5px;
            height: 5px;
          }
          .fhud-speed-row {
            margin-top: 5px;
            gap: 3px;
          }
          .fhud-spdbtn {
            font-size: 8px;
            padding: 1px 5px;
          }
          .fhud-briefing-row {
            margin-top: 4px;
          }
          .fhud-briefing {
            font-size: 8px;
            padding: 3px 0;
            letter-spacing: 1.5px;
          }
          .fhud-audio-panel {
            margin-top: 5px;
            padding-top: 5px;
            gap: 3px;
          }
          .fhud-audio-label {
            font-size: 7px;
            letter-spacing: 3px;
          }
          .fhud-audio-name {
            font-size: 8px;
          }
          .fhud-audio-btn {
            font-size: 7px;
            padding: 1px 4px;
          }
          .fhud-audio-vol {
            width: 36px;
          }
        }
      `}</style>

      {/* HUD — top-right */}
      <div className="fhud-wrap">
        <div className="fhud-card">
          {/* Label */}
          <span className="fhud-label">Time Remaining</span>

          {/* Clock */}
          <div className="fhud-clock">
            {[h, m, s].map((unit, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <span className="fhud-digit">{unit}</span>
                {i < 2 && <span className="fhud-colon">:</span>}
              </span>
            ))}
          </div>

          {/* Status row */}
          <div className="fhud-status-row">
            <span className="fhud-dot" />
            {speedLabel}
          </div>

          {/* Speed buttons row */}
          <div className="fhud-speed-row">
            {SPEED_OPTIONS.map((opt) => {
              const active = speed === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleSpeedChange(opt)}
                  className="fhud-spdbtn"
                  style={{
                    background: active ? 'rgba(168,85,247,0.25)' : 'transparent',
                    border: `1px solid ${active ? 'rgba(168,85,247,0.7)' : 'rgba(168,85,247,0.18)'}`,
                    color: active ? '#e9d5ff' : 'rgba(168,85,247,0.4)',
                    textShadow: active ? '0 0 8px #a855f7' : 'none',
                  }}
                >
                  {opt}×
                </button>
              );
            })}
          </div>

          {/* Audio panel */}
          <div className="fhud-audio-panel">
            <span className="fhud-audio-label">Audio</span>
            {([
              { label: 'Cabin Chime',   on: cabinOn,  vol: cabinVol,  onToggle: toggleCabin,  onVolChange: setCabinVolume },
              { label: 'Engine Sounds', on: engineOn, vol: engineVol, onToggle: toggleEngine, onVolChange: setEngineVolume },
            ]).map(({ label, on, vol, onToggle, onVolChange }) => (
              <div key={label} className="fhud-audio-row">
                <span className={`fhud-audio-dot ${on ? 'on' : 'off'}`} />
                <span className="fhud-audio-name">{label}</span>
                <input
                  type="range" min={0} max={1} step={0.01} value={vol}
                  className="fhud-audio-vol"
                  onChange={(e) => onVolChange(parseFloat(e.target.value))}
                />
                <button className={`fhud-audio-btn${on ? ' on' : ''}`} onClick={onToggle}>
                  {on ? 'STOP' : 'PLAY'}
                </button>
              </div>
            ))}
          </div>

          {/* Briefing button row */}
          <div className="fhud-briefing-row">
            <button
              className="fhud-briefing"
              onClick={() => router.push('/briefing')}
            >
              Briefing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
