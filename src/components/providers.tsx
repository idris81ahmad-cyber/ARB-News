'use client';

import type { ReactNode } from 'react';
import { ReadingHistoryProvider } from '@/components/reading-history-provider';
import { SavedProvider } from '@/components/saved-provider';
import { ServiceWorkerRegister } from '@/components/service-worker-register';
import { ThemeProvider } from '@/components/theme-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SavedProvider>
        <ReadingHistoryProvider>
          <ServiceWorkerRegister />
          {children}
        </ReadingHistoryProvider>
      </SavedProvider>
    </ThemeProvider>
  );
}
