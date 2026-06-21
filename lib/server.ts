// Server-side data fetching — no auth, public content only
const API = process.env.NEXT_PUBLIC_API_URL ?? '';

interface Envelope<T> { success: boolean; data: T; message: string; }

async function apiFetch<T>(path: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    const json: Envelope<T> = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export interface ServerTopic {
  id: string;
  title: string;
  createdAt: string;
  createdBy?: string;
}

export interface ServerDrop {
  id: string;
  topicId: string;
  content: string;
  authorName?: string | null;
  createdAt: string;
  discussionCount?: number;
}

export interface ServerDropsPage {
  drops: ServerDrop[];
}

export async function serverGetTopic(id: string): Promise<ServerTopic | null> {
  return apiFetch<ServerTopic>(`/topics/${encodeURIComponent(id)}`, 3600);
}

export async function serverGetDrops(topicId: string): Promise<ServerDrop[]> {
  const data = await apiFetch<ServerDropsPage>(`/topics/${encodeURIComponent(topicId)}/drops?page=0`, 300);
  return data?.drops ?? [];
}

export async function serverGetDrop(id: string): Promise<ServerDrop | null> {
  return apiFetch<ServerDrop>(`/drops/${encodeURIComponent(id)}`, 300);
}

export async function serverGetTopicForDrop(topicId: string): Promise<ServerTopic | null> {
  return apiFetch<ServerTopic>(`/topics/${encodeURIComponent(topicId)}`, 3600);
}

export async function serverSearchTopics(q: string): Promise<ServerTopic[]> {
  const data = await apiFetch<ServerTopic[]>(`/topics/search?q=${encodeURIComponent(q)}`, 3600);
  return data ?? [];
}
