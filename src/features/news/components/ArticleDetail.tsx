import { useEffect, useRef } from 'react';
import { ArticleImage } from '../../../components/ArticleImage';
import type { Article } from '../../../types/article';
import { CATEGORY_ICONS } from '../../../types/article';
import { estimateReadingTime } from '../../../utils/readingTime';
import './ArticleDetail.css';

interface ArticleDetailProps {
  article: Article;
  related: Article[];
  onBack: () => void;
  onSaveArticle: (article: Article) => void;
  onRelatedClick: (article: Article) => void;
  isSaved: boolean;
}

async function shareArticle(article: Article): Promise<void> {
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const payload = {
    title: article.title,
    text: `${article.title} — via ARB News`,
    url,
  };

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share(payload);
      return;
    } catch {
      /* user cancelled or share failed — fall through */
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(`${article.title}\n${url}`);
    return;
  }

  throw new Error('Sharing is not supported in this browser.');
}

const ArticleDetail = ({
  article,
  related,
  onBack,
  onSaveArticle,
  onRelatedClick,
  isSaved,
}: ArticleDetailProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const minutes = estimateReadingTime(article.content);
  const icon = CATEGORY_ICONS[article.category];

  useEffect(() => {
    headingRef.current?.focus();
  }, [article.id]);

  const handleShare = async () => {
    try {
      await shareArticle(article);
    } catch {
      // non-fatal
    }
  };

  return (
    <div className="article-detail fade-in">
      <button type="button" className="back-btn" onClick={onBack} aria-label="Back to news feed">
        ← Back to Feed
      </button>
      <div className="detail-content">
        <ArticleImage src={article.imageUrl} alt="" className="detail-image" />
        <span className="detail-category">
          <span aria-hidden="true">{icon} </span>
          {article.category}
        </span>
        <h1 className="detail-title" ref={headingRef} tabIndex={-1}>
          {article.title}
        </h1>
        <p className="detail-meta">
          {article.source} · {new Date(article.date).toLocaleDateString()} · {minutes} min read
        </p>
        <p className="detail-body">{article.content}</p>
        <div className="detail-actions">
          <button
            type="button"
            className={`save-detail-btn ${isSaved ? 'saved' : ''}`}
            aria-pressed={isSaved}
            aria-label={isSaved ? 'Remove article from saved' : 'Save article'}
            onClick={() => onSaveArticle(article)}
          >
            {isSaved ? '💚 Remove from Saved' : '💖 Save Article'}
          </button>
          <button
            type="button"
            className="share-btn"
            onClick={() => void handleShare()}
            aria-label="Share this article"
          >
            ↗ Share
          </button>
        </div>

        {related.length > 0 && (
          <section className="related-section" aria-labelledby="related-heading">
            <h2 id="related-heading" className="related-title">
              Related in {article.category}
            </h2>
            <ul className="related-list">
              {related.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="related-link"
                    onClick={() => onRelatedClick(item)}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default ArticleDetail;
