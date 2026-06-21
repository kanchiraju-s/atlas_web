'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { createTopic, searchTopics } from '@/services/topicService';
import { useAuthStore } from '@/store/authStore';
import { ApiError } from '@/lib/api';

export default function CreateTopicPage() {
  return <Suspense><CreateTopicForm /></Suspense>;
}

function CreateTopicForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [title, setTitle] = useState(searchParams.get('title') ?? '');
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
      if (err instanceof ApiError && (err.status === 409 || err.status === 400)) setIsDuplicate(true);
    },
  });

  function handleSubmit() {
    setIsDuplicate(false);
    mutation.mutate(title.trim());
  }

  const exactMatch = existingTopics.data?.find(t => t.title.toLowerCase() === title.trim().toLowerCase()) ?? existingTopics.data?.[0];

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>New Destination</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Create a topic that others can drop experiences into.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          autoFocus
          type="text"
          value={title}
          onChange={e => { setTitle(e.target.value); setIsDuplicate(false); }}
          placeholder="e.g. Solo travel in Japan"
          maxLength={120}
          style={{
            width: '100%', padding: '14px 16px', fontSize: 15,
            background: 'var(--surface)', color: 'var(--text-primary)',
            border: isDuplicate ? '1px solid rgba(255,196,0,0.4)' : '1px solid var(--border)',
            borderRadius: 10, outline: 'none', transition: 'border-color 150ms',
          }}
          onFocus={e => { if (!isDuplicate) e.currentTarget.style.borderColor = 'rgba(10,132,255,0.5)'; }}
          onBlur={e => { if (!isDuplicate) e.currentTarget.style.borderColor = 'var(--border)'; }}
          onKeyDown={e => { if (e.key === 'Enter' && title.trim().length >= 3) handleSubmit(); }}
        />

        {isDuplicate && (
          <div style={{ background: 'rgba(255,196,0,0.06)', border: '1px solid rgba(255,196,0,0.2)', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#FFD60A', marginBottom: 6 }}>This destination already exists.</p>
            {exactMatch ? (
              <Link href={`/topics/${exactMatch.id}`} style={{ fontSize: 13, color: 'var(--accent)' }}>
                Go to "{exactMatch.title}" →
              </Link>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Try searching for it instead.</p>
            )}
          </div>
        )}

        {mutation.isError && !isDuplicate && (
          <p style={{ fontSize: 13, color: 'var(--danger)' }}>Failed to create. Try again.</p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{title.length}/120</span>
          <button
            disabled={title.trim().length < 3 || mutation.isPending}
            onClick={handleSubmit}
            style={{
              padding: '10px 22px', background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600,
              cursor: title.trim().length < 3 ? 'default' : 'pointer',
              opacity: title.trim().length < 3 ? 0.5 : 1,
            }}
          >
            {mutation.isPending ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
