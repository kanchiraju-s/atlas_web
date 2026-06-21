import { Metadata } from 'next';
import Link from 'next/link';
import { serverGetTopic, serverGetDrops } from '@/lib/server';
import { getTopicEmoji, timeAgo } from '@/lib/design';
import { ComposeArea } from './ComposeArea';
import { DeleteButton } from './DeleteButton';

const SITE = 'https://www.lorva.app';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const topic = await serverGetTopic(id);
  if (!topic) return { title: 'Topic | Atlas' };

  const title = `${topic.title} – Experiences, Advice & Discussions`;
  const description = `Explore experiences, stories and advice about ${topic.title}. Discover recommendations and lessons shared by people who have already been there.`;
  const url = `${SITE}/topics/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function TopicPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [topic, drops] = await Promise.all([
    serverGetTopic(id),
    serverGetDrops(id),
  ]);

  const emoji = topic ? getTopicEmoji(topic.title) : '🌍';
  const url = `${SITE}/topics/${id}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': url,
        name: topic?.title,
        description: `Experiences and discussions about ${topic?.title}.`,
        url,
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Atlas', item: SITE },
          { '@type': 'ListItem', position: 2, name: topic?.title ?? 'Topic', item: url },
        ],
      },
      ...drops.map((drop, i) => ({
        '@type': 'DiscussionForumPosting',
        position: i + 1,
        headline: drop.content.slice(0, 110),
        text: drop.content,
        author: { '@type': 'Person', name: drop.authorName ?? 'Atlas Explorer' },
        datePublished: drop.createdAt,
        url: `${SITE}/drops/${drop.id}`,
        isPartOf: { '@id': url },
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        {/* Destination header — server-rendered, fully indexable */}
        <div style={{ marginBottom: 32 }}>
          {topic ? (
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontSize: 32, marginBottom: 8, lineHeight: 1 }}>{emoji}</div>
                <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
                  {topic.title}
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Discover experiences, stories and advice about {topic.title}.
                  {drops.length > 0 && ` ${drops.length} ${drops.length === 1 ? 'experience' : 'experiences'} shared.`}
                </p>
              </div>
              <DeleteButton topicId={id} createdBy={topic.createdBy} />
            </div>
          ) : (
            <div style={{ height: 24, width: '60%', background: 'var(--surface)', borderRadius: 6 }} />
          )}
        </div>

        {/* Compose — client boundary */}
        <ComposeArea topicId={id} />

        {/* Drops — server-rendered journal entries, fully indexable */}
        {drops.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--text-muted)', padding: '40px 0' }}>
            No experiences yet. Be the first.
          </p>
        ) : (
          <div>
            {drops.map((drop, idx) => (
              <Link
                key={drop.id}
                href={`/drops/${drop.id}`}
                style={{
                  display: 'block', padding: '20px 0',
                  borderBottom: idx < drops.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'opacity 150ms',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              >
                <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--text-primary)', marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {drop.content}
                </p>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {drop.authorName ?? 'Explorer'} · {timeAgo(drop.createdAt)}
                  {(drop.discussionCount ?? 0) > 0 && ` · ${drop.discussionCount} ${drop.discussionCount === 1 ? 'reply' : 'replies'}`}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
