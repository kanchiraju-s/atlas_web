'use client';

import Link from 'next/link';
import { timeAgo } from '@/lib/design';
import type { ServerDrop } from '@/lib/server';

export function DropList({ drops, topicSlug }: { drops: ServerDrop[]; topicSlug: string }) {
  if (drops.length === 0) {
    return (
      <p style={{ fontSize: 14, color: 'var(--text-muted)', padding: '40px 0' }}>
        No experiences yet. Be the first.
      </p>
    );
  }

  return (
    <div>
      {drops.map((drop, idx) => (
        <Link
          key={drop.id}
          href={`/topics/${topicSlug}/drops/${drop.id}`}
          style={{
            display: 'block', padding: '20px 0',
            borderBottom: idx < drops.length - 1 ? '1px solid var(--border)' : 'none',
            transition: 'opacity 150ms',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
        >
          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--text-primary)', marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {drop.content}
          </p>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {drop.authorName ?? 'Explorer'} · {timeAgo(drop.createdAt)}
            {(drop.discussionCount ?? 0) > 0 && ` · ${drop.discussionCount} ${drop.discussionCount === 1 ? 'reply' : 'replies'}`}
          </div>
        </Link>
      ))}
    </div>
  );
}
