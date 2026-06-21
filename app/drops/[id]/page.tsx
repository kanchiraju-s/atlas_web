import { Metadata } from 'next';
import Link from 'next/link';
import { serverGetDrop, serverGetTopicForDrop } from '@/lib/server';
import { timeAgo } from '@/lib/design';
import { DiscussionSection } from './DiscussionSection';

const SITE = 'https://www.lorva.app';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const drop = await serverGetDrop(id);
  if (!drop) return { title: 'Experience | Atlas' };

  const topic = drop.topicId ? await serverGetTopicForDrop(drop.topicId) : null;
  const headline = drop.content.length > 120 ? drop.content.slice(0, 120) + '…' : drop.content;
  const title = topic ? `${headline} – ${topic.title} | Atlas` : `${headline} | Atlas`;
  const description = drop.content.slice(0, 200);
  const url = `${SITE}/drops/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'article' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function DropPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const drop = await serverGetDrop(id);
  const topic = drop?.topicId ? await serverGetTopicForDrop(drop.topicId) : null;

  const url = `${SITE}/drops/${id}`;
  const jsonLd = drop ? {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DiscussionForumPosting',
        '@id': url,
        headline: drop.content.slice(0, 110),
        text: drop.content,
        author: { '@type': 'Person', name: drop.authorName ?? 'Atlas Explorer' },
        datePublished: drop.createdAt,
        url,
        ...(topic ? {
          isPartOf: {
            '@type': 'CollectionPage',
            '@id': `${SITE}/topics/${drop.topicId}`,
            name: topic.title,
          },
        } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Atlas', item: SITE },
          ...(topic ? [{ '@type': 'ListItem', position: 2, name: topic.title, item: `${SITE}/topics/${drop.topicId}` }] : []),
          { '@type': 'ListItem', position: topic ? 3 : 2, name: 'Experience', item: url },
        ],
      },
    ],
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div>
        {/* Breadcrumb — server-rendered, helps Google understand hierarchy */}
        {topic && drop && (
          <Link
            href={`/topics/${drop.topicId}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, color: 'var(--accent)', marginBottom: 32, transition: 'opacity 150ms' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {topic.title}
          </Link>
        )}

        {/* Drop content — server-rendered, fully indexable */}
        {drop ? (
          <div style={{ marginBottom: 40, paddingBottom: 32, borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: 18, lineHeight: 1.75, color: 'var(--text-primary)', fontWeight: 400, marginBottom: 20 }}>
              {drop.content}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {drop.authorName ?? 'Explorer'}
              {drop.createdAt && ` · ${timeAgo(drop.createdAt)}`}
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: 40 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ height: 22, width: `${90 - i * 15}%`, background: 'var(--surface)', borderRadius: 4, marginBottom: 10 }} />
            ))}
          </div>
        )}

        {/* Discussion — client boundary */}
        <DiscussionSection dropId={id} />
      </div>
    </>
  );
}
