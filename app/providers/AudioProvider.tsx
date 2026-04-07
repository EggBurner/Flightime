'use client';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface AudioContextValue {
  cabinOn: boolean;
  engineOn: boolean;
  cabinVol: number;
  engineVol: number;
  toggleCabin: () => void;
  toggleEngine: () => void;
  setCabinVolume: (v: number) => void;
  setEngineVolume: (v: number) => void;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [cabinOn, setCabinOn] = useState(false);
  const [engineOn, setEngineOn] = useState(false);
  const [cabinVol, setCabinVol] = useState(0.5);
  const [engineVol, setEngineVol] = useState(0.5);

  const cabinAudio = useRef<HTMLAudioElement | null>(null);
  const cabinInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Lazy: created on first user gesture so mobile browsers don't suspend it
  const engineCtx = useRef<AudioContext | null>(null);
  const engineBuffer = useRef<AudioBuffer | null>(null);
  const engineSource = useRef<AudioBufferSourceNode | null>(null);
  const engineGain = useRef<GainNode | null>(null);
  const engineReady = useRef(false);
  const engineStarting = useRef(false);

  useEffect(() => {
    cabinAudio.current = new Audio('/audio/cabin.mp3');
    cabinAudio.current.loop = false;
    cabinAudio.current.volume = 0.5;

    return () => {
      if (cabinInterval.current) clearInterval(cabinInterval.current);
      cabinAudio.current?.pause();
      engineSource.current?.stop();
      engineCtx.current?.close();
    };
  }, []);

  // Creates AudioContext + loads buffer inside a user gesture
  const ensureEngine = async (): Promise<boolean> => {
    if (engineReady.current) return true;

    const ctx = new AudioContext();
    engineCtx.current = ctx;

    if (ctx.state === 'suspended') await ctx.resume();

    const gain = ctx.createGain();
    gain.gain.value = engineVol;
    gain.connect(ctx.destination);
    engineGain.current = gain;

    try {
      const resp = await fetch('/audio/engine.mp3');
      const data = await resp.arrayBuffer();
      engineBuffer.current = await ctx.decodeAudioData(data);
      engineReady.current = true;
      return true;
    } catch {
      return false;
    }
  };

  const toggleCabin = () => {
    if (cabinOn) {
      if (cabinInterval.current) clearInterval(cabinInterval.current);
      cabinAudio.current?.pause();
      if (cabinAudio.current) cabinAudio.current.currentTime = 0;
      setCabinOn(false);
    } else {
      const chime = () => {
        if (cabinAudio.current) {
          cabinAudio.current.currentTime = 0;
          cabinAudio.current.play().catch(() => {});
        }
      };
      chime();
      cabinInterval.current = setInterval(chime, 60000);
      setCabinOn(true);
    }
  };

  const toggleEngine = async () => {
    if (engineOn) {
      try { engineSource.current?.stop(); } catch {}
      engineSource.current = null;
      setEngineOn(false);
    } else {
      if (engineStarting.current) return;
      engineStarting.current = true;
      const ok = await ensureEngine();
      engineStarting.current = false;
      if (!ok || !engineCtx.current || !engineBuffer.current) return;

      if (engineCtx.current.state === 'suspended') await engineCtx.current.resume();

      const source = engineCtx.current.createBufferSource();
      source.buffer = engineBuffer.current;
      source.loop = true;
      source.connect(engineGain.current!);
      source.start(0);
      engineSource.current = source;
      setEngineOn(true);
    }
  };

  const setCabinVolume = (v: number) => {
    setCabinVol(v);
    if (cabinAudio.current) cabinAudio.current.volume = v;
  };

  const setEngineVolume = (v: number) => {
    setEngineVol(v);
    if (engineGain.current) engineGain.current.gain.value = v;
  };

  return (
    <AudioCtx.Provider value={{ cabinOn, engineOn, cabinVol, engineVol, toggleCabin, toggleEngine, setCabinVolume, setEngineVolume }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}
