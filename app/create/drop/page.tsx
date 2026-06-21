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
    onSuccess: drop => router.push(`/drops/${drop.id}`),
  });

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px', fontSize: 14,
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 10, color: 'var(--text-primary)', outline: 'none', transition: 'border-color 150ms',
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 36 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>Drop an Experience</h1>
        <Link href="/create/topic" style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent)' }}>+ New destination</Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Destination */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Destination</p>
          {selectedTopic ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', background: 'var(--surface)', border: '1px solid rgba(10,132,255,0.3)', borderRadius: 10 }}>
              <span style={{ fontSize: 16 }}>{getTopicEmoji(selectedTopic.title)}</span>
              <span style={{ fontSize: 14, flex: 1 }}>{selectedTopic.title}</span>
              <button onClick={() => setSelectedTopic(null)}
                style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                Change
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={topicQuery}
                onChange={e => setTopicQuery(e.target.value)}
                placeholder="Search for a destination…"
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(10,132,255,0.5)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
              {(topicSearch.data?.length ?? 0) > 0 && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                  background: '#141414', border: '1px solid var(--border)',
                  borderRadius: 10, overflow: 'hidden', zIndex: 10,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                }}>
                  {topicSearch.data!.map(t => (
                    <button key={t.id}
                      onClick={() => { setSelectedTopic(t); setTopicQuery(''); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                    >
                      <span style={{ fontSize: 16 }}>{getTopicEmoji(t.title)}</span>
                      {t.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Your experience</p>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Share your experience, story, opinion, or honest take…"
            rows={8}
            maxLength={2000}
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.65 }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(10,132,255,0.5)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{content.length}/2000</span>
            <button
              disabled={!selectedTopic || content.trim().length < 10 || mutation.isPending}
              onClick={() => mutation.mutate()}
              style={{
                padding: '10px 22px', background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600,
                cursor: !selectedTopic || content.trim().length < 10 ? 'default' : 'pointer',
                opacity: !selectedTopic || content.trim().length < 10 ? 0.5 : 1,
              }}
            >
              {mutation.isPending ? 'Dropping…' : 'Drop it'}
            </button>
          </div>
          {mutation.isError && <p style={{ fontSize: 13, color: 'var(--danger)', marginTop: 8 }}>Failed to post. Try again.</p>}
        </div>
      </div>
    </div>
  );
}

export default function CreateDropPage() {
  return <Suspense><CreateDropForm /></Suspense>;
}
