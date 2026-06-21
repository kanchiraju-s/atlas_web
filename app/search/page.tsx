'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { searchTopics } from '@/services/topicService';
import { searchDrops } from '@/services/dropService';
import { searchDiscussions } from '@/services/discussionService';
import { getTopicEmoji, timeAgo } from '@/lib/design';

export default function SearchPage() {
  return <Suspense><SearchContent /></Suspense>;
}

function useDebounce(value: string, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => { const id = setTimeout(() => setV(value), ms); return () => clearTimeout(id); }, [value, ms]);
  return v;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const dq = useDebounce(query, 350);

  useEffect(() => {
    if (dq) router.replace(`/search?q=${encodeURIComponent(dq)}`, { scroll: false });
  }, [dq, router]);

  const enabled = dq.length > 1;
  const topics = useQuery({ queryKey: ['search', 'topics', dq], queryFn: () => searchTopics(dq), enabled });
  const drops = useQuery({ queryKey: ['search', 'drops', dq], queryFn: () => searchDrops(dq), enabled });
  const discussions = useQuery({ queryKey: ['search', 'discussions', dq], queryFn: () => searchDiscussions(dq), enabled });

  const isLoading = topics.isLoading || drops.isLoading || discussions.isLoading;
  const hasResults = (topics.data?.length ?? 0) + (drops.data?.length ?? 0) + (discussions.data?.length ?? 0) > 0;

  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 };

  return (
    <div>
      {/* Input */}
      <div style={{ position: 'relative', marginBottom: 40 }}>
        <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
        <input
          autoFocus
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search destinations, drops, discussions…"
          style={{
            width: '100%', padding: '14px 16px 14px 44px', fontSize: 15,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, color: 'var(--text-primary)', outline: 'none', transition: 'border-color 150ms',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(10,132,255,0.5)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        />
      </div>

      {!enabled && <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Type to search across all experiences.</p>}

      {enabled && isLoading && (
        <div>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ height: 12, width: '25%', background: 'var(--surface)', borderRadius: 4, marginBottom: 10 }} />
              <div style={{ height: 15, width: '85%', background: 'var(--surface)', borderRadius: 4 }} />
            </div>
          ))}
        </div>
      )}

      {enabled && !isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {/* Destinations */}
          {(topics.data?.length ?? 0) > 0 && (
            <section>
              <div style={labelStyle}>Destinations</div>
              <div>
                {topics.data!.map((t, i) => (
                  <Link key={t.id} href={`/topics/${t.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: i < topics.data!.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 14, color: 'var(--text-primary)', transition: 'opacity 150ms' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.6'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                  >
                    <span style={{ fontSize: 16 }}>{getTopicEmoji(t.title)}</span>
                    {t.title}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Drops */}
          {(drops.data?.length ?? 0) > 0 && (
            <section>
              <div style={labelStyle}>Drops</div>
              <div>
                {drops.data!.map((d, i) => (
                  <Link key={d.dropId} href={`/drops/${d.dropId}`}
                    style={{ display: 'block', padding: '18px 0', borderBottom: i < drops.data!.length - 1 ? '1px solid var(--border)' : 'none', transition: 'opacity 150ms' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)' }}>{d.topicTitle}</span>
                      {d.createdAt && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {timeAgo(d.createdAt)}</span>}
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{d.content}</p>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.authorName ?? 'Explorer'}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Discussions */}
          {(discussions.data?.length ?? 0) > 0 && (
            <section>
              <div style={labelStyle}>Discussions</div>
              <div>
                {discussions.data!.map((d, i) => (
                  <Link key={`${d.dropId}-${d.topicId}`} href={`/drops/${d.dropId}`}
                    style={{ display: 'block', padding: '18px 0', borderBottom: i < discussions.data!.length - 1 ? '1px solid var(--border)' : 'none', transition: 'opacity 150ms' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)' }}>{d.topicTitle}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {d.discussionCount} replies</span>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{d.dropContent}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {!hasResults && <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No results for "{dq}".</p>}
        </div>
      )}
    </div>
  );
}
