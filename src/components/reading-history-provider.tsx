'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useReadingHistory } from '@/hooks/use-reading-history';

type ReadingHistoryContextValue = ReturnType<typeof useReadingHistory>;

const ReadingHistoryContext = createContext<ReadingHistoryContextValue | null>(
  null,
);

export function ReadingHistoryProvider({ children }: { children: ReactNode }) {
  const value = useReadingHistory();
  return (
    <ReadingHistoryContext.Provider value={value}>
      {children}
    </ReadingHistoryContext.Provider>
  );
}

export function useReadingHistoryContext() {
  const ctx = useContext(ReadingHistoryContext);
  if (!ctx) {
    throw new Error(
      'useReadingHistoryContext must be used within ReadingHistoryProvider',
    );
  }
  return ctx;
}
