'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDrop } from '@/services/dropService';
import { useAuthStore } from '@/store/authStore';

export function ComposeArea({ topicId }: { topicId: string }) {
  const user = useAuthStore((s) => s.user);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: (content: string) => createDrop(topicId, content),
    onSuccess: () => {
      setDraft('');
      setComposing(false);
      qc.invalidateQueries({ queryKey: ['drops', topicId] });
      // Refresh the server-rendered page to show the new drop
      window.location.reload();
    },
  });

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Sign in to share your experience.</span>
        <Link href="/auth" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>Sign in</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '14px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
      {composing ? (
        <div>
          <textarea
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Share your experience…"
            rows={4}
            style={{ width: '100%', background: 'none', border: 'none', outline: 'none', fontSize: 15, lineHeight: 1.65, color: 'var(--text-primary)', resize: 'none', marginBottom: 12 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              onClick={() => { setComposing(false); setDraft(''); }}
              style={{ fontSize: 13, color: 'var(--text-muted)', padding: '6px 12px' }}
            >
              Cancel
            </button>
            <button
              disabled={draft.trim().length < 3 || mut.isPending}
              onClick={() => mut.mutate(draft.trim())}
              style={{ fontSize: 13, fontWeight: 600, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 18px', cursor: 'pointer', opacity: draft.trim().length < 3 ? 0.5 : 1 }}
            >
              {mut.isPending ? 'Posting…' : 'Drop it'}
            </button>
          </div>
          {mut.isError && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 8 }}>Failed to post. Try again.</p>}
        </div>
      ) : (
        <button
          onClick={() => setComposing(true)}
          style={{ fontSize: 14, color: 'var(--text-muted)', width: '100%', textAlign: 'left', padding: 0 }}
        >
          Share your experience on this topic…
        </button>
      )}
    </div>
  );
}
