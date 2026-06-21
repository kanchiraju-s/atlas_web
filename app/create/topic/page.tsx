'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { createTopic } from '@/services/topicService';
import { useAuthStore } from '@/store/authStore';

export default function CreateTopicPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (!isLoading && !user) router.replace('/auth');
  }, [user, isLoading, router]);

  const mutation = useMutation({
    mutationFn: createTopic,
    onSuccess: (topic) => router.push(`/topics/${topic.id}`),
  });

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
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Solo travel in Japan"
          maxLength={120}
          className="w-full bg-[#111827] border border-[#1e293b] text-[#f8fafc] rounded-xl px-5 py-4 text-base placeholder:text-[#94a3b8] focus:outline-none focus:border-[#38bdf8]/50"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && title.trim().length >= 3) {
              mutation.mutate(title.trim());
            }
          }}
        />
        <div className="flex items-center justify-between">
          <span className="text-[#94a3b8] text-xs">{title.length}/120</span>
          <button
            disabled={title.trim().length < 3 || mutation.isPending}
            onClick={() => mutation.mutate(title.trim())}
            className="bg-[#38bdf8] text-[#0f172a] px-6 py-3 rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-[#38bdf8]/90 transition-colors"
          >
            {mutation.isPending ? 'Creating…' : 'Create Topic'}
          </button>
        </div>
        {mutation.isError && (
          <p className="text-red-400 text-sm">Failed to create topic. Try again.</p>
        )}
      </div>
    </div>
  );
}
