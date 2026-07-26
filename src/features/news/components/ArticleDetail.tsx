import React from 'react';
import './ArticleDetail.css';

interface Article {
  id: number;
  title: string;
  category: string;
  content: string;
  imageUrl: string;
  date: string;
  source: string;
}

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
  onSaveArticle: (article: Article) => void;
  isSaved: boolean;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onBack, onSaveArticle, isSaved }) => {
  return (
    <div className="article-detail fade-in">
      <button className="back-btn" onClick={onBack}>⬅️ Back to Feed</button>
      <div className="detail-content">
        <img src={article.imageUrl} alt={article.title} className="detail-image" />
        <span className="detail-category">{article.category}</span>
        <h1 className="detail-title">{article.title}</h1>
        <p className="detail-meta">{article.source} • {new Date(article.date).toLocaleDateString()}</p>
        <p className="detail-body">{article.content}</p>
        <button
          className={`save-detail-btn ${isSaved ? 'saved' : ''}`}
          onClick={() => onSaveArticle(article)}
        >
          {isSaved ? '💚 Remove from Saved' : '💖 Save Article'}
        </button>
      </div>
    </div>
  );
};

export default ArticleDetail;
