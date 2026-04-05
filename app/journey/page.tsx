"use client";

import { useState } from "react";
import CityAutocomplete from "../components/CityAutocomplete";

export default function JourneyPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  return (
    <main className="relative flex flex-1 min-h-[calc(100vh-57px)] items-center justify-center overflow-hidden px-4">
      {/* Left landscape card */}
      <div className="pointer-events-none absolute left-0 -translate-x-1/4 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl opacity-90 top-1/2 -translate-y-1/2 w-64 max-[900px]:top-auto max-[900px]:bottom-0 max-[900px]:translate-y-0 max-[900px]:w-32">
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, #c2763a 0%, #e8a055 20%, #3a5a6e 50%, #1a3040 70%, #0d1f2d 100%)",
        }} />
        {/* Mountain silhouettes */}
        <svg className="absolute bottom-0 w-full" viewBox="0 0 200 100" preserveAspectRatio="none">
          <polygon points="0,100 40,40 80,70 120,30 160,60 200,20 200,100" fill="#0d2535" />
          <polygon points="0,100 30,55 60,75 100,45 140,68 180,35 200,50 200,100" fill="#0a1c29" />
        </svg>
        {/* Subtle reflection shimmer */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, transparent 60%)",
        }} />
      </div>

      {/* Right starburst glow */}
      <div className="pointer-events-none absolute right-0 translate-x-1/4 top-1/2 -translate-y-1/2 w-80 h-80 max-[900px]:top-0 max-[900px]:translate-y-0 max-[900px]:w-44 max-[900px]:h-44">
        {/* Core glow */}
        <div className="absolute inset-0 rounded-full" style={{
          background: "radial-gradient(circle, rgba(255,180,60,0.55) 0%, rgba(220,100,20,0.3) 30%, rgba(180,60,0,0.1) 60%, transparent 75%)",
        }} />
        {/* Rays */}
        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 200 200">
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;
            const rad = (angle * Math.PI) / 180;
            const innerR = 12;
            const outerR = i % 3 === 0 ? 95 : i % 3 === 1 ? 70 : 50;
            const x1 = 100 + innerR * Math.cos(rad);
            const y1 = 100 + innerR * Math.sin(rad);
            const x2 = 100 + outerR * Math.cos(rad);
            const y2 = 100 + outerR * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={i % 3 === 0 ? "#ffb83c" : "#ff8c20"}
                strokeWidth={i % 3 === 0 ? "0.8" : "0.4"}
                strokeLinecap="round"
              />
            );
          })}
          {/* Bright center dot */}
          <circle cx="100" cy="100" r="5" fill="#ffe080" opacity="0.9" />
          <circle cx="100" cy="100" r="2" fill="#ffffff" opacity="1" />
        </svg>
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-sm">
        {/* Eyebrow */}
        <p className="text-xs tracking-[0.25em] uppercase font-medium mb-4" style={{ color: "#a78bfa" }}>
          Flight Path Setup
        </p>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-3">
          Map Your Focus
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-gray-400 leading-relaxed mb-8 max-w-xs">
          Define the trajectory of your concentration. Where does your deep work begin today?
        </p>

        {/* Form */}
        <div className="w-full flex flex-col items-start gap-0">
          <CityAutocomplete
            label="Origin City"
            placeholder="Current State of Mind"
            value={origin}
            onChange={setOrigin}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            }
          />

          {/* Connector line */}
          <div className="flex items-center ml-4 my-1">
            <div className="w-px h-8" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.05))" }} />
          </div>

          <CityAutocomplete
            label="Destination City"
            placeholder="The Flow State"
            value={destination}
            onChange={setDestination}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            }
          />
        </div>

        {/* CTA Button */}
        <button
          className="mt-8 w-full py-3.5 rounded-xl text-sm font-semibold text-white tracking-wide flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:opacity-80"
          style={{ background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)" }}
        >
          Prepare for Take-off
          <span className="text-base">→</span>
        </button>

        {/* Footer note */}
        <p className="mt-4 text-xs text-gray-600">
          Average flight time to flow: 23 minutes
        </p>
      </div>
    </main>
  );
}
