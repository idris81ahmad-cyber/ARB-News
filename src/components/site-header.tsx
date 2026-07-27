'use client';

import { Bookmark, Moon, Newspaper, Search, Sun, X } from 'lucide-react';
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const savedCount = savedArticles.length;
  const hasActiveFilters =
    showFilters && (category !== 'All' || searchQuery.trim().length > 0);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-white/10 bg-naija-green text-white transition-shadow',
        scrolled && 'shadow-lg shadow-black/25',
      )}
    >
      <div className="mx-auto max-w-6xl px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className="min-w-0 shrink rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-naija-gold"
          >
            <h1 className="truncate text-lg font-bold tracking-tight sm:text-2xl">
              <span aria-hidden="true">🇳🇬 </span>ARB News
            </h1>
            <p className="hidden text-xs text-naija-gold sm:block sm:text-sm">
              The Pulse of Nigeria
            </p>
          </Link>

          <nav
            className="flex shrink-0 items-center gap-1.5 sm:gap-2"
            aria-label="Primary"
          >
            {showFilters && onSearchChange && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-9 w-9 sm:hidden"
                aria-expanded={mobileSearchOpen}
                aria-label={mobileSearchOpen ? 'Hide search' : 'Show search'}
                onClick={() => setMobileSearchOpen((v) => !v)}
              >
                {mobileSearchOpen ? (
                  <X className="h-4 w-4" aria-hidden />
                ) : (
                  <Search className="h-4 w-4" aria-hidden />
                )}
              </Button>
            )}

            <Button
              asChild
              variant="secondary"
              size="sm"
              className={cn(
                'h-9 px-2.5 sm:px-3',
                (pathname === '/' || pathname.startsWith('/article')) &&
                  'ring-1 ring-naija-gold/60',
              )}
            >
              <Link href="/" aria-label="Show news feed">
                <Newspaper className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">News</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="secondary"
              size="sm"
              className={cn(
                'h-9 px-2.5 sm:px-3',
                pathname === '/saved' && 'ring-1 ring-naija-gold/60',
              )}
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
                <span className="hidden sm:inline">Saved</span>
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
              className="h-9 px-2.5 sm:px-3"
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
              <span className="hidden sm:inline">
                {theme === 'light' ? 'Dark' : 'Light'}
              </span>
            </Button>
          </nav>
        </div>

        {showFilters && onCategoryChange && onSearchChange && (
          <div
            className={cn(
              'mt-2 grid gap-2 sm:mt-3 sm:grid-cols-[10rem_1fr_auto] sm:items-center',
              !mobileSearchOpen && 'hidden sm:grid',
            )}
          >
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
              className="h-9 w-full"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>

            <div className="relative">
              <label className="sr-only" htmlFor="search-input">
                Search articles
              </label>
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
                aria-hidden
              />
              <Input
                id="search-input"
                type="search"
                placeholder="Search Nigerian headlines…"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label="Search articles by title, source, or content"
                className="h-9 w-full pl-8"
              />
            </div>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-9"
                onClick={() => {
                  onCategoryChange('All');
                  onSearchChange('');
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
