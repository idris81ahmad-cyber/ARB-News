import React from 'react';
import './Header.css';

interface HeaderProps {
  onCategoryChange: (category: string) => void;
  selectedCategory: string;
  onViewChange: (view: 'news' | 'detail' | 'saved') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCategoryChange, selectedCategory, onViewChange, theme, onToggleTheme }) => {
  const categories = ['All', 'Politics', 'Sports', 'Entertainment', 'Business', 'Culture', 'Environment'];

  return (
    <header className="header">
      <div className="header-logo">
        <h1>🇳🇬 ARB News</h1>
        <p>The Pulse of Nigeria</p>
      </div>
      <nav className="nav">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="category-select"
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <button onClick={() => onViewChange('news')} className="nav-btn">News Feed</button>
        <button onClick={() => onViewChange('saved')} className="nav-btn">Saved</button>
        <button onClick={onToggleTheme} className="theme-toggle">
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </nav>
    </header>
  );
};

export default Header;
