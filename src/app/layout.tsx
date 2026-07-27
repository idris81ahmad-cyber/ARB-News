import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ErrorBoundary } from '@/components/error-boundary';
import { PageTransition } from '@/components/page-transition';
import { Providers } from '@/components/providers';
import { SiteFooter } from '@/components/site-footer';
import { getSiteUrl } from '@/lib/site';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ARB News — The Pulse of Nigeria',
    template: '%s | ARB News',
  },
  description:
    'Live Nigerian news feed covering Politics, Sports, Entertainment, Business, Culture, and Environment. Save stories, search headlines, and switch themes.',
  applicationName: 'ARB News',
  keywords: [
    'Nigeria news',
    'Nigerian headlines',
    'Lagos',
    'Abuja',
    'ARB News',
    'Naija',
  ],
  authors: [{ name: 'ARB News' }],
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: siteUrl,
    siteName: 'ARB News',
    title: 'ARB News — The Pulse of Nigeria',
    description:
      'Nigerian headlines with save, search, and light/dark theme. Built for Naija.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ARB News — The Pulse of Nigeria',
    description:
      'Live Nigerian headlines across politics, sports, business, and culture.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#007a33' },
    { media: '(prefers-color-scheme: dark)', color: '#0b3d1f' },
  ],
  width: 'device-width',
  initialScale: 1,
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
