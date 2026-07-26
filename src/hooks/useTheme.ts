import { useCallback, useEffect, useState } from 'react';
import type { ThemeMode } from '../types/article';
import { persistence } from '../utils/persistence';

const THEME_KEY = 'theme';

function systemTheme(): ThemeMode {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await persistence.getItem(THEME_KEY);
        if (cancelled) return;
        if (stored === 'light' || stored === 'dark') {
          setThemeState(stored);
        } else {
          setThemeState(systemTheme());
        }
      } catch {
        if (!cancelled) {
          setThemeState(systemTheme());
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

  return { theme, setTheme, toggleTheme, ready, storageError };
}
