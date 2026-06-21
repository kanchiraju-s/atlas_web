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

function DiscussionThread({ disc, dropId, depth = 0 }: { disc: Discussion; dropId: string; depth?: number }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const replyMut = useMutation({
    mutationFn: (content: string) => createDiscussion(dropId, content, disc.id),
    onSuccess: () => {
      setReplyText('');
      setReplying(false);
      qc.invalidateQueries({ queryKey: ['discussions', dropId] });
    },
  });

  return (
    <div className={depth > 0 ? 'pl-5' : ''} style={depth > 0 ? { borderLeft: '1px solid rgba(255,255,255,0.06)' } : {}}>
      <div className="py-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold" style={{ color: '#FFFFFF' }}>{disc.authorName ?? 'Explorer'}</span>
          <span className="text-xs" style={{ color: '#71717A' }}>· {timeAgo(disc.createdAt)}</span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>{disc.content}</p>
        {user && depth < 3 && (
          <button
            onClick={() => setReplying(!replying)}
            className="text-xs mt-2 transition-colors"
            style={{ color: '#71717A' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#0A84FF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#71717A'; }}
          >
            Reply
          </button>
        )}
        {replying && (
          <div className="mt-3 flex flex-col gap-2">
            <textarea
              autoFocus
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Your reply…"
              rows={2}
              className="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none transition-all"
              style={{
                background: '#1C1C1E',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#FFFFFF',
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setReplying(false); setReplyText(''); }}
                className="text-xs px-3 py-1.5"
                style={{ color: '#71717A' }}
              >
                Cancel
              </button>
              <button
                disabled={replyText.trim().length < 2 || replyMut.isPending}
                onClick={() => replyMut.mutate(replyText.trim())}
                className="text-xs px-4 py-1.5 rounded-xl font-semibold disabled:opacity-50"
                style={{ background: '#0A84FF', color: '#FFFFFF' }}
              >
                {replyMut.isPending ? 'Posting…' : 'Reply'}
              </button>
            </div>
          </div>
        )}
      </div>
      {disc.replies?.map((r) => (
        <DiscussionThread key={r.id} disc={r} dropId={dropId} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function DropPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [comment, setComment] = useState('');

  const drop = useQuery({ queryKey: ['drop', id], queryFn: () => getDrop(id) });
  const discussions = useQuery({
    queryKey: ['discussions', id],
    queryFn: () => getDiscussions(id),
  });
  const topic = useQuery({
    queryKey: ['topic', drop.data?.topicId],
    queryFn: () => getTopic(drop.data!.topicId),
    enabled: !!drop.data?.topicId,
  });

  const createMut = useMutation({
    mutationFn: (content: string) => createDiscussion(id, content),
    onSuccess: () => {
      setComment('');
      qc.invalidateQueries({ queryKey: ['discussions', id] });
    },
  });

  return (
    <div className="flex flex-col gap-10 max-w-2xl">
      {/* Breadcrumb */}
      {topic.data && (
        <Link href={`/topics/${drop.data?.topicId}`} className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70" style={{ color: '#0A84FF' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {topic.data.title}
        </Link>
      )}

      {/* Drop — journal entry style */}
      {drop.isLoading ? (
        <div className="flex flex-col gap-3">
          <div className="h-4 w-24 rounded-lg animate-pulse" style={{ background: '#111111' }} />
          <div className="h-24 rounded-2xl animate-pulse" style={{ background: '#111111' }} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-lg sm:text-xl leading-relaxed font-normal" style={{ color: '#FFFFFF', lineHeight: 1.7 }}>
            {drop.data?.content}
          </p>
          <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-sm font-medium" style={{ color: '#A1A1AA' }}>{drop.data?.authorName ?? 'Explorer'}</span>
            {drop.data?.createdAt && (
              <>
                <span style={{ color: '#71717A' }}>·</span>
                <span className="text-sm" style={{ color: '#71717A' }}>{timeAgo(drop.data.createdAt)}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Discussion section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#71717A' }}>
            Discussion {discussions.data?.length ? `(${discussions.data.length})` : ''}
          </span>
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {user ? (
          <div className="flex flex-col gap-3">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add to the discussion…"
              rows={3}
              className="w-full rounded-2xl px-5 py-4 text-sm resize-none focus:outline-none transition-all"
              style={{
                background: '#111111',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#FFFFFF',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(10,132,255,0.4)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
            <div className="flex justify-end">
              <button
                disabled={comment.trim().length < 2 || createMut.isPending}
                onClick={() => createMut.mutate(comment.trim())}
                className="px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: '#0A84FF', color: '#FFFFFF' }}
              >
                {createMut.isPending ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-sm" style={{ color: '#A1A1AA' }}>Sign in to join the discussion.</span>
            <Link href="/auth" className="text-sm font-semibold" style={{ color: '#0A84FF' }}>Sign in</Link>
          </div>
        )}

        {discussions.isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: '#111111' }} />
            ))}
          </div>
        ) : discussions.data?.length === 0 ? (
          <p className="text-sm" style={{ color: '#71717A' }}>No discussion yet. Start one above.</p>
        ) : (
          <div>
            {discussions.data?.map((d, idx) => (
              <div key={d.id} style={{ borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <DiscussionThread disc={d} dropId={id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
