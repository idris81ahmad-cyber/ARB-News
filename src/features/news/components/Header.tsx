import type { AppView, CategoryFilter, ThemeMode } from '../../../types/article';
import { CATEGORIES } from '../../../types/article';
import './Header.css';

interface HeaderProps {
  onCategoryChange: (category: CategoryFilter) => void;
  selectedCategory: CategoryFilter;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  savedCount: number;
  scrolled: boolean;
}

const Header = ({
  onCategoryChange,
  selectedCategory,
  searchQuery,
  onSearchChange,
  currentView,
  onViewChange,
  theme,
  onToggleTheme,
  savedCount,
  scrolled,
}: HeaderProps) => {
  return (
    <header className={`header${scrolled ? ' header--scrolled' : ''}`}>
      <div className="header-logo">
        <h1>
          <span aria-hidden="true">🇳🇬 </span>ARB News
        </h1>
        <p>The Pulse of Nigeria</p>
      </div>
      <nav className="nav" aria-label="Primary">
        <label className="sr-only" htmlFor="category-filter">
          Filter by category
        </label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value as CategoryFilter)}
          className="category-select"
          aria-label="Filter articles by category"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="search-input">
          Search articles
        </label>
        <input
          id="search-input"
          type="search"
          className="search-input"
          placeholder="Search headlines…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search articles by title, source, or content"
        />

        <button
          type="button"
          onClick={() => onViewChange('news')}
          className={`nav-btn${currentView === 'news' || currentView === 'detail' ? ' nav-btn--active' : ''}`}
          aria-current={currentView === 'news' || currentView === 'detail' ? 'page' : undefined}
          aria-label="Show news feed"
        >
          News Feed
        </button>
        <button
          type="button"
          onClick={() => onViewChange('saved')}
          className={`nav-btn${currentView === 'saved' ? ' nav-btn--active' : ''}`}
          aria-current={currentView === 'saved' ? 'page' : undefined}
          aria-label={
            savedCount > 0
              ? `Show saved articles, ${savedCount} saved`
              : 'Show saved articles'
          }
        >
          Saved
          {savedCount > 0 && (
            <span className="saved-badge" aria-hidden="true">
              {savedCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onToggleTheme}
          className="theme-toggle"
          aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </nav>
    </header>
  );
};

export default Header;
