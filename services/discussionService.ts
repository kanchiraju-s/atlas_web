import { api, type Discussion, type DiscussionPreview } from '@/lib/api';

export async function getDiscussions(dropId: string): Promise<Discussion[]> {
  return api.get<Discussion[]>(`/drops/${encodeURIComponent(dropId)}/discussions`);
}

export async function createDiscussion(
  dropId: string,
  content: string,
  parentDiscussionId?: string,
): Promise<Discussion> {
  return api.post<Discussion>(`/drops/${encodeURIComponent(dropId)}/discussions`, {
    content,
    ...(parentDiscussionId ? { parentDiscussionId } : {}),
  });
}

export async function searchDiscussions(q: string): Promise<DiscussionPreview[]> {
  return api.get<DiscussionPreview[]>(`/discussions/search?q=${encodeURIComponent(q)}`);
}
