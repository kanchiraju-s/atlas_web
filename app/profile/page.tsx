'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getUserStats, getUserDrops, getUserTopics } from '@/services/userService';
import { useAuthStore } from '@/store/authStore';
import { getTopicEmoji, timeAgo } from '@/lib/design';

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/auth');
  }, [user, isLoading, router]);

  const stats = useQuery({ queryKey: ['user-stats', user?.id], queryFn: () => getUserStats(user!.id), enabled: !!user });
  const drops = useQuery({ queryKey: ['user-drops', user?.id], queryFn: () => getUserDrops(user!.id), enabled: !!user });
  const topics = useQuery({ queryKey: ['user-topics', user?.id], queryFn: () => getUserTopics(user!.id), enabled: !!user });

  if (!user) return null;

  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 };

  return (
    <div>
      {/* Identity */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>{user.displayName}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {user.username && `@${user.username} · `}Explorer #{user.explorerNumber}
          </p>
        </div>
        <button
          onClick={() => { clearAuth(); router.push('/'); }}
          style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', transition: 'color 150ms, border-color 150ms' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'rgba(255,69,58,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          Sign out
        </button>
      </div>

      {/* Stats */}
      {stats.data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, marginBottom: 48, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--border)' }}>
          {[
            { label: 'Drops', value: stats.data.dropsShared },
            { label: 'Discussions', value: stats.data.discussionsJoined },
            { label: 'Topics', value: stats.data.topicsCreated },
            { label: 'Explored', value: stats.data.topicsExplored },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg)', padding: '20px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* My Drops */}
      {(drops.data?.length ?? 0) > 0 && (
        <section style={{ marginBottom: 40 }}>
          <div style={labelStyle}>My drops</div>
          <div>
            {drops.data!.map((d, idx) => (
              <Link key={d.id} href={`/drops/${d.id}`}
                style={{ display: 'block', padding: '18px 0', borderBottom: idx < drops.data!.length - 1 ? '1px solid var(--border)' : 'none', transition: 'opacity 150ms' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              >
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{d.content}</p>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(d.createdAt)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* My Destinations */}
      {(topics.data?.length ?? 0) > 0 && (
        <section>
          <div style={labelStyle}>My destinations</div>
          <div>
            {topics.data!.map((t, i) => (
              <Link key={t.id} href={`/topics/${t.slug ?? t.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: i < topics.data!.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 14, color: 'var(--text-primary)', transition: 'opacity 150ms' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.6'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              >
                <span style={{ fontSize: 16 }}>{getTopicEmoji(t.title)}</span>
                {t.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {drops.data?.length === 0 && topics.data?.length === 0 && (
        <div style={{ paddingTop: 60, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>Nothing here yet.</p>
          <Link href="/feed" style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent)' }}>Start exploring →</Link>
        </div>
      )}
    </div>
  );
}
