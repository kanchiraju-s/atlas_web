'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { deleteTopic } from '@/services/topicService';
import { useAuthStore } from '@/store/authStore';

export function DeleteButton({ topicId, createdBy }: { topicId: string; createdBy?: string }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);

  const mut = useMutation({
    mutationFn: () => deleteTopic(topicId),
    onSuccess: () => router.replace('/feed'),
  });

  if (!user || user.id !== createdBy) return null;

  return (
    <div style={{ flexShrink: 0, paddingTop: 4 }}>
      {confirm ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Delete?</span>
          <button onClick={() => mut.mutate()} disabled={mut.isPending}
            style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>
            {mut.isPending ? 'Deleting…' : 'Yes'}
          </button>
          <button onClick={() => setConfirm(false)} style={{ fontSize: 12, color: 'var(--text-muted)' }}>No</button>
        </div>
      ) : (
        <button onClick={() => setConfirm(true)}
          style={{ fontSize: 12, color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px' }}>
          Delete
        </button>
      )}
    </div>
  );
}
