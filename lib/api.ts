const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let _accessToken: string | null = null;
let _refreshFn: (() => Promise<string | null>) | null = null;

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

export function setRefreshHandler(fn: () => Promise<string | null>) {
  _refreshFn = fn;
}

const REQUEST_TIMEOUT_MS = 10_000;

async function request<T>(path: string, init: RequestInit, retry = true): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(_accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));

  if (res.status === 401 && retry && _refreshFn) {
    const newToken = await _refreshFn();
    if (newToken) {
      _accessToken = newToken;
      return request<T>(path, init, false);
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, `${init.method ?? 'GET'} ${path} failed: ${res.status}`);
  }

  const json: ApiEnvelope<T> = await res.json();
  return json.data;
}

async function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

async function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

async function postDirect<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) }, false);
}

async function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

export const api = { get, post, postDirect, del };

// ─── Domain types (mirrored from mobile src/lib/api.ts) ───────────────────────

export interface Topic {
  id: string;
  title: string;
  createdAt: string;
}

export interface Drop {
  id: string;
  topicId: string;
  authorId: string;
  authorName?: string;
  content: string;
  createdAt: string;
  discussionCount?: number;
}

export interface PagedDrops {
  drops: Drop[];
  page: number;
  hasMore: boolean;
}

export interface Discussion {
  id: string;
  dropId: string;
  authorId: string;
  authorName?: string;
  content: string;
  createdAt: string;
  parentDiscussionId?: string;
  replies: Discussion[];
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export interface UserStats {
  dropsShared: number;
  discussionsJoined: number;
  topicsCreated: number;
  topicsExplored: number;
}

export interface DropPreview {
  dropId: string;
  topicId: string;
  topicTitle: string;
  authorId?: string;
  authorName?: string;
  content: string;
  createdAt?: string;
  discussionCount: number;
}

export interface DiscussionPreview {
  topicId: string;
  topicTitle: string;
  dropId: string;
  dropContent: string;
  discussionCount: number;
}

export interface FeedResponse {
  trendingTopics: Topic[];
  recentDrops: DropPreview[];
  continueDiscussions: DiscussionPreview[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  userId: string;
  explorerNumber: number;
  status: 'ACTIVE' | 'WAITLISTED';
  displayName: string;
  username: string;
}

export interface CurrentUser {
  id: string;
  username: string;
  displayName: string;
  explorerNumber: number;
  status: 'ACTIVE' | 'WAITLISTED';
}
