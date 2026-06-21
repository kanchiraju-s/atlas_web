'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function Nav() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSignOut() {
    clearAuth();
    setMenuOpen(false);
    router.push('/');
  }

  return (
    <nav className="border-b border-[#1e293b] bg-[#0f172a] sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-[#f8fafc] font-black text-xl tracking-tight">
          Atlas
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/feed" className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors">Explore</Link>
          <Link href="/search" className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors">Search</Link>
          {user ? (
            <>
              <Link href="/create/drop" className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors">Drop</Link>
              <Link href="/profile" className="text-[#38bdf8] font-medium hover:text-[#38bdf8]/80 transition-colors truncate max-w-[120px]">
                {user.displayName}
              </Link>
              <button onClick={handleSignOut} className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors">
                Sign out
              </button>
            </>
          ) : (
            <Link href="/auth" className="bg-[#38bdf8] text-[#0f172a] px-4 py-1.5 rounded-lg font-semibold hover:bg-[#38bdf8]/90 transition-colors">
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile right side */}
        <div className="flex sm:hidden items-center gap-3">
          {!user && (
            <Link href="/auth" className="bg-[#38bdf8] text-[#0f172a] px-3 py-1.5 rounded-lg text-sm font-semibold">
              Sign in
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors p-1"
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-[#1e293b] bg-[#0f172a] px-4 py-3 flex flex-col gap-4 text-sm">
          <Link href="/feed" onClick={() => setMenuOpen(false)} className="text-[#94a3b8] hover:text-[#f8fafc]">Explore</Link>
          <Link href="/search" onClick={() => setMenuOpen(false)} className="text-[#94a3b8] hover:text-[#f8fafc]">Search</Link>
          {user ? (
            <>
              <Link href="/create/drop" onClick={() => setMenuOpen(false)} className="text-[#94a3b8] hover:text-[#f8fafc]">Drop something</Link>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="text-[#38bdf8] font-medium">
                {user.displayName}
              </Link>
              <button onClick={handleSignOut} className="text-[#94a3b8] text-left hover:text-[#f8fafc]">Sign out</button>
            </>
          ) : null}
        </div>
      )}
    </nav>
  );
}
