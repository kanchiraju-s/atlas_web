import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Nav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Atlas — Human experiences mapped.',
  description: 'Discover accumulated human experiences on any topic.',
};

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <QueryProvider>
            <AuthProvider>
              <Nav />
              <main className="max-w-4xl mx-auto px-4 py-8">
                {children}
              </main>
            </AuthProvider>
          </QueryProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
