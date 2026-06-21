'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getFeed } from '@/services/feedService';
import { TimeAgo } from '@/components/TimeAgo';

export default function FeedPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['feed'],
    queryFn: getFeed,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-[#111827] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-[#94a3b8] text-center py-16">
        Failed to load feed. The backend may be waking up — try refreshing in a moment.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Trending Topics */}
      {data?.trendingTopics && data.trendingTopics.length > 0 && (
        <section>
          <h2 className="text-[#94a3b8] text-xs uppercase tracking-widest font-semibold mb-4">
            Trending Topics
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.trendingTopics.map((t) => (
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

      {/* Recent Drops */}
      {data?.recentDrops && data.recentDrops.length > 0 && (
        <section>
          <h2 className="text-[#94a3b8] text-xs uppercase tracking-widest font-semibold mb-4">
            Recent Drops
          </h2>
          <div className="flex flex-col gap-3">
            {data.recentDrops.map((drop) => (
              <Link
                key={drop.dropId}
                href={`/drops/${drop.dropId}`}
                className="block bg-[#111827] border border-[#1e293b] rounded-xl p-4 hover:border-[#38bdf8]/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#38bdf8] text-xs font-medium">{drop.topicTitle}</span>
                  {drop.createdAt && <TimeAgo date={drop.createdAt} />}
                </div>
                <p className="text-[#f8fafc] text-sm leading-relaxed line-clamp-3">{drop.content}</p>
                <div className="flex items-center gap-3 mt-3 text-[#94a3b8] text-xs">
                  <span>{drop.authorName ?? 'Explorer'}</span>
                  {drop.discussionCount > 0 && (
                    <span>{drop.discussionCount} discussion{drop.discussionCount !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Continue Discussions */}
      {data?.continueDiscussions && data.continueDiscussions.length > 0 && (
        <section>
          <h2 className="text-[#94a3b8] text-xs uppercase tracking-widest font-semibold mb-4">
            Active Discussions
          </h2>
          <div className="flex flex-col gap-3">
            {data.continueDiscussions.map((d) => (
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

      {(!data?.recentDrops?.length && !data?.trendingTopics?.length) && (
        <div className="text-[#94a3b8] text-center py-16">
          Nothing here yet.{' '}
          <Link href="/create/drop" className="text-[#38bdf8] hover:underline">
            Be the first to drop something.
          </Link>
        </div>
      )}
    </div>
  );
}
