'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { createTopic, searchTopics } from '@/services/topicService';
import { useAuthStore } from '@/store/authStore';
import { ApiError } from '@/lib/api';

export default function CreateTopicPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [title, setTitle] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/auth');
  }, [user, isLoading, router]);

  const existingTopics = useQuery({
    queryKey: ['topic-search-existing', title],
    queryFn: () => searchTopics(title.trim()),
    enabled: isDuplicate && title.trim().length > 0,
  });

  const mutation = useMutation({
    mutationFn: createTopic,
    onSuccess: (topic) => router.push(`/topics/${topic.id}`),
    onError: (err) => {
      if (err instanceof ApiError && (err.status === 409 || err.status === 400)) {
        setIsDuplicate(true);
      }
    },
  });

  function handleSubmit() {
    setIsDuplicate(false);
    mutation.mutate(title.trim());
  }

  const exactMatch = existingTopics.data?.find(
    (t) => t.title.toLowerCase() === title.trim().toLowerCase(),
  ) ?? existingTopics.data?.[0];

  return (
    <div className="max-w-lg flex flex-col gap-8 pt-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
          New Destination
        </h1>
        <p className="text-sm" style={{ color: '#71717A' }}>
          Create a topic that others can drop experiences into.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setIsDuplicate(false); }}
          placeholder="e.g. Solo travel in Japan"
          maxLength={120}
          className="w-full py-4 px-5 text-base rounded-2xl focus:outline-none transition-all duration-200"
          style={{
            background: '#111111',
            border: isDuplicate ? '1px solid rgba(255,196,0,0.4)' : '1px solid rgba(255,255,255,0.08)',
            color: '#FFFFFF',
          }}
          onFocus={(e) => {
            if (!isDuplicate) e.currentTarget.style.borderColor = 'rgba(10,132,255,0.4)';
          }}
          onBlur={(e) => {
            if (!isDuplicate) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && title.trim().length >= 3) handleSubmit();
          }}
        />

        {isDuplicate && (
          <div className="rounded-2xl px-5 py-4 flex flex-col gap-2" style={{ background: 'rgba(255,196,0,0.06)', border: '1px solid rgba(255,196,0,0.2)' }}>
            <p className="text-sm font-medium" style={{ color: '#FFD60A' }}>
              This destination already exists.
            </p>
            {exactMatch ? (
              <Link
                href={`/topics/${exactMatch.id}`}
                className="text-sm font-medium"
                style={{ color: '#0A84FF' }}
              >
                Go to "{exactMatch.title}" →
              </Link>
            ) : (
              <p className="text-xs" style={{ color: '#A1A1AA' }}>Try searching for it instead.</p>
            )}
          </div>
        )}

        {mutation.isError && !isDuplicate && (
          <p className="text-red-400 text-sm">Failed to create. Try again.</p>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs" style={{ color: '#71717A' }}>{title.length}/120</span>
          <button
            disabled={title.trim().length < 3 || mutation.isPending}
            onClick={handleSubmit}
            className="px-6 py-3 rounded-2xl font-semibold text-sm disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ background: '#0A84FF', color: '#FFFFFF' }}
          >
            {mutation.isPending ? 'Creating…' : 'Create Destination'}
          </button>
        </div>
      </div>
    </div>
  );
}
