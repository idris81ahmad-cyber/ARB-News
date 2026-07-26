'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { persistence } from '@/lib/persistence';
import type { ThemeMode } from '@/types/article';

const THEME_KEY = 'theme';

function systemTheme(): ThemeMode {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

type ThemeContextValue = {
  theme: ThemeMode;
  ready: boolean;
  storageError: string | null;
  setTheme: (theme: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await persistence.getItem(THEME_KEY);
        if (cancelled) return;
        const next =
          stored === 'light' || stored === 'dark' ? stored : systemTheme();
        setThemeState(next);
        document.documentElement.classList.toggle('dark', next === 'dark');
      } catch {
        if (!cancelled) {
          const next = systemTheme();
          setThemeState(next);
          document.documentElement.classList.toggle('dark', next === 'dark');
          setStorageError('Could not load theme preference.');
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setTheme = useCallback(async (next: ThemeMode) => {
    setThemeState(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      await persistence.setItem(THEME_KEY, next);
      setStorageError(null);
    } catch {
      setStorageError('Could not save theme preference.');
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    await setTheme(theme === 'light' ? 'dark' : 'light');
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({ theme, ready, storageError, setTheme, toggleTheme }),
    [theme, ready, storageError, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
