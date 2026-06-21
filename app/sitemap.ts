import { MetadataRoute } from 'next';
import { serverSearchTopics } from '@/lib/server';

const SITE = 'https://www.lorva.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const topics = await serverSearchTopics('');

  const topicEntries: MetadataRoute.Sitemap = topics.map((t) => ({
    url: `${SITE}/topics/${t.id}`,
    lastModified: t.createdAt ? new Date(t.createdAt) : new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    { url: SITE, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE}/feed`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE}/search`, changeFrequency: 'weekly', priority: 0.5 },
    ...topicEntries,
  ];
}
