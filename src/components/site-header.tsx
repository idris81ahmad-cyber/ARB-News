'use client';

import { Bookmark, Moon, Newspaper, Sun } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSaved } from '@/components/saved-provider';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CATEGORIES, type CategoryFilter } from '@/types/article';

interface SiteHeaderProps {
  category?: CategoryFilter;
  searchQuery?: string;
  onCategoryChange?: (category: CategoryFilter) => void;
  onSearchChange?: (query: string) => void;
  showFilters?: boolean;
}

export function SiteHeader({
  category = 'All',
  searchQuery = '',
  onCategoryChange,
  onSearchChange,
  showFilters = true,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { savedArticles } = useSaved();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const savedCount = savedArticles.length;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-white/10 bg-naija-green text-white transition-shadow',
        scrolled && 'shadow-lg shadow-black/25',
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Link href="/" className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-naija-gold rounded-md">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            <span aria-hidden="true">🇳🇬 </span>ARB News
          </h1>
          <p className="text-sm text-naija-gold">The Pulse of Nigeria</p>
        </Link>

        <nav
          className="flex flex-wrap items-center gap-2"
          aria-label="Primary"
        >
          {showFilters && onCategoryChange && onSearchChange && (
            <>
              <label className="sr-only" htmlFor="category-filter">
                Filter by category
              </label>
              <Select
                id="category-filter"
                value={category}
                onChange={(e) =>
                  onCategoryChange(e.target.value as CategoryFilter)
                }
                aria-label="Filter articles by category"
                className="min-w-[8.5rem]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>

              <label className="sr-only" htmlFor="search-input">
                Search articles
              </label>
              <Input
                id="search-input"
                type="search"
                placeholder="Search headlines…"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label="Search articles by title, source, or content"
                className="w-full min-w-[10rem] max-w-[14rem] sm:w-auto"
              />
            </>
          )}

          <Button
            asChild
            variant="secondary"
            size="sm"
            className={cn(
              (pathname === '/' || pathname.startsWith('/article')) &&
                'ring-1 ring-naija-gold/60',
            )}
          >
            <Link href="/" aria-label="Show news feed">
              <Newspaper className="h-4 w-4" aria-hidden />
              News
            </Link>
          </Button>

          <Button
            asChild
            variant="secondary"
            size="sm"
            className={cn(pathname === '/saved' && 'ring-1 ring-naija-gold/60')}
          >
            <Link
              href="/saved"
              aria-label={
                savedCount > 0
                  ? `Show saved articles, ${savedCount} saved`
                  : 'Show saved articles'
              }
            >
              <Bookmark className="h-4 w-4" aria-hidden />
              Saved
              {savedCount > 0 && (
                <span
                  className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-naija-gold px-1.5 text-xs font-bold text-neutral-900"
                  aria-hidden
                >
                  {savedCount}
                </span>
              )}
            </Link>
          </Button>

          <Button
            type="button"
            variant="gold"
            size="sm"
            onClick={() => void toggleTheme()}
            aria-label={
              theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
            }
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" aria-hidden />
            ) : (
              <Sun className="h-4 w-4" aria-hidden />
            )}
            {theme === 'light' ? 'Dark' : 'Light'}
          </Button>
        </nav>
      </div>
    </header>
  );
}
