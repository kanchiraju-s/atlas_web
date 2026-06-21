'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getUser, getUserStats, getUserDrops, getUserTopics } from '@/services/userService';
import { useAuthStore } from '@/store/authStore';
import { TimeAgo } from '@/components/TimeAgo';

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
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#f8fafc] tracking-tight">{user.displayName}</h1>
          <p className="text-[#94a3b8] text-sm mt-1">@{user.username} · Explorer #{user.explorerNumber}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="text-[#94a3b8] text-sm border border-[#1e293b] px-4 py-2 rounded-lg hover:text-[#f8fafc] hover:border-[#38bdf8]/30 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Stats */}
      {stats.data && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Drops', value: stats.data.dropsShared },
            { label: 'Discussions', value: stats.data.discussionsJoined },
            { label: 'Topics created', value: stats.data.topicsCreated },
            { label: 'Topics explored', value: stats.data.topicsExplored },
          ].map((s) => (
            <div key={s.label} className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-[#f8fafc]">{s.value}</div>
              <div className="text-[#94a3b8] text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* My Drops */}
      {(drops.data?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-[#94a3b8] text-xs uppercase tracking-widest font-semibold mb-3">My Drops</h2>
          <div className="flex flex-col gap-3">
            {drops.data!.map((d) => (
              <Link
                key={d.id}
                href={`/drops/${d.id}`}
                className="block bg-[#111827] border border-[#1e293b] rounded-xl p-4 hover:border-[#38bdf8]/30 transition-colors"
              >
                <p className="text-[#f8fafc] text-sm leading-relaxed line-clamp-2">{d.content}</p>
                <TimeAgo date={d.createdAt} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* My Topics */}
      {(topics.data?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-[#94a3b8] text-xs uppercase tracking-widest font-semibold mb-3">My Topics</h2>
          <div className="flex flex-wrap gap-2">
            {topics.data!.map((t) => (
              <Link
                key={t.id}
                href={`/topics/${t.id}`}
                className="border border-[#1e293b] text-[#cbd5e1] px-4 py-2 rounded-full text-sm hover:border-[#38bdf8]/40 hover:text-[#f8fafc] transition-colors"
              >
                {t.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
