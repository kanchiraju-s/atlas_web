'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const navLink: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-secondary)',
  padding: '6px 10px',
  borderRadius: 8,
  transition: 'color 150ms',
};

export function Nav() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: 660, margin: '0 auto', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Atlas
        </Link>

        <div className="hidden sm:flex items-center" style={{ gap: 2 }}>
          <Link href="/feed" style={navLink} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>Explore</Link>
          <Link href="/search" style={navLink} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>Search</Link>
          {user ? (
            <>
              <Link href="/create/drop" style={navLink} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>Drop</Link>
              <Link href="/profile" style={{ ...navLink, color: 'var(--accent)', fontWeight: 500 }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                {user.displayName.split(' ')[0]}
              </Link>
              <button onClick={() => { clearAuth(); router.push('/'); }} style={{ ...navLink, cursor: 'pointer', border: 'none', background: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                Sign out
              </button>
            </>
          ) : (
            <Link href="/auth" style={{ marginLeft: 8, padding: '6px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
              Sign in
            </Link>
          )}
        </div>

        <div className="sm:hidden">
          {!user && (
            <Link href="/auth" style={{ padding: '6px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
