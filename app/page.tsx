'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

const DESTINATIONS = [
  { emoji: '🏙', label: 'Living in Bangalore' },
  { emoji: '💻', label: 'MacBook Air M4' },
  { emoji: '💼', label: 'Working at a startup' },
  { emoji: '✈️', label: 'Solo travel in Japan' },
  { emoji: '📚', label: 'Learning to code at 30' },
  { emoji: '🧘', label: 'Stoicism' },
  { emoji: '💰', label: 'Personal finance India' },
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Atlas',
    description: 'A searchable atlas of human experiences. Discover accumulated knowledge, stories and advice from people who have already been there.',
    url: 'https://www.lorva.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: 'https://www.lorva.app/search?q={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 0 60px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>
          Atlas
        </p>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 52px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16, color: 'var(--text-primary)' }}>
          Find Your Way.
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 400 }}>
          Search anything through human experiences.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ marginBottom: 56 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Living in Bangalore, MacBook M4, Starting to run…"
            style={{
              width: '100%', padding: '16px 16px 16px 44px', fontSize: 15,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, color: 'var(--text-primary)', outline: 'none',
              transition: 'border-color 150ms',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(10,132,255,0.5)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
          {query && (
            <button type="submit" style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              padding: '6px 14px', background: 'var(--accent)', color: '#fff',
              borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            }}>
              Search
            </button>
          )}
        </div>
      </form>

      {/* Destinations */}
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>
          Trending destinations
        </p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {DESTINATIONS.map((d, i) => (
            <Link
              key={d.label}
              href={`/search?q=${encodeURIComponent(d.label)}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 0',
                borderBottom: i < DESTINATIONS.length - 1 ? '1px solid var(--border)' : 'none',
                color: 'var(--text-primary)', fontSize: 14,
                transition: 'opacity 150ms',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.6'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{d.emoji}</span>
              {d.label}
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link href="/auth" style={{
          padding: '11px 24px', background: 'var(--accent)', color: '#fff',
          borderRadius: 10, fontSize: 14, fontWeight: 600,
        }}>
          Start Exploring
        </Link>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>500 explorer spots · Free during alpha</span>
      </div>
    </div>
  );
}
