'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { getDrop } from '@/services/dropService';
import { getDiscussions, createDiscussion } from '@/services/discussionService';
import { getTopic } from '@/services/topicService';
import { useAuthStore } from '@/store/authStore';
import { timeAgo } from '@/lib/design';
import type { Discussion } from '@/lib/api';

function Thread({ disc, dropId, depth = 0 }: { disc: Discussion; dropId: string; depth?: number }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const replyMut = useMutation({
    mutationFn: (content: string) => createDiscussion(dropId, content, disc.id),
    onSuccess: () => { setReplyText(''); setReplying(false); qc.invalidateQueries({ queryKey: ['discussions', dropId] }); },
  });

  return (
    <div style={depth > 0 ? { paddingLeft: 20, borderLeft: '1px solid var(--border)' } : {}}>
      <div style={{ padding: '14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{disc.authorName ?? 'Explorer'}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {timeAgo(disc.createdAt)}</span>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: 8 }}>{disc.content}</p>
        {user && depth < 3 && (
          <button
            onClick={() => setReplying(!replying)}
            style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            Reply
          </button>
        )}
        {replying && (
          <div style={{ marginTop: 10 }}>
            <textarea
              autoFocus
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Your reply…"
              rows={2}
              style={{
                width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--text-primary)',
                outline: 'none', resize: 'none', marginBottom: 8,
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setReplying(false); setReplyText(''); }}
                style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px 10px' }}>
                Cancel
              </button>
              <button
                disabled={replyText.trim().length < 2 || replyMut.isPending}
                onClick={() => replyMut.mutate(replyText.trim())}
                style={{ fontSize: 12, fontWeight: 600, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', opacity: replyText.trim().length < 2 ? 0.5 : 1 }}>
                {replyMut.isPending ? 'Posting…' : 'Reply'}
              </button>
            </div>
          </div>
        )}
      </div>
      {disc.replies?.map(r => <Thread key={r.id} disc={r} dropId={dropId} depth={depth + 1} />)}
    </div>
  );
}

export default function DropPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [comment, setComment] = useState('');

  const drop = useQuery({ queryKey: ['drop', id], queryFn: () => getDrop(id) });
  const discussions = useQuery({ queryKey: ['discussions', id], queryFn: () => getDiscussions(id) });
  const topic = useQuery({
    queryKey: ['topic', drop.data?.topicId],
    queryFn: () => getTopic(drop.data!.topicId),
    enabled: !!drop.data?.topicId,
  });

  const createMut = useMutation({
    mutationFn: (content: string) => createDiscussion(id, content),
    onSuccess: () => { setComment(''); qc.invalidateQueries({ queryKey: ['discussions', id] }); },
  });

  return (
    <div>
      {/* Breadcrumb */}
      {topic.data && (
        <Link href={`/topics/${drop.data?.topicId}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, color: 'var(--accent)', marginBottom: 32, transition: 'opacity 150ms' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {topic.data.title}
        </Link>
      )}

      {/* Drop content — large, readable */}
      {drop.isLoading ? (
        <div style={{ marginBottom: 40 }}>
          <div style={{ height: 22, width: '90%', background: 'var(--surface)', borderRadius: 4, marginBottom: 10 }} />
          <div style={{ height: 22, width: '75%', background: 'var(--surface)', borderRadius: 4, marginBottom: 10 }} />
          <div style={{ height: 22, width: '50%', background: 'var(--surface)', borderRadius: 4 }} />
        </div>
      ) : (
        <div style={{ marginBottom: 40, paddingBottom: 32, borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 18, lineHeight: 1.75, color: 'var(--text-primary)', fontWeight: 400, marginBottom: 20 }}>
            {drop.data?.content}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {drop.data?.authorName ?? 'Explorer'}
            {drop.data?.createdAt && ` · ${timeAgo(drop.data.createdAt)}`}
          </p>
        </div>
      )}

      {/* Discussion */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>
          Discussion {discussions.data?.length ? `(${discussions.data.length})` : ''}
        </p>

        {user ? (
          <div style={{ marginBottom: 32 }}>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add to the discussion…"
              rows={3}
              style={{
                width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '14px 16px', fontSize: 14, color: 'var(--text-primary)',
                outline: 'none', resize: 'none', marginBottom: 10, transition: 'border-color 150ms',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(10,132,255,0.5)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                disabled={comment.trim().length < 2 || createMut.isPending}
                onClick={() => createMut.mutate(comment.trim())}
                style={{ fontSize: 13, fontWeight: 600, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', opacity: comment.trim().length < 2 ? 0.5 : 1 }}>
                {createMut.isPending ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Sign in to join the discussion.</span>
            <Link href="/auth" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>Sign in</Link>
          </div>
        )}

        {discussions.isLoading ? (
          <div>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ height: 12, width: '25%', background: 'var(--surface)', borderRadius: 4, marginBottom: 8 }} />
                <div style={{ height: 14, width: '80%', background: 'var(--surface)', borderRadius: 4 }} />
              </div>
            ))}
          </div>
        ) : discussions.data?.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--text-muted)', paddingTop: 8 }}>No discussion yet.</p>
        ) : (
          <div>
            {discussions.data?.map((d, idx) => (
              <div key={d.id} style={{ borderTop: idx > 0 ? '1px solid var(--border)' : 'none' }}>
                <Thread disc={d} dropId={id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
