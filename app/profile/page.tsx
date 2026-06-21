'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getUserStats, getUserDrops, getUserTopics } from '@/services/userService';
import { useAuthStore } from '@/store/authStore';
import { getTopicEmoji, timeAgo } from '@/lib/design';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#71717A' }}>{children}</span>
      <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/auth');
  }, [user, isLoading, router]);

  const stats = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: () => getUserStats(user!.id),
    enabled: !!user,
  });

  const drops = useQuery({
    queryKey: ['user-drops', user?.id],
    queryFn: () => getUserDrops(user!.id),
    enabled: !!user,
  });

  const topics = useQuery({
    queryKey: ['user-topics', user?.id],
    queryFn: () => getUserTopics(user!.id),
    enabled: !!user,
  });

  function handleSignOut() {
    clearAuth();
    router.push('/');
  }

  if (!user) return null;

  return (
    <div className="flex flex-col gap-10 max-w-xl">
      {/* Identity */}
      <div className="flex items-start justify-between pt-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">{user.displayName}</h1>
          <p className="text-sm" style={{ color: '#71717A' }}>
            {user.username && <span>@{user.username} · </span>}
            Explorer #{user.explorerNumber}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm px-4 py-2 rounded-xl transition-colors"
          style={{ color: '#71717A', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#FF453A'; e.currentTarget.style.borderColor = 'rgba(255,69,58,0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#71717A'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          Sign out
        </button>
      </div>

      {/* Stats */}
      {stats.data && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: 'Drops', value: stats.data.dropsShared },
            { label: 'Discussions', value: stats.data.discussionsJoined },
            { label: 'Topics', value: stats.data.topicsCreated },
            { label: 'Explored', value: stats.data.topicsExplored },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-2xl font-bold mb-1">{s.value}</div>
              <div className="text-xs" style={{ color: '#71717A' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* My Drops */}
      {(drops.data?.length ?? 0) > 0 && (
        <section>
          <SectionLabel>My Drops</SectionLabel>
          <div className="flex flex-col">
            {drops.data!.map((d, idx) => (
              <Link
                key={d.id}
                href={`/drops/${d.id}`}
                className="block py-4 transition-opacity hover:opacity-70"
                style={{ borderBottom: idx < drops.data!.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
              >
                <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#FFFFFF' }}>{d.content}</p>
                <p className="text-xs mt-1.5" style={{ color: '#71717A' }}>{timeAgo(d.createdAt)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* My Destinations */}
      {(topics.data?.length ?? 0) > 0 && (
        <section>
          <SectionLabel>My Destinations</SectionLabel>
          <div className="flex flex-col gap-2">
            {topics.data!.map((t) => (
              <Link
                key={t.id}
                href={`/topics/${t.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-150 group"
                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
              >
                <span className="text-base">{getTopicEmoji(t.title)}</span>
                <span className="text-sm flex-1">{t.title}</span>
                <svg className="opacity-0 group-hover:opacity-100 transition-opacity" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </section>
      )}

      {drops.data?.length === 0 && topics.data?.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p style={{ color: '#71717A' }}>Nothing here yet.</p>
          <Link href="/feed" className="text-sm font-medium" style={{ color: '#0A84FF' }}>
            Start exploring →
          </Link>
        </div>
      )}
    </div>
  );
}
