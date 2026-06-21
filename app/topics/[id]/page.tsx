'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { getTopic, deleteTopic } from '@/services/topicService';
import { getDrops, createDrop } from '@/services/dropService';
import { TimeAgo } from '@/components/TimeAgo';
import { useAuthStore } from '@/store/authStore';

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

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {topic.isLoading ? (
            <div className="h-8 w-64 bg-[#111827] rounded animate-pulse" />
          ) : (
            <h1 className="text-3xl font-black text-[#f8fafc] tracking-tight">
              {topic.data?.title}
            </h1>
          )}
        </div>

        {user && !topic.isLoading && (
          <div className="flex-shrink-0">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-[#94a3b8] text-xs">Delete this topic?</span>
                <button
                  onClick={() => deleteTopicMut.mutate()}
                  disabled={deleteTopicMut.isPending}
                  className="text-red-400 text-xs font-semibold hover:text-red-300 disabled:opacity-50 transition-colors"
                >
                  {deleteTopicMut.isPending ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-[#94a3b8] text-xs hover:text-[#f8fafc] transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-[#94a3b8] text-xs border border-[#1e293b] px-3 py-1.5 rounded-lg hover:text-red-400 hover:border-red-400/30 transition-colors"
              >
                Delete topic
              </button>
            )}
            {deleteTopicMut.isError && (
              <p className="text-red-400 text-xs mt-1 text-right">
                Failed — you may not have permission.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Compose */}
      {user ? (
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
          {composing ? (
            <div className="flex flex-col gap-3">
              <textarea
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Share your experience…"
                rows={4}
                className="w-full bg-transparent text-[#f8fafc] placeholder:text-[#94a3b8] resize-none focus:outline-none text-sm"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setComposing(false); setDraft(''); }}
                  className="text-[#94a3b8] text-sm px-4 py-2 hover:text-[#f8fafc] transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={draft.trim().length < 3 || createDropMut.isPending}
                  onClick={() => createDropMut.mutate(draft.trim())}
                  className="bg-[#38bdf8] text-[#0f172a] px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-[#38bdf8]/90 transition-colors"
                >
                  {createDropMut.isPending ? 'Dropping…' : 'Drop it'}
                </button>
              </div>
              {createDropMut.isError && (
                <p className="text-red-400 text-xs">Failed to post. Try again.</p>
              )}
            </div>
          ) : (
            <button
              onClick={() => setComposing(true)}
              className="text-[#94a3b8] text-sm w-full text-left hover:text-[#f8fafc] transition-colors"
            >
              Share your experience on this topic…
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between">
          <span className="text-[#94a3b8] text-sm">Sign in to share your experience.</span>
          <Link href="/auth" className="text-[#38bdf8] text-sm font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      )}

      {/* Drops */}
      {drops.isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-[#111827] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : drops.data?.drops.length === 0 ? (
        <p className="text-[#94a3b8] text-sm text-center py-12">
          No drops yet. Be the first to share an experience.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {drops.data?.drops.map((drop) => (
            <Link
              key={drop.id}
              href={`/drops/${drop.id}`}
              className="block bg-[#111827] border border-[#1e293b] rounded-xl p-4 hover:border-[#38bdf8]/30 transition-colors"
            >
              <p className="text-[#f8fafc] text-sm leading-relaxed">{drop.content}</p>
              <div className="flex items-center gap-3 mt-3 text-[#94a3b8] text-xs">
                <span>{drop.authorName ?? 'Explorer'}</span>
                <TimeAgo date={drop.createdAt} />
                {(drop.discussionCount ?? 0) > 0 && (
                  <span>{drop.discussionCount} discussion{drop.discussionCount !== 1 ? 's' : ''}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
