import { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchContent } from './SearchContent';

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ q?: string }> }
): Promise<Metadata> {
  const { q } = await searchParams;
  if (q) {
    return {
      title: `"${q}" – Search`,
      description: `Search results for "${q}" on Atlas. Discover experiences, stories and advice related to ${q}.`,
      robots: { index: false, follow: true },
    };
  }
  return {
    title: 'Search',
    description: 'Search for topics, drops and discussions on Atlas.',
  };
}

export default async function SearchPage(
  { searchParams }: { searchParams: Promise<{ q?: string }> }
) {
  const { q } = await searchParams;
  return (
    <Suspense>
      <SearchContent initialQuery={q ?? ''} />
    </Suspense>
  );
}
