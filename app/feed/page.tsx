'use client';

import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getFeed } from '@/services/feedService';
import { getTopicEmoji, timeAgo } from '@/lib/design';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#71717A' }}>{children}</span>
      <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  );
}

function DropCard({ drop }: { drop: { dropId: string; topicTitle: string; content: string; authorName?: string | null; createdAt?: string; discussionCount: number } }) {
  return (
    <Link
      href={`/drops/${drop.dropId}`}
      className="block rounded-2xl p-5 transition-all duration-150 group"
      style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium" style={{ color: '#0A84FF' }}>{drop.topicTitle}</span>
        {drop.createdAt && (
          <span className="text-xs" style={{ color: '#71717A' }}>· {timeAgo(drop.createdAt)}</span>
        )}
      </div>
      <p className="text-sm leading-relaxed line-clamp-3" style={{ color: '#FFFFFF' }}>{drop.content}</p>
      <div className="flex items-center gap-3 mt-4" style={{ color: '#71717A' }}>
        <span className="text-xs">{drop.authorName ?? 'Explorer'}</span>
        {drop.discussionCount > 0 && (
          <span className="text-xs">{drop.discussionCount} {drop.discussionCount === 1 ? 'reply' : 'replies'}</span>
        )}
      </div>
    </Link>
  );
}

export default function FeedPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['feed'],
    queryFn: getFeed,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="flex flex-col gap-12">
      {/* Search hero */}
      <div className="flex flex-col gap-5 pt-4">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ letterSpacing: '-0.02em' }}>
          Find Your Way.
        </h1>
        <form onSubmit={handleSearch}>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#71717A' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any experience, topic, place…"
              className="w-full py-3.5 text-sm rounded-2xl focus:outline-none transition-all duration-200"
              style={{
                background: '#111111',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#FFFFFF',
                paddingLeft: '44px',
                paddingRight: query ? '80px' : '16px',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(10,132,255,0.4)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
            {query && (
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-xl text-xs font-semibold"
                style={{ background: '#0A84FF', color: '#FFFFFF' }}
              >
                Search
              </button>
            )}
          </div>
        </form>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: '#111111' }} />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm py-8 text-center" style={{ color: '#71717A' }}>
          Could not load feed — backend may be starting up. Refresh in a moment.
        </p>
      )}

      {!isLoading && !error && (
        <>
          {/* Recent Drops */}
          {(data?.recentDrops?.length ?? 0) > 0 && (
            <section>
              <SectionLabel>Recent Drops</SectionLabel>
              <div className="flex flex-col gap-2.5">
                {data!.recentDrops.map((drop) => (
                  <DropCard key={drop.dropId} drop={drop} />
                ))}
              </div>
            </section>
          )}

          {/* Active Discussions */}
          {(data?.continueDiscussions?.length ?? 0) > 0 && (
            <section>
              <SectionLabel>Continue Exploring</SectionLabel>
              <div className="flex flex-col gap-2.5">
                {data!.continueDiscussions.map((d) => (
                  <Link
                    key={`${d.dropId}-${d.topicId}`}
                    href={`/drops/${d.dropId}`}
                    className="flex items-start gap-4 rounded-2xl p-5 transition-all duration-150"
                    style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium" style={{ color: '#0A84FF' }}>{d.topicTitle}</span>
                        <span className="text-xs" style={{ color: '#71717A' }}>· {d.discussionCount} replies</span>
                      </div>
                      <p className="text-sm line-clamp-2" style={{ color: '#A1A1AA' }}>{d.dropContent}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Trending Destinations */}
          {(data?.trendingTopics?.length ?? 0) > 0 && (
            <section>
              <SectionLabel>Trending Destinations</SectionLabel>
              <div className="flex flex-col gap-2">
                {data!.trendingTopics.map((t) => (
                  <Link
                    key={t.id}
                    href={`/topics/${t.id}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-150 group"
                    style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = '#1C1C1E'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = '#111111'; }}
                  >
                    <span className="text-lg">{getTopicEmoji(t.title)}</span>
                    <span className="text-sm font-medium flex-1">{t.title}</span>
                    <svg className="opacity-0 group-hover:opacity-100 transition-opacity" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {!data?.recentDrops?.length && !data?.trendingTopics?.length && (
            <div className="text-center py-16 flex flex-col items-center gap-4">
              <p style={{ color: '#71717A' }}>Nothing here yet.</p>
              <Link href="/create/drop" className="text-sm font-semibold" style={{ color: '#0A84FF' }}>
                Be the first to drop something →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
