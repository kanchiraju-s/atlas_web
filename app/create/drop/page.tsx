'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { createDrop } from '@/services/dropService';
import { searchTopics } from '@/services/topicService';
import { useAuthStore } from '@/store/authStore';
import { getTopicEmoji } from '@/lib/design';
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
    <div className="max-w-lg flex flex-col gap-8 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
          Drop an Experience
        </h1>
        <Link href="/create/topic" className="text-sm font-medium" style={{ color: '#0A84FF' }}>
          + New destination
        </Link>
      </div>

      {/* Destination picker */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#71717A' }}>
          Destination
        </label>
        {selectedTopic ? (
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5" style={{ background: '#111111', border: '1px solid rgba(10,132,255,0.3)' }}>
            <span>{getTopicEmoji(selectedTopic.title)}</span>
            <span className="text-sm flex-1">{selectedTopic.title}</span>
            <button
              onClick={() => setSelectedTopic(null)}
              className="text-xs transition-colors"
              style={{ color: '#71717A' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#71717A'; }}
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
              placeholder="Search for a destination…"
              className="w-full py-3.5 px-4 text-sm rounded-2xl focus:outline-none transition-all"
              style={{
                background: '#111111',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#FFFFFF',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(10,132,255,0.4)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
            {(topicSearch.data?.length ?? 0) > 0 && (
              <div className="absolute top-full mt-1 w-full rounded-2xl overflow-hidden z-10" style={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
                {topicSearch.data!.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTopic(t); setTopicQuery(''); }}
                    className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span className="text-base">{getTopicEmoji(t.title)}</span>
                    <span>{t.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#71717A' }}>
          Your experience
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience, story, opinion, or honest take…"
          rows={7}
          maxLength={2000}
          className="w-full rounded-2xl px-5 py-4 text-sm resize-none focus:outline-none transition-all leading-relaxed"
          style={{
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#FFFFFF',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(10,132,255,0.4)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: '#71717A' }}>{content.length}/2000</span>
          <button
            disabled={!selectedTopic || content.trim().length < 10 || mutation.isPending}
            onClick={() => mutation.mutate()}
            className="px-6 py-3 rounded-2xl font-semibold text-sm disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ background: '#0A84FF', color: '#FFFFFF' }}
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
