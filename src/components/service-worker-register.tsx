'use client';

import { useEffect, useState } from 'react';

export function ServiceWorkerRegister() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(typeof navigator !== 'undefined' ? !navigator.onLine : false);

    const onOffline = () => setOffline(true);
    const onOnline = () => setOffline(false);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* registration optional */
      });
    }

    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      className="border-b border-sky-200 bg-sky-50 px-4 py-2 text-center text-sm text-sky-950 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100"
      role="status"
    >
      You&apos;re offline. Saved stories remain available; live feed may be stale or unavailable.
    </div>
  );
}
