'use client';

import type { ReactNode } from 'react';
import { SavedProvider } from '@/components/saved-provider';
import { ThemeProvider } from '@/components/theme-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SavedProvider>{children}</SavedProvider>
    </ThemeProvider>
  );
}
