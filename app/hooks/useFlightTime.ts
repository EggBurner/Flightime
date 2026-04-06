'use client';
import { useEffect, useRef, useState } from 'react';

export interface FlightTimeData {
  remaining: number;
  elapsed: number;
  total: number;
  h: string;
  m: string;
  s: string;
  active: boolean;
  speed: number;
  setSpeed: (s: number) => void;
  origin: string;
  destination: string;
}

interface ActiveFlight {
  saveKey: string;
  totalSeconds: number;
  origin?: string;
  destination?: string;
}

interface Anchor {
  elapsed: number;
  wallTime: number;
  speed: number;
  saveKey: string;
  total: number;
}

export function useFlightTime(): FlightTimeData {
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(0);
  const [speed, setSpeedState] = useState(2);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const anchorRef = useRef<Anchor | null>(null);

  useEffect(() => {
    let active: ActiveFlight | null = null;
    try {
      active = JSON.parse(localStorage.getItem('ft_active') ?? 'null');
    } catch { /* no active flight */ }

    if (!active) return;

    const { saveKey, totalSeconds } = active;
    if (active.origin) setOrigin(active.origin);
    if (active.destination) setDestination(active.destination);
    const savedElapsed = parseFloat(localStorage.getItem(saveKey) ?? '0') || 0;

    setTotal(totalSeconds);
    setRemaining(Math.max(0, totalSeconds - savedElapsed));

    const rawSpeed = parseFloat(localStorage.getItem('ft_speed') ?? '');
    const initSpeed = savedElapsed === 0 ? 1 : ([1, 2, 4, 8, 16].includes(rawSpeed) ? rawSpeed : 1);
    if (savedElapsed === 0) localStorage.setItem('ft_speed', '1');
    setSpeedState(initSpeed);

    anchorRef.current = {
      elapsed: savedElapsed,
      wallTime: Date.now(),
      speed: initSpeed,
      saveKey,
      total: totalSeconds,
    };

    const id = setInterval(() => {
      const a = anchorRef.current;
      if (!a) return;
      const elapsed = a.elapsed + ((Date.now() - a.wallTime) / 1000) * a.speed;
      const rem = Math.max(0, a.total - elapsed);
      setRemaining(rem);
      localStorage.setItem(a.saveKey, String(elapsed));
      if (rem === 0) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  // Re-anchor so speed change doesn't cause a jump
  const setSpeed = (s: number) => {
    const a = anchorRef.current;
    if (a) {
      const elapsed = a.elapsed + ((Date.now() - a.wallTime) / 1000) * a.speed;
      anchorRef.current = { ...a, elapsed, wallTime: Date.now(), speed: s };
    }
    setSpeedState(s);
    localStorage.setItem('ft_speed', String(s));
  };

  const totalSec = Math.max(0, Math.round(remaining));

  return {
    remaining,
    elapsed: total - remaining,
    total,
    h: String(Math.floor(totalSec / 3600)).padStart(2, '0'),
    m: String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0'),
    s: String(totalSec % 60).padStart(2, '0'),
    active: total > 0,
    speed,
    setSpeed,
    origin,
    destination,
  };
}
