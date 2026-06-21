'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { getDrop } from '@/services/dropService';
import { getDiscussions, createDiscussion } from '@/services/discussionService';
import { getTopic } from '@/services/topicService';
import { TimeAgo } from '@/components/TimeAgo';
import { useAuthStore } from '@/store/authStore';
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
    <div className={depth > 0 ? 'ml-6 border-l border-[#1e293b] pl-4' : ''}>
      <div className="py-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[#38bdf8] text-xs font-medium">{disc.authorName ?? 'Explorer'}</span>
          <TimeAgo date={disc.createdAt} />
        </div>
        <p className="text-[#f8fafc] text-sm leading-relaxed">{disc.content}</p>
        {user && depth < 3 && (
          <button
            onClick={() => setReplying(!replying)}
            className="text-[#94a3b8] text-xs mt-2 hover:text-[#f8fafc] transition-colors"
          >
            Reply
          </button>
        )}
        {replying && (
          <div className="mt-2 flex flex-col gap-2">
            <textarea
              autoFocus
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Your reply…"
              rows={2}
              className="w-full bg-[#0f172a] border border-[#1e293b] text-[#f8fafc] rounded-lg px-3 py-2 text-sm placeholder:text-[#94a3b8] resize-none focus:outline-none focus:border-[#38bdf8]/50"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setReplying(false); setReplyText(''); }}
                className="text-[#94a3b8] text-xs px-3 py-1.5 hover:text-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                disabled={replyText.trim().length < 2 || replyMut.isPending}
                onClick={() => replyMut.mutate(replyText.trim())}
                className="bg-[#38bdf8] text-[#0f172a] text-xs px-4 py-1.5 rounded-lg font-semibold disabled:opacity-50"
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
    <div className="flex flex-col gap-8">
      {/* Drop */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6">
        {drop.isLoading ? (
          <div className="flex flex-col gap-2">
            <div className="h-4 w-32 bg-[#1e293b] rounded animate-pulse" />
            <div className="h-20 bg-[#1e293b] rounded animate-pulse" />
          </div>
        ) : (
          <>
            {topic.data && (
              <Link href={`/topics/${drop.data?.topicId}`} className="text-[#38bdf8] text-xs font-medium hover:underline mb-3 block">
                {topic.data.title}
              </Link>
            )}
            <p className="text-[#f8fafc] text-base leading-relaxed">{drop.data?.content}</p>
            <div className="flex items-center gap-3 mt-4 text-[#94a3b8] text-xs">
              <span>{drop.data?.authorName ?? 'Explorer'}</span>
              <TimeAgo date={drop.data?.createdAt} />
            </div>
          </>
        )}
      </div>

      {/* Discussion composer */}
      <div>
        <h2 className="text-[#94a3b8] text-xs uppercase tracking-widest font-semibold mb-4">
          Discussion
        </h2>
        {user ? (
          <div className="flex flex-col gap-2 mb-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add to the discussion…"
              rows={3}
              className="w-full bg-[#111827] border border-[#1e293b] text-[#f8fafc] rounded-xl px-4 py-3 text-sm placeholder:text-[#94a3b8] resize-none focus:outline-none focus:border-[#38bdf8]/50"
            />
            <div className="flex justify-end">
              <button
                disabled={comment.trim().length < 2 || createMut.isPending}
                onClick={() => createMut.mutate(comment.trim())}
                className="bg-[#38bdf8] text-[#0f172a] px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-[#38bdf8]/90 transition-colors"
              >
                {createMut.isPending ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between mb-6">
            <span className="text-[#94a3b8] text-sm">Sign in to join the discussion.</span>
            <Link href="/auth" className="text-[#38bdf8] text-sm font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        )}

        {discussions.isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-[#111827] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : discussions.data?.length === 0 ? (
          <p className="text-[#94a3b8] text-sm">No discussion yet. Start one above.</p>
        ) : (
          <div className="divide-y divide-[#1e293b]">
            {discussions.data?.map((d) => (
              <DiscussionThread key={d.id} disc={d} dropId={id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
