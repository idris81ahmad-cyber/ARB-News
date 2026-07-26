export type NewsCategory =
  | 'Politics'
  | 'Sports'
  | 'Entertainment'
  | 'Business'
  | 'Culture'
  | 'Environment';

export type CategoryFilter = 'All' | NewsCategory;

export type AppView = 'news' | 'detail' | 'saved';

export type ThemeMode = 'light' | 'dark';

export interface Article {
  id: number;
  title: string;
  category: NewsCategory;
  content: string;
  imageUrl: string;
  date: string;
  source: string;
}

export const CATEGORIES: CategoryFilter[] = [
  'All',
  'Politics',
  'Sports',
  'Entertainment',
  'Business',
  'Culture',
  'Environment',
];

export const CATEGORY_ICONS: Record<NewsCategory, string> = {
  Politics: '🏛️',
  Sports: '⚽',
  Entertainment: '🎵',
  Business: '💼',
  Culture: '🎭',
  Environment: '🌳',
};
