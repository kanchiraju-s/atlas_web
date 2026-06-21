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

  const topic = useQuery({ queryKey: ['topic', id], queryFn: () => getTopic(id) });
  const drops = useQuery({ queryKey: ['drops', id], queryFn: () => getDrops(id) });

  const createDropMut = useMutation({
    mutationFn: (content: string) => createDrop(id, content),
    onSuccess: () => { setDraft(''); setComposing(false); qc.invalidateQueries({ queryKey: ['drops', id] }); },
  });

  const deleteTopicMut = useMutation({
    mutationFn: () => deleteTopic(id),
    onSuccess: () => router.replace('/feed'),
  });

  const emoji = topic.data ? getTopicEmoji(topic.data.title) : '🌍';

  return (
    <div>
      {/* Destination header */}
      <div style={{ marginBottom: 40 }}>
        {topic.isLoading ? (
          <>
            <div style={{ height: 40, width: 40, background: 'var(--surface)', borderRadius: 8, marginBottom: 12 }} />
            <div style={{ height: 24, width: '60%', background: 'var(--surface)', borderRadius: 6 }} />
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontSize: 32, marginBottom: 8, lineHeight: 1 }}>{emoji}</div>
                <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 6 }}>
                  {topic.data?.title}
                </h1>
                {(drops.data?.drops.length ?? 0) > 0 && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {drops.data!.drops.length} {drops.data!.drops.length === 1 ? 'experience' : 'experiences'}
                  </p>
                )}
              </div>

              {user && topic.data?.createdBy === user.id && (
                <div>
                  {confirmDelete ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Delete?</span>
                      <button onClick={() => deleteTopicMut.mutate()} disabled={deleteTopicMut.isPending}
                        style={{ fontSize: 12, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        {deleteTopicMut.isPending ? 'Deleting…' : 'Yes'}
                      </button>
                      <button onClick={() => setConfirmDelete(false)}
                        style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        No
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(true)}
                      style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer' }}>
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
      <div style={{ marginBottom: 40, padding: '16px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        {user ? (
          composing ? (
            <div>
              <textarea
                autoFocus
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Share your experience…"
                rows={4}
                style={{
                  width: '100%', background: 'none', border: 'none', outline: 'none',
                  fontSize: 15, lineHeight: 1.65, color: 'var(--text-primary)', resize: 'none',
                  marginBottom: 12,
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button onClick={() => { setComposing(false); setDraft(''); }}
                  style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px' }}>
                  Cancel
                </button>
                <button
                  disabled={draft.trim().length < 3 || createDropMut.isPending}
                  onClick={() => createDropMut.mutate(draft.trim())}
                  style={{ fontSize: 13, fontWeight: 600, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 18px', cursor: 'pointer', opacity: draft.trim().length < 3 ? 0.5 : 1 }}>
                  {createDropMut.isPending ? 'Posting…' : 'Drop it'}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setComposing(true)}
              style={{ fontSize: 14, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', padding: 0 }}>
              Share your experience on this topic…
            </button>
          )
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Sign in to share your experience.</span>
            <Link href="/auth" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>Sign in</Link>
          </div>
        )}
      </div>

      {/* Drops — journal entries */}
      {drops.isLoading ? (
        <div>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ height: 15, width: '85%', background: 'var(--surface)', borderRadius: 4, marginBottom: 8 }} />
              <div style={{ height: 15, width: '65%', background: 'var(--surface)', borderRadius: 4, marginBottom: 12 }} />
              <div style={{ height: 11, width: '20%', background: 'var(--surface)', borderRadius: 4 }} />
            </div>
          ))}
        </div>
      ) : drops.data?.drops.length === 0 ? (
        <p style={{ fontSize: 14, color: 'var(--text-muted)', padding: '40px 0' }}>No experiences yet. Be the first.</p>
      ) : (
        <div>
          {drops.data?.drops.map((drop, idx) => (
            <Link
              key={drop.id}
              href={`/drops/${drop.id}`}
              style={{
                display: 'block', padding: '20px 0',
                borderBottom: idx < (drops.data?.drops.length ?? 0) - 1 ? '1px solid var(--border)' : 'none',
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
      )}
    </div>
  );
}
