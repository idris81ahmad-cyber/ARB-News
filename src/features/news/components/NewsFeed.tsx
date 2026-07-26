import { SkeletonGrid } from '../../../components/SkeletonCard';
import type { Article } from '../../../types/article';
import ArticleCard from './ArticleCard';
import './NewsFeed.css';

interface NewsFeedProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
  onSaveArticle: (article: Article) => void;
  savedArticles: Article[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  searchQuery?: string;
}

const NewsFeed = ({
  articles,
  onArticleClick,
  onSaveArticle,
  savedArticles,
  loading = false,
  error = null,
  onRetry,
  searchQuery = '',
}: NewsFeedProps) => {
  return (
    <div className="news-feed">
      <h2 className="feed-title" id="main-heading" tabIndex={-1}>
        📰 Latest Nigerian Headlines
      </h2>

      {loading && <SkeletonGrid count={6} />}

      {!loading && error && (
        <div className="feed-error" role="alert">
          <p>{error}</p>
          {onRetry && (
            <button type="button" className="retry-btn" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      )}

      {!loading && !error && articles.length === 0 && (
        <p className="feed-empty" role="status">
          {searchQuery.trim()
            ? `No articles match “${searchQuery.trim()}”. Try another search or category.`
            : 'No articles in this category yet.'}
        </p>
      )}

      {!loading && !error && articles.length > 0 && (
        <div className="articles-grid">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={onArticleClick}
              onSave={onSaveArticle}
              isSaved={savedArticles.some((a) => a.id === article.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
