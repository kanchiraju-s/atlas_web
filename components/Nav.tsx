'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function Nav() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  function handleSignOut() {
    clearAuth();
    router.push('/');
  }

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-[1100px] mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight text-white">
          Atlas
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          <Link href="/feed" className="px-3 py-1.5 rounded-lg text-sm transition-colors duration-150" style={{ color: '#A1A1AA' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={e => (e.currentTarget.style.color = '#A1A1AA')}
          >
            Explore
          </Link>
          <Link href="/search" className="px-3 py-1.5 rounded-lg text-sm transition-colors duration-150" style={{ color: '#A1A1AA' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={e => (e.currentTarget.style.color = '#A1A1AA')}
          >
            Search
          </Link>
          {user ? (
            <>
              <Link href="/create/drop" className="px-3 py-1.5 rounded-lg text-sm transition-colors duration-150" style={{ color: '#A1A1AA' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={e => (e.currentTarget.style.color = '#A1A1AA')}
              >
                Drop
              </Link>
              <Link href="/profile" className="ml-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 truncate max-w-[140px]"
                style={{ color: '#0A84FF' }}
              >
                {user.displayName.split(' ')[0]}
              </Link>
              <button onClick={handleSignOut} className="px-3 py-1.5 rounded-lg text-sm transition-colors duration-150" style={{ color: '#71717A' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={e => (e.currentTarget.style.color = '#71717A')}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/auth" className="ml-2 px-4 py-1.5 rounded-xl text-sm font-semibold transition-opacity duration-150 hover:opacity-90"
              style={{ background: '#0A84FF', color: '#FFFFFF' }}
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile: only show sign in if not authed */}
        <div className="sm:hidden">
          {!user && (
            <Link href="/auth" className="px-4 py-1.5 rounded-xl text-sm font-semibold"
              style={{ background: '#0A84FF', color: '#FFFFFF' }}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
