import { redirect, notFound } from 'next/navigation';
import { serverGetDrop, serverGetTopicForDrop } from '@/lib/server';

// Redirect old /drops/[id] links to canonical /topics/[slug]/drops/[id]
export default async function OldDropRedirect(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const drop = await serverGetDrop(id);
  if (!drop) notFound();

  const topic = await serverGetTopicForDrop(drop.topicId);
  const slug = topic?.slug ?? drop.topicId;
  redirect(`/topics/${slug}/drops/${id}`);
}
