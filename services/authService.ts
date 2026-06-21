import { api, type AuthTokens } from '@/lib/api';

export async function signInWithGoogle(idToken: string): Promise<AuthTokens> {
  return api.post<AuthTokens>('/auth/google', { idToken });
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  return api.postDirect<AuthTokens>('/auth/refresh', { refreshToken });
}

export async function signOut(refreshToken: string): Promise<void> {
  await api.post<void>('/auth/logout', { refreshToken });
}
