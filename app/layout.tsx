import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Nav } from '@/components/Nav';
import { BottomNav } from '@/components/BottomNav';

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
              <main className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-8 pb-28 sm:pb-16">
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
