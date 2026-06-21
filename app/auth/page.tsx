'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { signInWithGoogle } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import type { AuthTokens } from '@/lib/api';

function WaitlistScreen({ displayName }: { displayName: string }) {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center max-w-sm mx-auto">
      <div className="text-5xl">🌍</div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-[#f8fafc] tracking-tight">
          You're on the waitlist, {displayName.split(' ')[0]}.
        </h1>
        <p className="text-[#94a3b8] text-sm leading-relaxed">
          Atlas alpha is limited to 500 explorers. You've secured your spot —
          we'll let you know when it's your turn.
        </p>
      </div>
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl px-6 py-4 flex flex-col gap-1">
        <p className="text-[#94a3b8] text-xs uppercase tracking-widest font-semibold">While you wait</p>
        <p className="text-[#cbd5e1] text-sm">You can still read topics and drops — just sign in to explore.</p>
      </div>
      <div className="flex gap-4">
        <a href="/feed" className="text-[#38bdf8] text-sm hover:underline">Browse as guest</a>
        <button onClick={clearAuth} className="text-[#94a3b8] text-sm hover:text-[#f8fafc] transition-colors">
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [waitlisted, setWaitlisted] = useState<{ displayName: string } | null>(null);

  // Handle already-logged-in users landing on /auth
  useEffect(() => {
    if (isLoading) return;
    if (!user) return;
    if (user.status === 'WAITLISTED') {
      setWaitlisted({ displayName: user.displayName });
    } else {
      router.replace('/feed');
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSuccess(credentialResponse: CredentialResponse) {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      setError('No credential received from Google.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const tokens: AuthTokens = await signInWithGoogle(idToken);
      setAuth(tokens);
      if (tokens.status === 'WAITLISTED') {
        setWaitlisted({ displayName: tokens.displayName });
      } else {
        router.replace('/feed');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign-in failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (waitlisted) {
    return <WaitlistScreen displayName={waitlisted.displayName} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <h1 className="text-4xl font-black text-[#f8fafc] tracking-tight">Atlas</h1>
        <p className="text-[#38bdf8] font-semibold text-lg">Human experiences mapped.</p>
        <p className="text-[#94a3b8] text-sm leading-relaxed">
          Google helps you find information.<br />
          Reddit helps you find discussions.<br />
          Atlas helps you discover human experiences.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        {loading ? (
          <div className="text-[#94a3b8] text-sm">Signing in…</div>
        ) : (
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError('Google sign-in failed. Please try again.')}
            theme="filled_black"
            size="large"
            text="continue_with"
            shape="rectangular"
          />
        )}
        {error && (
          <p className="text-red-400 text-sm text-center max-w-xs">{error}</p>
        )}
      </div>

      <p className="text-[#94a3b8] text-xs">
        500 explorer spots · Free forever during alpha
      </p>
    </div>
  );
}
