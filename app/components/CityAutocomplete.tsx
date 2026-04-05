"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface City {
  id: number;
  name: string;
  country: string;
  admin1?: string;
}

interface Props {
  placeholder: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function CityAutocomplete({ placeholder, icon, label, value, onChange }: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchCities = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`
      );
      const data = await res.json();
      const seen = new Set<string>();
      const cities: City[] = (data.results ?? [])
        .map((r: Record<string, unknown>) => ({
          id: r.id as number,
          name: r.name as string,
          country: r.country as string,
          admin1: r.admin1 as string | undefined,
        }))
        .filter((city: City) => {
          const key = `${city.name.toLowerCase()}|${city.country.toLowerCase()}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      setResults(cities);
      setOpen(cities.length > 0);
      setHighlighted(-1);
    } catch {
      setResults([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchCities(val), 300);
  }

  function handleSelect(city: City) {
    const display = `${city.name}${city.admin1 ? `, ${city.admin1}` : ""}, ${city.country}`;
    setQuery(display);
    onChange(display);
    setOpen(false);
    setResults([]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      handleSelect(results[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label className="block text-[10px] tracking-widest uppercase text-gray-500 mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          {icon}
        </span>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-lg py-3 pl-9 pr-4 text-sm text-gray-300 placeholder-gray-600 outline-none focus:ring-1 focus:ring-purple-500/50 transition"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="animate-spin w-3.5 h-3.5 text-purple-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <ul
          className="city-dropdown absolute z-50 w-full mt-1.5 rounded-xl overflow-y-auto shadow-2xl"
          style={{
            background: "rgba(15, 5, 30, 0.97)",
            border: "1px solid rgba(167,139,250,0.15)",
            backdropFilter: "blur(12px)",
          }}
        >
          {results.map((city, i) => (
            <li
              key={city.id}
              onMouseDown={() => handleSelect(city)}
              onMouseEnter={() => setHighlighted(i)}
              className="flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors text-sm"
              style={{
                background: highlighted === i ? "rgba(124,58,237,0.25)" : "transparent",
                borderBottom: i < results.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}
            >
              <span className="text-gray-200 font-medium">
                {city.name}
                {city.admin1 && (
                  <span className="text-gray-500 font-normal">, {city.admin1}</span>
                )}
              </span>
              <span className="text-[11px] text-purple-400/70 ml-3 shrink-0">{city.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
