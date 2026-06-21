'use client';

import { create } from 'zustand';
import { ApiError, setAccessToken, setRefreshHandler, type AuthTokens, type CurrentUser } from '@/lib/api';
import { refreshTokens } from '@/services/authService';

const REFRESH_TOKEN_KEY = 'atlas_refresh_token';

function isTokenRejected(err: unknown): boolean {
  return err instanceof ApiError && (err.status === 401 || err.status === 403);
}

function getStoredRefresh(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setStoredRefresh(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

function clearStoredRefresh() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

interface AuthState {
  user: CurrentUser | null;
  isLoading: boolean;
  hydrationFailed: boolean;
  setAuth: (tokens: AuthTokens) => void;
  clearAuth: () => void;
  hydrateAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  hydrationFailed: false,

  setAuth: (tokens: AuthTokens) => {
    setAccessToken(tokens.accessToken);
    setStoredRefresh(tokens.refreshToken);
    set({
      hydrationFailed: false,
      user: {
        id: tokens.userId,
        username: tokens.username,
        displayName: tokens.displayName,
        explorerNumber: tokens.explorerNumber,
        status: tokens.status,
      },
    });
  },

  clearAuth: () => {
    setAccessToken(null);
    clearStoredRefresh();
    set({ user: null, hydrationFailed: false });
  },

  hydrateAuth: async () => {
    try {
      const storedRefresh = getStoredRefresh();
      if (!storedRefresh) return;

      const tokens = await refreshTokens(storedRefresh);
      setAccessToken(tokens.accessToken);
      setStoredRefresh(tokens.refreshToken);
      set({
        hydrationFailed: false,
        user: {
          id: tokens.userId,
          username: tokens.username,
          displayName: tokens.displayName,
          explorerNumber: tokens.explorerNumber,
          status: tokens.status,
        },
      });
    } catch (err) {
      if (isTokenRejected(err)) {
        clearStoredRefresh();
        set({ user: null, hydrationFailed: false });
      } else {
        set({ hydrationFailed: true });
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));

setRefreshHandler(async () => {
  try {
    const storedRefresh = getStoredRefresh();
    if (!storedRefresh) return null;

    const tokens = await refreshTokens(storedRefresh);
    setStoredRefresh(tokens.refreshToken);
    useAuthStore.setState({
      hydrationFailed: false,
      user: {
        id: tokens.userId,
        username: tokens.username,
        displayName: tokens.displayName,
        explorerNumber: tokens.explorerNumber,
        status: tokens.status,
      },
    });
    return tokens.accessToken;
  } catch (err) {
    if (isTokenRejected(err)) {
      clearStoredRefresh();
      useAuthStore.setState({ user: null, hydrationFailed: false });
    }
    return null;
  }
});
