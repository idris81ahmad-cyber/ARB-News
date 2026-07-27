import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Offline',
  description: 'You are offline — open saved stories.',
};

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <div className="text-4xl" aria-hidden>
        📡
      </div>
      <h1 className="text-2xl font-bold text-naija-green">You&apos;re offline</h1>
      <p className="text-muted-foreground">
        Live headlines need a connection. Your <strong>Saved</strong> stories still work
        on this device from local storage.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href="/saved">Open saved stories</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Try homepage</Link>
        </Button>
      </div>
    </div>
  );
}
