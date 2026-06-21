import { api, type FeedResponse } from '@/lib/api';

export async function getFeed(): Promise<FeedResponse> {
  return api.get<FeedResponse>('/feed');
}
