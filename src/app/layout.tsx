import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ErrorBoundary } from '@/components/error-boundary';
import { PageTransition } from '@/components/page-transition';
import { Providers } from '@/components/providers';
import { SiteFooter } from '@/components/site-footer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'ARB News — The Pulse of Nigeria',
    template: '%s | ARB News',
  },
  description:
    'Modern Nigerian news feed covering Politics, Sports, Entertainment, Business, Culture, and Environment.',
  openGraph: {
    title: 'ARB News — The Pulse of Nigeria',
    description:
      'Nigerian headlines with save, search, and light/dark theme. Built for Naija.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          <ErrorBoundary>
            <main id="main-content" className="flex-1" tabIndex={-1}>
              <PageTransition>{children}</PageTransition>
            </main>
            <SiteFooter />
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
