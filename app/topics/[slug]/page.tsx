import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { serverGetTopic, serverGetTopicBySlug, serverGetDrops, serverSearchTopics } from '@/lib/server';
import { getTopicEmoji, timeAgo } from '@/lib/design';
import { ComposeArea } from './ComposeArea';
import { DeleteButton } from './DeleteButton';

const SITE = 'https://www.lorva.app';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STOP_WORDS = new Set(['a','an','the','in','at','on','to','for','of','and','or','is','it','my','your','our','their','with','from','by','as','be','are','was','were','has','have','had','that','this','these','those','into','out','up','how','do','did','does','can','will','but','not','so','if','i']);

function getSearchKeyword(title: string): string {
  const words = title.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/);
  return words.find(w => w.length > 3 && !STOP_WORDS.has(w)) ?? words[0] ?? title;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const topic = UUID_RE.test(slug)
    ? await serverGetTopic(slug)
    : await serverGetTopicBySlug(slug);
  if (!topic) return { title: 'Topic | Atlas' };

  const resolvedSlug = topic.slug ?? slug;
  const url = `${SITE}/topics/${resolvedSlug}`;
  const title = `${topic.title} – Experiences, Advice & Discussions`;
  const description = `Explore experiences, stories and advice about ${topic.title} on Atlas. Discover recommendations and lessons shared by people who have already been there.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function TopicPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // UUID-based legacy links → redirect to slug URL
  if (UUID_RE.test(slug)) {
    const topic = await serverGetTopic(slug);
    if (topic?.slug) redirect(`/topics/${topic.slug}`);
  }

  const topic = await serverGetTopicBySlug(slug);
  const drops = topic ? await serverGetDrops(topic.id) : [];

  const emoji = topic ? getTopicEmoji(topic.title) : '🌍';
  const url = `${SITE}/topics/${slug}`;

  // Related topics: search by most distinctive word in title
  const relatedTopics = topic
    ? (await serverSearchTopics(getSearchKeyword(topic.title)))
        .filter(t => t.id !== topic.id)
        .slice(0, 4)
    : [];

  const jsonLd = topic ? {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': url,
        name: topic.title,
        description: `Experiences and discussions about ${topic.title}.`,
        url,
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Atlas', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Topics', item: `${SITE}/feed` },
          { '@type': 'ListItem', position: 3, name: topic.title, item: url },
        ],
      },
      ...drops.map((drop, i) => ({
        '@type': 'DiscussionForumPosting',
        position: i + 1,
        headline: drop.content.slice(0, 110),
        text: drop.content,
        author: { '@type': 'Person', name: drop.authorName ?? 'Atlas Explorer' },
        datePublished: drop.createdAt,
        url: `${url}/drops/${drop.id}`,
        isPartOf: { '@id': url },
      })),
    ],
  } : null;

  const crumbStyle: React.CSSProperties = { color: 'var(--text-muted)', textDecoration: 'none' };
  const chevron = (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}

      <div>
        {/* Breadcrumb — visible + indexable */}
        <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginBottom: 32, flexWrap: 'wrap' as const }}>
          <Link href="/" style={crumbStyle}>Atlas</Link>
          {chevron}
          <Link href="/feed" style={crumbStyle}>Topics</Link>
          {chevron}
          <span style={{ color: 'var(--text-secondary)' }}>{topic?.title ?? slug}</span>
        </nav>

        {/* Topic header */}
        <div style={{ marginBottom: 32 }}>
          {topic ? (
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontSize: 32, marginBottom: 10, lineHeight: 1 }}>{emoji}</div>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 10 }}>
                  {topic.title}
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: 480 }}>
                  Discover experiences, stories and advice about {topic.title}.
                  {drops.length > 0 && ` ${drops.length} ${drops.length === 1 ? 'experience' : 'experiences'} shared.`}
                </p>
              </div>
              <DeleteButton topicId={topic.id} createdBy={topic.createdBy} />
            </div>
          ) : (
            <div style={{ height: 24, width: '60%', background: 'var(--surface)', borderRadius: 6 }} />
          )}
        </div>

        {/* Compose — client boundary */}
        {topic && <ComposeArea topicId={topic.id} />}

        {/* Drops — server-rendered, fully indexable */}
        {drops.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--text-muted)', padding: '40px 0' }}>
            No experiences yet. Be the first.
          </p>
        ) : (
          <div>
            {drops.map((drop, idx) => (
              <Link
                key={drop.id}
                href={`/topics/${slug}/drops/${drop.id}`}
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

        {/* Related Topics */}
        {relatedTopics.length > 0 && (
          <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>
              Related Topics
            </p>
            <div>
              {relatedTopics.map((t, i) => (
                <Link
                  key={t.id}
                  href={`/topics/${t.slug ?? t.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 0',
                    borderBottom: i < relatedTopics.length - 1 ? '1px solid var(--border)' : 'none',
                    fontSize: 14, color: 'var(--text-primary)', transition: 'opacity 150ms',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.6'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                >
                  <span style={{ fontSize: 16 }}>{getTopicEmoji(t.title)}</span>
                  {t.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
