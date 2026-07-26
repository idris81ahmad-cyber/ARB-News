import React from 'react';
import ArticleCard from './ArticleCard';
import './NewsFeed.css';

interface Article {
  id: number;
  title: string;
  category: string;
  content: string;
  imageUrl: string;
  date: string;
  source: string;
}

interface NewsFeedProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
  onSaveArticle: (article: Article) => void;
  savedArticles: Article[];
}

const NewsFeed: React.FC<NewsFeedProps> = ({ articles, onArticleClick, onSaveArticle, savedArticles }) => {
  return (
    <div className="news-feed">
      <h2 className="feed-title">📰 Latest Nigerian Headlines</h2>
      <div className="articles-grid">
        {articles.map(article => (
          <ArticleCard
            key={article.id}
            article={article}
            onClick={onArticleClick}
            onSave={onSaveArticle}
            isSaved={savedArticles.some(a => a.id === article.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
