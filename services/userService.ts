import { api, type Drop, type Topic, type UserProfile, type UserStats } from '@/lib/api';

export async function getUser(id: string): Promise<UserProfile> {
  return api.get<UserProfile>(`/users/${encodeURIComponent(id)}`);
}

export async function getUserStats(id: string): Promise<UserStats> {
  return api.get<UserStats>(`/users/${encodeURIComponent(id)}/stats`);
}

export async function getUserDrops(id: string): Promise<Drop[]> {
  return api.get<Drop[]>(`/users/${encodeURIComponent(id)}/drops`);
}

export async function getUserTopics(id: string): Promise<Topic[]> {
  return api.get<Topic[]>(`/users/${encodeURIComponent(id)}/topics`);
}
