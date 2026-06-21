'use client';

import { useEffect, useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { signInWithGoogle } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import type { AuthTokens } from '@/lib/api';

function WaitlistScreen({ displayName }: { displayName: string }) {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 text-center max-w-sm mx-auto">
      <div className="text-5xl">🌍</div>
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight">
          You're on the waitlist, {displayName.split(' ')[0]}.
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>
          Atlas alpha is limited to 500 explorers. You've secured your spot —
          we'll let you know when it's your turn.
        </p>
      </div>
      <div className="w-full rounded-2xl px-6 py-5 flex flex-col gap-1 text-left" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: '#71717A' }}>While you wait</p>
        <p className="text-sm" style={{ color: '#A1A1AA' }}>You can still browse topics and drops as a guest.</p>
      </div>
      <div className="flex gap-6">
        <a href="/feed" className="text-sm font-medium" style={{ color: '#0A84FF' }}>Browse as guest</a>
        <button onClick={clearAuth} className="text-sm transition-colors" style={{ color: '#71717A' }}>
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [waitlisted, setWaitlisted] = useState<{ displayName: string } | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;
    if (user.status === 'WAITLISTED') {
      setWaitlisted({ displayName: user.displayName });
    } else {
      window.location.replace('/feed');
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSuccess(credentialResponse: CredentialResponse) {
    const idToken = credentialResponse.credential;
    if (!idToken) { setError('No credential received.'); return; }
    setLoading(true);
    setError(null);
    try {
      const tokens: AuthTokens = await signInWithGoogle(idToken);
      setAuth(tokens);
      if (tokens.status === 'WAITLISTED') {
        setWaitlisted({ displayName: tokens.displayName });
      } else {
        window.location.replace('/feed');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign-in failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (waitlisted) return <WaitlistScreen displayName={waitlisted.displayName} />;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-10">
      <div className="flex flex-col items-center gap-4 text-center max-w-xs">
        <div className="text-4xl mb-2">🌍</div>
        <h1 className="text-3xl font-black tracking-tight" style={{ letterSpacing: '-0.02em' }}>
          Atlas
        </h1>
        <p className="text-base leading-relaxed" style={{ color: '#A1A1AA' }}>
          A map of human experiences.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        {loading ? (
          <div className="text-sm" style={{ color: '#71717A' }}>Signing in…</div>
        ) : (
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError('Google sign-in failed. Please try again.')}
            theme="filled_black"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="300"
          />
        )}
        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}
      </div>

      <p className="text-xs" style={{ color: '#71717A' }}>
        500 explorer spots · Free during alpha
      </p>
    </div>
  );
}
