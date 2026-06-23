'use client';

import Link from 'next/link';
import { getTopicEmoji } from '@/lib/design';
import type { ServerTopic } from '@/lib/server';

export function RelatedTopics({ topics }: { topics: ServerTopic[] }) {
  if (topics.length === 0) return null;

  return (
    <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>
        Related Topics
      </p>
      <div>
        {topics.map((t, i) => (
          <Link
            key={t.id}
            href={`/topics/${t.slug ?? t.id}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 0',
              borderBottom: i < topics.length - 1 ? '1px solid var(--border)' : 'none',
              fontSize: 14, color: 'var(--text-primary)', transition: 'opacity 150ms',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.6'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            <span style={{ fontSize: 16 }}>{getTopicEmoji(t.title)}</span>
            {t.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
