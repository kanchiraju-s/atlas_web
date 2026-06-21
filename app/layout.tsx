import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Nav } from '@/components/Nav';
import { BottomNav } from '@/components/BottomNav';

const SITE = 'https://www.lorva.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Atlas — Human experiences mapped.',
    template: '%s | Atlas',
  },
  description: 'Discover accumulated human experiences on any topic. Atlas is a searchable map of real stories, advice and lessons from people who have already been there.',
  keywords: ['human experiences', 'personal stories', 'advice', 'reviews', 'community knowledge'],
  authors: [{ name: 'Atlas' }],
  creator: 'Atlas',
  openGraph: {
    type: 'website',
    siteName: 'Atlas',
    title: 'Atlas — Human experiences mapped.',
    description: 'Discover accumulated human experiences on any topic.',
    url: SITE,
  },
  twitter: {
    card: 'summary',
    title: 'Atlas — Human experiences mapped.',
    description: 'Discover accumulated human experiences on any topic.',
  },
  alternates: { canonical: SITE },
  robots: { index: true, follow: true },
};

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Prevent flash: apply stored theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('atlas-theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');})()` }} />
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <QueryProvider>
            <AuthProvider>
              <Nav />
              <main style={{ maxWidth: 660, margin: '0 auto', padding: '48px 20px 120px' }}>
                {children}
              </main>
              <BottomNav />
            </AuthProvider>
          </QueryProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
