'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { createDrop } from '@/services/dropService';
import { searchTopics } from '@/services/topicService';
import { useAuthStore } from '@/store/authStore';
import type { Topic } from '@/lib/api';

function CreateDropForm() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [topicQuery, setTopicQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!isLoading && !user) router.replace('/auth');
  }, [user, isLoading, router]);

  const topicSearch = useQuery({
    queryKey: ['topic-search', topicQuery],
    queryFn: () => searchTopics(topicQuery),
    enabled: topicQuery.length > 1 && !selectedTopic,
  });

  const mutation = useMutation({
    mutationFn: () => createDrop(selectedTopic!.id, content),
    onSuccess: (drop) => router.push(`/drops/${drop.id}`),
  });

  return (
    <div className="max-w-xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#f8fafc] tracking-tight">Drop something</h1>
        <Link href="/create/topic" className="text-[#38bdf8] text-sm hover:underline">
          + New topic
        </Link>
      </div>

      {/* Topic picker */}
      <div className="flex flex-col gap-2">
        <label className="text-[#94a3b8] text-xs uppercase tracking-widest font-semibold">Topic</label>
        {selectedTopic ? (
          <div className="flex items-center gap-3 bg-[#111827] border border-[#38bdf8]/40 rounded-xl px-4 py-3">
            <span className="text-[#f8fafc] text-sm flex-1">{selectedTopic.title}</span>
            <button
              onClick={() => setSelectedTopic(null)}
              className="text-[#94a3b8] text-xs hover:text-[#f8fafc]"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              value={topicQuery}
              onChange={(e) => setTopicQuery(e.target.value)}
              placeholder="Search for a topic…"
              className="w-full bg-[#111827] border border-[#1e293b] text-[#f8fafc] rounded-xl px-4 py-3 text-sm placeholder:text-[#94a3b8] focus:outline-none focus:border-[#38bdf8]/50"
            />
            {topicSearch.data && topicSearch.data.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden z-10">
                {topicSearch.data.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTopic(t); setTopicQuery(''); }}
                    className="w-full text-left px-4 py-3 text-sm text-[#f8fafc] hover:bg-[#1e293b] transition-colors"
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2">
        <label className="text-[#94a3b8] text-xs uppercase tracking-widest font-semibold">Your drop</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience, story, opinion, or question…"
          rows={6}
          maxLength={2000}
          className="w-full bg-[#111827] border border-[#1e293b] text-[#f8fafc] rounded-xl px-4 py-3 text-sm placeholder:text-[#94a3b8] resize-none focus:outline-none focus:border-[#38bdf8]/50"
        />
        <div className="flex items-center justify-between">
          <span className="text-[#94a3b8] text-xs">{content.length}/2000</span>
          <button
            disabled={!selectedTopic || content.trim().length < 10 || mutation.isPending}
            onClick={() => mutation.mutate()}
            className="bg-[#38bdf8] text-[#0f172a] px-6 py-3 rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-[#38bdf8]/90 transition-colors"
          >
            {mutation.isPending ? 'Dropping…' : 'Drop it'}
          </button>
        </div>
        {mutation.isError && (
          <p className="text-red-400 text-sm">Failed to post. Try again.</p>
        )}
      </div>
    </div>
  );
}

export default function CreateDropPage() {
  return (
    <Suspense>
      <CreateDropForm />
    </Suspense>
  );
}
