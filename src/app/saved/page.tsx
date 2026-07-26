import type { Metadata } from 'next';
import { SavedPageClient } from '@/components/saved-page-client';

export const metadata: Metadata = {
  title: 'Saved articles',
  description: 'Your saved ARB News stories.',
};

export default function SavedPage() {
  return <SavedPageClient />;
}
