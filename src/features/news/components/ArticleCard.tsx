import React from 'react';
import './ArticleCard.css';

interface Article {
  id: number;
  title: string;
  category: string;
  content: string;
  imageUrl: string;
  date: string;
  source: string;
}

interface ArticleCardProps {
  article: Article;
  onClick: (article: Article) => void;
  onSave: (article: Article) => void;
  isSaved: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick, onSave, isSaved }) => {
  return (
    <div className="article-card fade-in" onClick={() => onClick(article)}>
      <img src={article.imageUrl} alt={article.title} className="article-image" />
      <div className="article-content">
        <span className="category-badge">{article.category}</span>
        <h3 className="article-title">{article.title}</h3>
        <p className="article-snippet">{article.content.slice(0, 150)}...</p>
        <div className="article-info">
          <span>{article.source} • {new Date(article.date).toLocaleDateString()}</span>
          <button className={`save-btn ${isSaved ? 'saved' : ''}`} onClick={(e) => { e.stopPropagation(); onSave(article); }}>
            {isSaved ? '💚 Saved' : '💖 Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
