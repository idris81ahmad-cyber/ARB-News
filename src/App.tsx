import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './features/news/components/Header';
import NewsFeed from './features/news/components/NewsFeed';
import ArticleDetail from './features/news/components/ArticleDetail';
import SavedArticles from './features/news/components/SavedArticles';
import { persistence } from './utils/persistence';

interface Article {
  id: number;
  title: string;
  category: string;
  content: string;
  imageUrl: string;
  date: string;
  source: string;
}

function App() {
  const [currentView, setCurrentView] = useState<'news' | 'detail' | 'saved'>('news');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Sample Nigerian news data - creative and diverse
  const [articles] = useState<Article[]>([
    {
      id: 1,
      title: "Nigerian President Inaugurates New Lagos-Ibadan Rail Line, Boosting Economic Ties",
      category: "Politics",
      content: "In a historic move, the President of Nigeria officially inaugurated the Lagos-Ibadan standard gauge railway, marking a significant leap in infrastructure development. The project, funded through public-private partnerships, promises to reduce travel time from 7 hours to 2.5 hours, fostering regional economic growth and cultural exchange across the Yoruba heartland.",
      imageUrl: "https://images.unsplash.com/photo-1526243741027-444d633d7365?w=500&h=300&fit=crop",
      date: "2023-10-15",
      source: "ARB News Desk"
    },
    {
      id: 2,
      title: "AFCON Victory: Super Eagles Clinch Trophy with 3-1 Win Over Egypt",
      category: "Sports",
      content: "Nigeria's Super Eagles have triumphed in the Africa Cup of Nations, defeating Egypt in a nail-biting final. Captain Adebayor Nkiru's hat-trick sealed the victory, sending fans across the nation into euphoria. This marks the fourth AFCON win for Nigeria, cementing its status as Africa's premiere football power.",
      imageUrl: "https://images.unsplash.com/photo-1552657244-5f6e1e4e9d9a?w=500&h=300&fit=crop",
      date: "2023-10-20",
      source: "ARB Sports"
    },
    {
      id: 3,
      title: "Burna Boy Wins Grammy for Best Global Music Performance, Paving Way for Afrobeats Globally",
      category: "Entertainment",
      content: "Damini Ogulu, known as Burna Boy, has brought home Nigeria's first Grammy, revolutionizing the global music scene with his Afrobeats hit 'Ye'. The award announcement at the Staples Center in LA was met with cheers from diaspora Nigerians, highlighting the genre's infectious rhythm that blends tradition with contemporary vibes.",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop",
      date: "2023-10-10",
      source: "ARB Entertainment"
    },
    {
      id: 4,
      title: "Tech Startup in Lagos Raises $50M in Series B Funding for AI Healthcare Solutions",
      category: "Business",
      content: "Lagos-based health tech startup, MediAfrika, has secured $50 million in Series B funding, aiming to combat malaria and other endemic diseases using AI-driven diagnostics. Founder Dr. Ada Eze leads the team in developing affordable point-of-care devices, potentially saving millions of lives annually.",
      imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=300&fit=crop",
      date: "2023-10-18",
      source: "ARB Business"
    },
    {
      id: 5,
      title: "Cultural Revival: Calabar Festival Draws Millions, Celebrating Efik Heritage",
      category: "Culture",
      content: "The annual Calabar Carnival has returned with a bang, featuring vibrant masquerades, dances, and parades that showcase Nigeria's rich cultural tapestry. Over 5 million attendees immersed themselves in traditions, from canoe races on the Calabar River to fusion performances blending Afrobeat with folk melodies, promoting unity and pride.",
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=300&fit=crop",
      date: "2023-10-25",
      source: "ARB Culture"
    },
    {
      id: 6,
      title: "Climate Action: Nigeria Plants 10 Million Trees in Anti-Desertification Drive",
      category: "Environment",
      content: "In a bold initiative to combat climate change, the Nigerian government launched a nationwide reforestation project, planting 10 million trees across the Sahel Savannah zone. Volunteers from communities in Kano and Katsina are leading the effort, using drone technology for mapping and monitoring, aiming for a greener future.",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=300&fit=crop",
      date: "2023-10-22",
      source: "ARB Environment"
    }
  ]);

  useEffect(() => {
    // Load saved articles and theme from persistence
    const loadData = async () => {
      try {
        const saved = await persistence.getItem('savedArticles');
        if (saved) {
          setSavedArticles(JSON.parse(saved));
        }
        const storedTheme = await persistence.getItem('theme');
        if (storedTheme) {
          setTheme(storedTheme as 'light' | 'dark');
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const filteredArticles = selectedCategory === 'All' ? articles : articles.filter(a => a.category === selectedCategory);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setCurrentView('detail');
  };

  const handleSaveArticle = async (article: Article) => {
    const isSaved = savedArticles.some(a => a.id === article.id);
    const newSaved = isSaved ? savedArticles.filter(a => a.id !== article.id) : [...savedArticles, article];
    setSavedArticles(newSaved);
    await persistence.setItem('savedArticles', JSON.stringify(newSaved));
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await persistence.setItem('theme', newTheme);
  };

  return (
    <div className={`app ${theme}`}>
      <Header
        onCategoryChange={setSelectedCategory}
        selectedCategory={selectedCategory}
        onViewChange={setCurrentView}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="main-content">
        {currentView === 'news' && (
          <NewsFeed
            articles={filteredArticles}
            onArticleClick={handleArticleClick}
            onSaveArticle={handleSaveArticle}
            savedArticles={savedArticles}
          />
        )}
        {currentView === 'detail' && selectedArticle && (
          <ArticleDetail
            article={selectedArticle}
            onBack={() => setCurrentView('news')}
            onSaveArticle={handleSaveArticle}
            isSaved={savedArticles.some(a => a.id === selectedArticle.id)}
          />
        )}
        {currentView === 'saved' && (
          <SavedArticles
            articles={savedArticles}
            onArticleClick={handleArticleClick}
            onSaveArticle={handleSaveArticle}
          />
        )}
      </main>
      <footer className="footer">
        <p>&copy; 2026 ARB News - Bringing Nigeria to the World</p>
        <p>Inspired by the vibrant spirit of Naija, from Lagos to Abuja.</p>
      </footer>
    </div>
  );
}

export default App;
