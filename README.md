# ARB News 🇳🇬

**The Pulse of Nigeria** — A modern, accessible React news feed focused on Nigerian headlines across Politics, Sports, Entertainment, Business, Culture, and Environment.

## Features

- 📰 Category filter + free-text search
- 🔍 Article detail view with related stories
- 💾 Save / unsave articles (localStorage or host `persistentStorage`)
- 🧹 Clear all saved articles
- 🌙 Light / dark theme (respects `prefers-color-scheme` on first load)
- ♿ Accessibility: skip link, ARIA labels, live regions, focus management, Esc to go back
- 🖼️ Image lazy-load + SVG fallback when remote images fail
- ⏳ Skeleton loaders while articles load
- 🛡️ React error boundary around main views
- ↗ Share (Web Share API + clipboard fallback)
- 🇳🇬 Green & gold visual identity

## Tech Stack

- React 18 + TypeScript
- Vite
- Plain CSS (themed with CSS variables)
- Custom persistence layer with localStorage fallback

## Project Structure

```
ARB-News/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── App.tsx / App.css
│   ├── index.tsx
│   ├── components/          # ErrorBoundary, ArticleImage, Skeleton
│   ├── data/sampleArticles.ts
│   ├── hooks/               # useArticles, useSavedArticles, useTheme
│   ├── types/               # Article + global Window types
│   ├── utils/               # persistence, readingTime
│   └── features/news/components/
└── .github/workflows/ci.yml
```

## Running Locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

```bash
npm run build   # typecheck + production build
npm run preview # preview production build
```

## Data Layer

Articles come from `src/data/sampleArticles.ts` via `useArticles`. That hook owns loading state, category + search filtering, and related-article selection — swap the loader body later for a real API without touching presentational components.

## Notes

Sample articles are illustrative. Images from Unsplash (with offline/error fallback art).

Built with ❤️ for Naija.
