import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import Header from './features/news/components/Header';
import NewsFeed from './features/news/components/NewsFeed';
import ArticleDetail from './features/news/components/ArticleDetail';
import SavedArticles from './features/news/components/SavedArticles';
import { useArticles } from './hooks/useArticles';
import { useSavedArticles } from './hooks/useSavedArticles';
import { useTheme } from './hooks/useTheme';
import type { AppView, Article } from './types/article';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('news');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);

  const {
    filteredArticles,
    status,
    error: articlesError,
    category,
    searchQuery,
    setCategory,
    setSearchQuery,
    reload,
    getRelated,
  } = useArticles();

  const {
    savedArticles,
    storageError: savedStorageError,
    toggleSave,
    clearAll,
    isSaved,
  } = useSavedArticles();

  const { theme, toggleTheme, storageError: themeStorageError } = useTheme();

  const storageBanner = savedStorageError || themeStorageError;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const announce = useCallback((message: string) => {
    if (liveRef.current) {
      liveRef.current.textContent = message;
    }
  }, []);

  const handleViewChange = useCallback(
    (view: AppView) => {
      setCurrentView(view);
      if (view !== 'detail') {
        setSelectedArticle(null);
      }
      if (view === 'news') announce('News feed');
      if (view === 'saved') announce('Saved articles');
      requestAnimationFrame(() => {
        document.getElementById('main-heading')?.focus();
      });
    },
    [announce],
  );

  const handleArticleClick = useCallback(
    (article: Article) => {
      setSelectedArticle(article);
      setCurrentView('detail');
      announce(`Opened article: ${article.title}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [announce],
  );

  const handleBack = useCallback(() => {
    setCurrentView('news');
    setSelectedArticle(null);
    announce('Back to news feed');
    requestAnimationFrame(() => {
      document.getElementById('main-heading')?.focus();
    });
  }, [announce]);

  const handleSaveArticle = useCallback(
    async (article: Article) => {
      const wasSaved = isSaved(article.id);
      await toggleSave(article);
      announce(wasSaved ? `Removed ${article.title} from saved` : `Saved ${article.title}`);
    },
    [announce, isSaved, toggleSave],
  );

  const handleClearAll = useCallback(async () => {
    await clearAll();
    announce('Cleared all saved articles');
  }, [announce, clearAll]);

  // Esc returns from detail view
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentView === 'detail') {
        e.preventDefault();
        handleBack();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentView, handleBack]);

  return (
    <div className={`app ${theme}`}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div ref={liveRef} className="sr-only" role="status" aria-live="polite" aria-atomic="true" />

      <Header
        onCategoryChange={setCategory}
        selectedCategory={category}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentView={currentView}
        onViewChange={handleViewChange}
        theme={theme}
        onToggleTheme={() => void toggleTheme()}
        savedCount={savedArticles.length}
        scrolled={scrolled}
      />

      {storageBanner && (
        <div className="storage-banner" role="status">
          {storageBanner}
        </div>
      )}

      <main id="main-content" className="main-content" tabIndex={-1}>
        <ErrorBoundary onReset={() => handleViewChange('news')}>
          {currentView === 'news' && (
            <NewsFeed
              articles={filteredArticles}
              onArticleClick={handleArticleClick}
              onSaveArticle={(a) => void handleSaveArticle(a)}
              savedArticles={savedArticles}
              loading={status === 'loading'}
              error={articlesError}
              onRetry={reload}
              searchQuery={searchQuery}
            />
          )}
          {currentView === 'detail' && selectedArticle && (
            <ArticleDetail
              article={selectedArticle}
              related={getRelated(selectedArticle)}
              onBack={handleBack}
              onSaveArticle={(a) => void handleSaveArticle(a)}
              onRelatedClick={handleArticleClick}
              isSaved={isSaved(selectedArticle.id)}
            />
          )}
          {currentView === 'saved' && (
            <SavedArticles
              articles={savedArticles}
              onArticleClick={handleArticleClick}
              onSaveArticle={(a) => void handleSaveArticle(a)}
              onClearAll={() => void handleClearAll()}
            />
          )}
        </ErrorBoundary>
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} ARB News — Bringing Nigeria to the World</p>
        <p>Inspired by the vibrant spirit of Naija, from Lagos to Abuja.</p>
      </footer>
    </div>
  );
}

export default App;
