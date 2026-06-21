'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { getTopic, deleteTopic } from '@/services/topicService';
import { getDrops, createDrop } from '@/services/dropService';
import { useAuthStore } from '@/store/authStore';
import { getTopicEmoji, timeAgo } from '@/lib/design';

export default function TopicPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const qc = useQueryClient();

  const topic = useQuery({
    queryKey: ['topic', id],
    queryFn: () => getTopic(id),
  });

  const drops = useQuery({
    queryKey: ['drops', id],
    queryFn: () => getDrops(id),
  });

  const createDropMut = useMutation({
    mutationFn: (content: string) => createDrop(id, content),
    onSuccess: () => {
      setDraft('');
      setComposing(false);
      qc.invalidateQueries({ queryKey: ['drops', id] });
    },
  });

  const deleteTopicMut = useMutation({
    mutationFn: () => deleteTopic(id),
    onSuccess: () => router.replace('/feed'),
  });

  const emoji = topic.data ? getTopicEmoji(topic.data.title) : '🌍';

  return (
    <div className="flex flex-col gap-10">
      {/* Destination header */}
      <div className="flex flex-col gap-4 pt-2">
        {topic.isLoading ? (
          <div className="flex flex-col gap-3">
            <div className="h-12 w-12 rounded-2xl animate-pulse" style={{ background: '#111111' }} />
            <div className="h-8 w-64 rounded-xl animate-pulse" style={{ background: '#111111' }} />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-4xl">{emoji}</span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                  {topic.data?.title}
                </h1>
                {(drops.data?.drops.length ?? 0) > 0 && (
                  <p className="text-sm" style={{ color: '#71717A' }}>
                    {drops.data!.drops.length} {drops.data!.drops.length === 1 ? 'experience' : 'experiences'}
                  </p>
                )}
              </div>

              {user && topic.data?.createdBy === user.id && (
                <div className="flex-shrink-0 pt-1">
                  {confirmDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: '#A1A1AA' }}>Delete?</span>
                      <button
                        onClick={() => deleteTopicMut.mutate()}
                        disabled={deleteTopicMut.isPending}
                        className="text-xs font-semibold text-red-400 disabled:opacity-50"
                      >
                        {deleteTopicMut.isPending ? 'Deleting…' : 'Yes'}
                      </button>
                      <button onClick={() => setConfirmDelete(false)} className="text-xs" style={{ color: '#71717A' }}>
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="text-xs px-3 py-1.5 rounded-xl transition-colors"
                      style={{ color: '#71717A', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Compose */}
      {user ? (
        <div className="rounded-2xl p-5 transition-all" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}>
          {composing ? (
            <div className="flex flex-col gap-4">
              <textarea
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Share your experience here…"
                rows={4}
                className="w-full bg-transparent resize-none focus:outline-none text-sm leading-relaxed"
                style={{ color: '#FFFFFF' }}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#71717A' }}>{draft.length} chars</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setComposing(false); setDraft(''); }}
                    className="text-sm px-4 py-2 rounded-xl transition-colors"
                    style={{ color: '#71717A' }}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={draft.trim().length < 3 || createDropMut.isPending}
                    onClick={() => createDropMut.mutate(draft.trim())}
                    className="px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-90"
                    style={{ background: '#0A84FF', color: '#FFFFFF' }}
                  >
                    {createDropMut.isPending ? 'Posting…' : 'Drop it'}
                  </button>
                </div>
              </div>
              {createDropMut.isError && (
                <p className="text-red-400 text-xs">Failed to post. Try again.</p>
              )}
            </div>
          ) : (
            <button
              onClick={() => setComposing(true)}
              className="text-sm w-full text-left transition-colors"
              style={{ color: '#71717A' }}
            >
              Share your experience on this topic…
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="text-sm" style={{ color: '#A1A1AA' }}>Sign in to share your experience.</span>
          <Link href="/auth" className="text-sm font-semibold" style={{ color: '#0A84FF' }}>
            Sign in
          </Link>
        </div>
      )}

      {/* Drops as journal entries */}
      {drops.isLoading ? (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: '#111111' }} />
          ))}
        </div>
      ) : drops.data?.drops.length === 0 ? (
        <p className="text-sm text-center py-12" style={{ color: '#71717A' }}>
          No experiences yet. Be the first to drop one.
        </p>
      ) : (
        <div className="flex flex-col">
          {drops.data?.drops.map((drop, idx) => (
            <Link
              key={drop.id}
              href={`/drops/${drop.id}`}
              className="block py-5 transition-all duration-150 group"
              style={{ borderBottom: idx < (drops.data?.drops.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
            >
              <p className="text-base leading-relaxed group-hover:opacity-80 transition-opacity" style={{ color: '#FFFFFF' }}>
                {drop.content}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs font-medium" style={{ color: '#71717A' }}>{drop.authorName ?? 'Explorer'}</span>
                <span className="text-xs" style={{ color: '#71717A' }}>·</span>
                <span className="text-xs" style={{ color: '#71717A' }}>{timeAgo(drop.createdAt)}</span>
                {(drop.discussionCount ?? 0) > 0 && (
                  <>
                    <span className="text-xs" style={{ color: '#71717A' }}>·</span>
                    <span className="text-xs" style={{ color: '#0A84FF' }}>{drop.discussionCount} {drop.discussionCount === 1 ? 'reply' : 'replies'}</span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
