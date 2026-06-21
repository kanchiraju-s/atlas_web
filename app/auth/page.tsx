'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { signInWithGoogle } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

export default function AuthPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) router.replace('/feed');
  }, [user, isLoading, router]);

  async function handleSuccess(credentialResponse: CredentialResponse) {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      setError('No credential received from Google.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const tokens = await signInWithGoogle(idToken);
      setAuth(tokens);
      router.replace('/feed');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign-in failed. Try again.');
    } finally {
      setLoading(false);
    }
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
