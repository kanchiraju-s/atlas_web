'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#0A84FF' : 'none'} stroke={active ? '#0A84FF' : '#71717A'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#0A84FF' : '#71717A'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function PersonIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#0A84FF' : '#71717A'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { theme, toggle } = useTheme();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50" style={{ background: 'rgba(17,17,17,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-around py-2 pb-safe">
        <Link href="/feed" className="flex flex-col items-center gap-1 px-5 py-2">
          <HomeIcon active={isActive('/feed')} />
          <span className="text-[10px] font-medium" style={{ color: isActive('/feed') ? '#0A84FF' : '#71717A' }}>Home</span>
        </Link>

        <Link href="/search" className="flex flex-col items-center gap-1 px-5 py-2">
          <SearchIcon active={isActive('/search')} />
          <span className="text-[10px] font-medium" style={{ color: isActive('/search') ? '#0A84FF' : '#71717A' }}>Search</span>
        </Link>

        {user && (
          <Link href="/create/drop" className="flex items-center justify-center w-10 h-10 rounded-2xl" style={{ background: '#0A84FF' }}>
            <PlusIcon />
          </Link>
        )}

        <button onClick={toggle} className="flex flex-col items-center gap-1 px-5 py-2" aria-label="Toggle theme">
          {theme === 'dark' ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
          <span className="text-[10px] font-medium" style={{ color: '#71717A' }}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>
        </button>

        <Link href={user ? '/profile' : '/auth'} className="flex flex-col items-center gap-1 px-5 py-2">
          <PersonIcon active={isActive('/profile') || isActive('/auth')} />
          <span className="text-[10px] font-medium" style={{ color: (isActive('/profile') || isActive('/auth')) ? '#0A84FF' : '#71717A' }}>
            {user ? 'Profile' : 'Sign in'}
          </span>
        </Link>
      </div>
    </nav>
  );
}
