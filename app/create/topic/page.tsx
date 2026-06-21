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

  // When a duplicate is detected, search for the existing topic to link to it
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
    <div className="max-w-xl flex flex-col gap-6">
      <h1 className="text-2xl font-black text-[#f8fafc] tracking-tight">Create a Topic</h1>
      <p className="text-[#94a3b8] text-sm">
        Topics are the destinations. People will drop experiences here.
      </p>

      <div className="flex flex-col gap-3">
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setIsDuplicate(false); }}
          placeholder="e.g. Solo travel in Japan"
          maxLength={120}
          className={`w-full bg-[#111827] border rounded-xl px-5 py-4 text-base text-[#f8fafc] placeholder:text-[#94a3b8] focus:outline-none transition-colors ${
            isDuplicate ? 'border-yellow-500/60 focus:border-yellow-500' : 'border-[#1e293b] focus:border-[#38bdf8]/50'
          }`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && title.trim().length >= 3) handleSubmit();
          }}
        />

        {/* Duplicate warning */}
        {isDuplicate && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 flex flex-col gap-2">
            <p className="text-yellow-400 text-sm font-medium">
              A topic with this name already exists.
            </p>
            {exactMatch ? (
              <Link
                href={`/topics/${exactMatch.id}`}
                className="text-[#38bdf8] text-sm hover:underline"
              >
                Go to "{exactMatch.title}" →
              </Link>
            ) : (
              <p className="text-[#94a3b8] text-xs">
                Try searching for it instead.
              </p>
            )}
          </div>
        )}

        {/* Generic error (not duplicate) */}
        {mutation.isError && !isDuplicate && (
          <p className="text-red-400 text-sm">Failed to create topic. Try again.</p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[#94a3b8] text-xs">{title.length}/120</span>
          <button
            disabled={title.trim().length < 3 || mutation.isPending}
            onClick={handleSubmit}
            className="bg-[#38bdf8] text-[#0f172a] px-6 py-3 rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-[#38bdf8]/90 transition-colors"
          >
            {mutation.isPending ? 'Creating…' : 'Create Topic'}
          </button>
        </div>
      </div>
    </div>
  );
}
