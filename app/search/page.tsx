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
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}

function useDebounce(value: string, ms: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debouncedValue;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#71717A' }}>{children}</span>
      <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    if (debouncedQuery) {
      router.replace(`/search?q=${encodeURIComponent(debouncedQuery)}`, { scroll: false });
    }
  }, [debouncedQuery, router]);

  const enabled = debouncedQuery.length > 1;

  const topics = useQuery({ queryKey: ['search', 'topics', debouncedQuery], queryFn: () => searchTopics(debouncedQuery), enabled });
  const drops = useQuery({ queryKey: ['search', 'drops', debouncedQuery], queryFn: () => searchDrops(debouncedQuery), enabled });
  const discussions = useQuery({ queryKey: ['search', 'discussions', debouncedQuery], queryFn: () => searchDiscussions(debouncedQuery), enabled });

  const isLoading = topics.isLoading || drops.isLoading || discussions.isLoading;
  const hasResults = (topics.data?.length ?? 0) + (drops.data?.length ?? 0) + (discussions.data?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Search input */}
      <div className="relative pt-4">
        <div className="absolute left-4 top-1/2 mt-2 -translate-y-1/2" style={{ color: '#71717A' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search destinations, drops, discussions…"
          className="w-full py-4 text-base rounded-2xl focus:outline-none transition-all duration-200"
          style={{
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#FFFFFF',
            paddingLeft: '48px',
            paddingRight: '20px',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(10,132,255,0.4)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        />
      </div>

      {!enabled && (
        <p className="text-sm" style={{ color: '#71717A' }}>Type to search across all destinations and experiences.</p>
      )}

      {enabled && isLoading && (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: '#111111' }} />
          ))}
        </div>
      )}

      {enabled && !isLoading && (
        <div className="flex flex-col gap-10">
          {/* Destinations */}
          {(topics.data?.length ?? 0) > 0 && (
            <section>
              <SectionLabel>Destinations</SectionLabel>
              <div className="flex flex-col gap-2">
                {topics.data!.map((t) => (
                  <Link
                    key={t.id}
                    href={`/topics/${t.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-150 group"
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

          {/* Drops */}
          {(drops.data?.length ?? 0) > 0 && (
            <section>
              <SectionLabel>Drops</SectionLabel>
              <div className="flex flex-col">
                {drops.data!.map((d, idx) => (
                  <Link
                    key={d.dropId}
                    href={`/drops/${d.dropId}`}
                    className="block py-5 transition-all duration-150 group"
                    style={{ borderBottom: idx < drops.data!.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium" style={{ color: '#0A84FF' }}>{d.topicTitle}</span>
                      {d.createdAt && <span className="text-xs" style={{ color: '#71717A' }}>· {timeAgo(d.createdAt)}</span>}
                    </div>
                    <p className="text-sm leading-relaxed line-clamp-3 group-hover:opacity-70 transition-opacity" style={{ color: '#FFFFFF' }}>{d.content}</p>
                    <div className="mt-2 text-xs" style={{ color: '#71717A' }}>{d.authorName ?? 'Explorer'}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Discussions */}
          {(discussions.data?.length ?? 0) > 0 && (
            <section>
              <SectionLabel>Discussions</SectionLabel>
              <div className="flex flex-col gap-2.5">
                {discussions.data!.map((d) => (
                  <Link
                    key={`${d.dropId}-${d.topicId}`}
                    href={`/drops/${d.dropId}`}
                    className="block rounded-2xl p-5 transition-all duration-150"
                    style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium" style={{ color: '#0A84FF' }}>{d.topicTitle}</span>
                      <span className="text-xs" style={{ color: '#71717A' }}>· {d.discussionCount} replies</span>
                    </div>
                    <p className="text-sm line-clamp-2" style={{ color: '#A1A1AA' }}>{d.dropContent}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {!hasResults && (
            <p className="text-sm" style={{ color: '#71717A' }}>No results for "{debouncedQuery}".</p>
          )}
        </div>
      )}
    </div>
  );
}
