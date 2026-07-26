import { useEffect, useRef } from 'react';
import type { Article } from '../../../types/article';
import ArticleCard from './ArticleCard';
import './SavedArticles.css';

interface SavedArticlesProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
  onSaveArticle: (article: Article) => void;
  onClearAll: () => void;
}

const SavedArticles = ({
  articles,
  onArticleClick,
  onSaveArticle,
  onClearAll,
}: SavedArticlesProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="saved-articles">
      <div className="saved-header">
        <h2 className="saved-title" ref={headingRef} tabIndex={-1} id="main-heading">
          💼 Your Saved Nigerian Stories
        </h2>
        {articles.length > 0 && (
          <button
            type="button"
            className="clear-all-btn"
            onClick={onClearAll}
            aria-label={`Clear all ${articles.length} saved articles`}
          >
            Clear all
          </button>
        )}
      </div>
      {articles.length > 0 ? (
        <div className="articles-grid">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={onArticleClick}
              onSave={onSaveArticle}
              isSaved={true}
            />
          ))}
        </div>
      ) : (
        <p className="no-saved" role="status">
          No saved articles yet. Explore the news feed to save fascinating stories!
        </p>
      )}
    </div>
  );
};

export default SavedArticles;
