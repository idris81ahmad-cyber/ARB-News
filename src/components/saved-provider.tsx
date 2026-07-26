'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useSavedArticles } from '@/hooks/use-saved-articles';

type SavedContextValue = ReturnType<typeof useSavedArticles>;

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const value = useSavedArticles();
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error('useSaved must be used within SavedProvider');
  return ctx;
}
