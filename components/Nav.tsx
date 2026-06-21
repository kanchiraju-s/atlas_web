'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { signOut } from '@/services/authService';

export function Nav() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  async function handleSignOut() {
    clearAuth();
    router.push('/');
  }

  return (
    <nav className="border-b border-[#1e293b] bg-[#0f172a] sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-[#f8fafc] font-black text-xl tracking-tight">
          Atlas
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/feed" className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors">
            Explore
          </Link>
          <Link href="/search" className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors">
            Search
          </Link>
          {user ? (
            <>
              <Link href="/create/drop" className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors">
                Drop
              </Link>
              <Link href="/profile" className="text-[#38bdf8] hover:text-[#38bdf8]/80 transition-colors font-medium">
                {user.displayName}
              </Link>
              <button
                onClick={handleSignOut}
                className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="bg-[#38bdf8] text-[#0f172a] px-4 py-1.5 rounded-lg font-semibold hover:bg-[#38bdf8]/90 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
