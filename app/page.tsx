'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

const DESTINATIONS = [
  { emoji: '🏙', label: 'Living in Bangalore' },
  { emoji: '💻', label: 'MacBook Air M4' },
  { emoji: '💼', label: 'Working at a startup' },
  { emoji: '✈️', label: 'Solo travel in Japan' },
  { emoji: '📚', label: 'Learning to code at 30' },
  { emoji: '🌿', label: 'Van life' },
  { emoji: '🧘', label: 'Stoicism' },
  { emoji: '🎵', label: 'Learning guitar' },
  { emoji: '💰', label: 'Personal finance' },
  { emoji: '🤖', label: 'Using AI daily' },
];

export default function LandingPage() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && user) window.location.replace('/feed');
  }, [isLoading, user]);

  if (isLoading || user) return null;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="flex flex-col items-center min-h-[80vh]">
      {/* Hero */}
      <div className="flex flex-col items-center text-center pt-16 sm:pt-24 pb-12 gap-6 max-w-2xl w-full">
        <div className="text-[#71717A] text-sm font-medium tracking-widest uppercase">Atlas</div>
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.05]" style={{ letterSpacing: '-0.03em' }}>
          Find Your Way.
        </h1>
        <p className="text-[#A1A1AA] text-lg sm:text-xl leading-relaxed max-w-md">
          Search anything through human experiences.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="w-full mt-4">
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2" style={{ color: '#71717A' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Living in Bangalore, MacBook Air M4…"
              className="w-full pl-13 pr-5 py-4 text-base rounded-2xl focus:outline-none transition-all duration-200"
              style={{
                background: '#111111',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#FFFFFF',
                paddingLeft: '48px',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(10,132,255,0.4)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
            {query && (
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: '#0A84FF', color: '#FFFFFF' }}
              >
                Search
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Destinations */}
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <span className="text-[#71717A] text-xs uppercase tracking-widest font-semibold">Trending Destinations</span>
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DESTINATIONS.map((d) => (
            <Link
              key={d.label}
              href={`/search?q=${encodeURIComponent(d.label)}`}
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-150 group"
              style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = '#1C1C1E'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = '#111111'; }}
            >
              <span className="text-xl">{d.emoji}</span>
              <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>{d.label}</span>
              <svg className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 pt-8 pb-4">
          <Link
            href="/auth"
            className="px-8 py-3.5 rounded-2xl text-base font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#0A84FF', color: '#FFFFFF' }}
          >
            Start Exploring
          </Link>
          <p className="text-[#71717A] text-xs">500 explorer spots · Free during alpha</p>
        </div>
      </div>
    </div>
  );
}
