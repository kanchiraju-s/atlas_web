'use client';

import { useEffect, useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { signInWithGoogle } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import type { AuthTokens } from '@/lib/api';

function WaitlistScreen({ displayName }: { displayName: string }) {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 24, textAlign: 'center', maxWidth: 360, margin: '0 auto' }}>
      <div style={{ fontSize: 40, lineHeight: 1 }}>🌍</div>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
          You're on the waitlist, {displayName.split(' ')[0]}.
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-secondary)' }}>
          Atlas alpha is limited to 500 explorers. You've secured your spot — we'll let you know when it's your turn.
        </p>
      </div>
      <div style={{ width: '100%', padding: '16px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>While you wait</p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>You can browse topics and drops as a guest.</p>
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        <a href="/feed" style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent)' }}>Browse as guest</a>
        <button onClick={clearAuth} style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
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
    if (user.status === 'WAITLISTED') setWaitlisted({ displayName: user.displayName });
    else window.location.replace('/feed');
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSuccess(credentialResponse: CredentialResponse) {
    const idToken = credentialResponse.credential;
    if (!idToken) { setError('No credential received.'); return; }
    setLoading(true);
    setError(null);
    try {
      const tokens: AuthTokens = await signInWithGoogle(idToken);
      setAuth(tokens);
      if (tokens.status === 'WAITLISTED') setWaitlisted({ displayName: tokens.displayName });
      else window.location.replace('/feed');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign-in failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (waitlisted) return <WaitlistScreen displayName={waitlisted.displayName} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 36 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Atlas</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 10 }}>A map of human experiences.</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Sign in to explore and share.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        {loading ? (
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Signing in…</p>
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
        {error && <p style={{ fontSize: 13, color: 'var(--danger)', textAlign: 'center', maxWidth: 280 }}>{error}</p>}
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>500 explorer spots · Free during alpha</p>
    </div>
  );
}
