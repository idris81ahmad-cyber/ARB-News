import React from 'react';
import ArticleCard from './ArticleCard';
import './SavedArticles.css';

interface Article {
  id: number;
  title: string;
  category: string;
  content: string;
  imageUrl: string;
  date: string;
  source: string;
}

interface SavedArticlesProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
  onSaveArticle: (article: Article) => void;
}

const SavedArticles: React.FC<SavedArticlesProps> = ({ articles, onArticleClick, onSaveArticle }) => {
  return (
    <div className="saved-articles">
      <h2 className="saved-title">💼 Your Saved Nigerian Stories</h2>
      {articles.length > 0 ? (
        <div className="articles-grid">
          {articles.map(article => (
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
        <p className="no-saved">No saved articles yet. Explore the news feed to save fascinating stories! 🚀</p>
      )}
    </div>
  );
};

export default SavedArticles;
