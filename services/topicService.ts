import { api, type Topic } from '@/lib/api';

export async function searchTopics(q: string): Promise<Topic[]> {
  return api.get<Topic[]>(`/topics/search?q=${encodeURIComponent(q)}`);
}

export async function getTopic(id: string): Promise<Topic> {
  return api.get<Topic>(`/topics/${encodeURIComponent(id)}`);
}

export async function createTopic(title: string): Promise<Topic> {
  return api.post<Topic>('/topics', { title });
}
