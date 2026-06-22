import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverGetDrop, serverGetTopicBySlug } from '@/lib/server';
import { timeAgo } from '@/lib/design';
import { DiscussionSection } from './DiscussionSection';

const SITE = 'https://www.lorva.app';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string; id: string }> }
): Promise<Metadata> {
  const { slug, id } = await params;
  const [drop, topic] = await Promise.all([
    serverGetDrop(id),
    serverGetTopicBySlug(slug),
  ]);
  if (!drop) return { title: 'Experience | Atlas' };

  const headline = drop.content.length > 120
    ? drop.content.slice(0, drop.content.indexOf(' ', 100)).trim() + '…'
    : drop.content;
  const title = topic ? `${headline} – ${topic.title}` : headline;
  const description = drop.content.slice(0, 200);
  const url = `${SITE}/topics/${slug}/drops/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'article' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function DropPage(
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const [drop, topic] = await Promise.all([
    serverGetDrop(id),
    serverGetTopicBySlug(slug),
  ]);

  if (!drop) notFound();

  const url = `${SITE}/topics/${slug}/drops/${id}`;
  const topicUrl = `${SITE}/topics/${slug}`;

  const jsonLd = {
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
            '@id': topicUrl,
            name: topic.title,
          },
        } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Atlas', item: SITE },
          { '@type': 'ListItem', position: 2, name: topic?.title ?? 'Topic', item: topicUrl },
          { '@type': 'ListItem', position: 3, name: 'Experience', item: url },
        ],
      },
    ],
  };

  const crumbStyle: React.CSSProperties = { color: 'var(--text-muted)', textDecoration: 'none' };
  const chevron = (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div>
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginBottom: 32, flexWrap: 'wrap' as const }}>
          <Link href="/" style={crumbStyle}>Atlas</Link>
          {chevron}
          <Link href={`/topics/${slug}`} style={crumbStyle}>{topic?.title ?? slug}</Link>
          {chevron}
          <span style={{ color: 'var(--text-secondary)' }}>Experience</span>
        </nav>

        {/* Drop content — server-rendered, fully indexable */}
        <div style={{ marginBottom: 40, paddingBottom: 32, borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 18, lineHeight: 1.75, color: 'var(--text-primary)', fontWeight: 400, marginBottom: 20 }}>
            {drop.content}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {drop.authorName ?? 'Explorer'}
            {drop.createdAt && ` · ${timeAgo(drop.createdAt)}`}
          </p>
        </div>

        {/* Discussions — client boundary */}
        <DiscussionSection dropId={id} />
      </div>
    </>
  );
}
