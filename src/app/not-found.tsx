import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-naija-green">Story not found</h1>
      <p className="text-muted-foreground">
        That headline may have moved or never existed.
      </p>
      <Button asChild>
        <Link href="/">Back to news feed</Link>
      </Button>
    </div>
  );
}
