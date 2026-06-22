'use client';

import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getFeed } from '@/services/feedService';
import { getTopicEmoji, timeAgo } from '@/lib/design';

const S = {
  searchWrap: { position: 'relative' as const, marginBottom: 48 },
  searchIcon: { position: 'absolute' as const, left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' as const },
  searchInput: {
    width: '100%', padding: '14px 16px 14px 44px', fontSize: 15,
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 12, color: 'var(--text-primary)', outline: 'none',
    transition: 'border-color 150ms',
  },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', marginBottom: 20 },
  dropItem: { padding: '20px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'block', textDecoration: 'none' },
  dropMeta: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 },
  dropTopic: { fontSize: 12, fontWeight: 500, color: 'var(--accent)' },
  dropTime: { fontSize: 12, color: 'var(--text-muted)' },
  dropContent: { fontSize: 15, lineHeight: 1.65, color: 'var(--text-primary)', marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' },
  dropFooter: { fontSize: 12, color: 'var(--text-muted)' },
  destinationRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', textDecoration: 'none' as const },
  skeletonLine: { background: 'var(--surface)', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' },
};

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export default function FeedPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading } = useQuery({ queryKey: ['feed'], queryFn: getFeed });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div>
      {/* Hero search */}
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 20 }}>Find Your Way.</h1>
      <form onSubmit={handleSearch} style={S.searchWrap}>
        <div style={S.searchIcon}><SearchIcon /></div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search any experience, topic, place…"
          style={S.searchInput}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(10,132,255,0.5)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        />
      </form>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ ...S.skeletonLine, height: 12, width: '30%', marginBottom: 10 }} />
              <div style={{ ...S.skeletonLine, height: 15, width: '90%', marginBottom: 6 }} />
              <div style={{ ...S.skeletonLine, height: 15, width: '70%', marginBottom: 10 }} />
              <div style={{ ...S.skeletonLine, height: 11, width: '20%' }} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && data && (
        <>
          {/* Recent Drops */}
          {(data.recentDrops?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 48 }}>
              <div style={S.label}>Recent drops</div>
              <div>
                {data.recentDrops.map(drop => (
                  <Link key={drop.dropId} href={`/drops/${drop.dropId}`} style={S.dropItem}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.75'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                  >
                    <div style={S.dropMeta}>
                      <span style={S.dropTopic}>{drop.topicTitle}</span>
                      {drop.createdAt && <span style={S.dropTime}>· {timeAgo(drop.createdAt)}</span>}
                    </div>
                    <p style={S.dropContent}>{drop.content}</p>
                    <div style={S.dropFooter}>
                      {drop.authorName ?? 'Explorer'}
                      {drop.discussionCount > 0 && ` · ${drop.discussionCount} ${drop.discussionCount === 1 ? 'reply' : 'replies'}`}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Active Discussions */}
          {(data.continueDiscussions?.length ?? 0) > 0 && (
            <section style={{ marginBottom: 48 }}>
              <div style={S.label}>Active discussions</div>
              <div>
                {data.continueDiscussions.map(d => (
                  <Link key={`${d.dropId}-${d.topicId}`} href={`/drops/${d.dropId}`} style={S.dropItem}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.75'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                  >
                    <div style={S.dropMeta}>
                      <span style={S.dropTopic}>{d.topicTitle}</span>
                      <span style={S.dropTime}>· {d.discussionCount} replies</span>
                    </div>
                    <p style={{ ...S.dropContent, color: 'var(--text-secondary)' }}>{d.dropContent}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Destinations */}
          {(data.trendingTopics?.length ?? 0) > 0 && (
            <section>
              <div style={S.label}>Destinations</div>
              <div>
                {data.trendingTopics.map(t => (
                  <Link key={t.id} href={`/topics/${t.slug ?? t.id}`} style={S.destinationRow}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>{getTopicEmoji(t.title)}</span>
                    <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{t.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {!data.recentDrops?.length && !data.trendingTopics?.length && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
              <p style={{ marginBottom: 16 }}>Nothing here yet.</p>
              <Link href="/create/drop" style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 500 }}>Be the first to drop something →</Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
