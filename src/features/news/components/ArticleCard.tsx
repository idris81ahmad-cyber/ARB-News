import { ArticleImage } from '../../../components/ArticleImage';
import type { Article } from '../../../types/article';
import { CATEGORY_ICONS } from '../../../types/article';
import { estimateReadingTime } from '../../../utils/readingTime';
import './ArticleCard.css';

interface ArticleCardProps {
  article: Article;
  onClick: (article: Article) => void;
  onSave: (article: Article) => void;
  isSaved: boolean;
}

const ArticleCard = ({ article, onClick, onSave, isSaved }: ArticleCardProps) => {
  const minutes = estimateReadingTime(article.content);
  const icon = CATEGORY_ICONS[article.category];

  return (
    <article
      className="article-card fade-in"
      onClick={() => onClick(article)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(article);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open article: ${article.title}`}
    >
      <ArticleImage src={article.imageUrl} alt="" className="article-image" />
      <div className="article-content">
        <span className="category-badge">
          <span aria-hidden="true">{icon} </span>
          {article.category}
        </span>
        <h3 className="article-title">{article.title}</h3>
        <p className="article-snippet">{article.content.slice(0, 150)}…</p>
        <div className="article-info">
          <span>
            {article.source} · {new Date(article.date).toLocaleDateString()} · {minutes} min read
          </span>
          <button
            type="button"
            className={`save-btn ${isSaved ? 'saved' : ''}`}
            aria-pressed={isSaved}
            aria-label={isSaved ? `Remove ${article.title} from saved` : `Save ${article.title}`}
            onClick={(e) => {
              e.stopPropagation();
              onSave(article);
            }}
          >
            {isSaved ? '💚 Saved' : '💖 Save'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
