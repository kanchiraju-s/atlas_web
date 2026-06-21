import { api, type Drop, type DropPreview, type PagedDrops } from '@/lib/api';

export async function getDrop(id: string): Promise<Drop> {
  return api.get<Drop>(`/drops/${encodeURIComponent(id)}`);
}

export async function getDrops(topicId: string, page = 0): Promise<PagedDrops> {
  return api.get<PagedDrops>(`/topics/${encodeURIComponent(topicId)}/drops?page=${page}`);
}

export async function createDrop(topicId: string, content: string): Promise<Drop> {
  return api.post<Drop>(`/topics/${encodeURIComponent(topicId)}/drops`, { content });
}

export async function searchDrops(q: string): Promise<DropPreview[]> {
  return api.get<DropPreview[]>(`/drops/search?q=${encodeURIComponent(q)}`);
}
