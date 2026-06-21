'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { searchTopics } from '@/services/topicService';
import { searchDrops } from '@/services/dropService';
import { searchDiscussions } from '@/services/discussionService';
import { TimeAgo } from '@/components/TimeAgo';

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

  const topics = useQuery({
    queryKey: ['search', 'topics', debouncedQuery],
    queryFn: () => searchTopics(debouncedQuery),
    enabled,
  });

  const drops = useQuery({
    queryKey: ['search', 'drops', debouncedQuery],
    queryFn: () => searchDrops(debouncedQuery),
    enabled,
  });

  const discussions = useQuery({
    queryKey: ['search', 'discussions', debouncedQuery],
    queryFn: () => searchDiscussions(debouncedQuery),
    enabled,
  });

  return (
    <div className="flex flex-col gap-8">
      <input
        autoFocus
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search topics, drops, discussions…"
        className="w-full bg-[#111827] border border-[#1e293b] text-[#f8fafc] rounded-xl px-5 py-4 text-base placeholder:text-[#94a3b8] focus:outline-none focus:border-[#38bdf8]/50"
      />

      {!enabled && (
        <p className="text-[#94a3b8] text-sm">Type at least 2 characters to search.</p>
      )}

      {enabled && (
        <div className="flex flex-col gap-8">
          {/* Topics */}
          {(topics.data?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-[#94a3b8] text-xs uppercase tracking-widest font-semibold mb-3">Topics</h2>
              <div className="flex flex-wrap gap-2">
                {topics.data!.map((t) => (
                  <Link
                    key={t.id}
                    href={`/topics/${t.id}`}
                    className="border border-[#1e293b] text-[#cbd5e1] px-4 py-2 rounded-full text-sm hover:border-[#38bdf8]/40 hover:text-[#f8fafc] transition-colors"
                  >
                    {t.title}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Drops */}
          {(drops.data?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-[#94a3b8] text-xs uppercase tracking-widest font-semibold mb-3">Drops</h2>
              <div className="flex flex-col gap-3">
                {drops.data!.map((d) => (
                  <Link
                    key={d.dropId}
                    href={`/drops/${d.dropId}`}
                    className="block bg-[#111827] border border-[#1e293b] rounded-xl p-4 hover:border-[#38bdf8]/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[#38bdf8] text-xs font-medium">{d.topicTitle}</span>
                      {d.createdAt && <TimeAgo date={d.createdAt} />}
                    </div>
                    <p className="text-[#f8fafc] text-sm leading-relaxed line-clamp-3">{d.content}</p>
                    <div className="mt-2 text-[#94a3b8] text-xs">{d.authorName ?? 'Explorer'}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Discussions */}
          {(discussions.data?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-[#94a3b8] text-xs uppercase tracking-widest font-semibold mb-3">Discussions</h2>
              <div className="flex flex-col gap-3">
                {discussions.data!.map((d) => (
                  <Link
                    key={`${d.dropId}-${d.topicId}`}
                    href={`/drops/${d.dropId}`}
                    className="block bg-[#111827] border border-[#1e293b] rounded-xl p-4 hover:border-[#38bdf8]/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[#38bdf8] text-xs font-medium">{d.topicTitle}</span>
                      <span className="text-[#94a3b8] text-xs">{d.discussionCount} replies</span>
                    </div>
                    <p className="text-[#94a3b8] text-sm line-clamp-2">{d.dropContent}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {!topics.isLoading && !drops.isLoading && !discussions.isLoading &&
           !topics.data?.length && !drops.data?.length && !discussions.data?.length && (
            <p className="text-[#94a3b8] text-sm">No results for "{debouncedQuery}".</p>
          )}
        </div>
      )}
    </div>
  );
}
