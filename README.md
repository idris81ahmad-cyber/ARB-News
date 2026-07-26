# ARB News 🇳🇬

**The Pulse of Nigeria** — A modern, responsive React news feed application focused on Nigerian headlines across Politics, Sports, Entertainment, Business, Culture, and Environment.

## Features

- 📰 Category-filtered news feed with beautiful cards
- 🔍 Article detail view
- 💾 Save/unsave articles (persisted via `window.persistentStorage`)
- 🌙 Light / Dark theme toggle (persisted)
- 🇳🇬 Nigerian green & gold color theme
- Smooth fade-in animations

## Tech Stack

- React 18 + TypeScript
- CSS with CSS variables for theming
- Custom persistence layer (with localStorage fallback for standard browsers)
- Vite for development and build

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
│   ├── types/global.d.ts
│   ├── utils/persistence.ts
│   └── features/news/components/
│       ├── Header.*
│       ├── NewsFeed.*
│       ├── ArticleCard.*
│       ├── ArticleDetail.*
│       └── SavedArticles.*
└── .github/workflows/deno.yml
```

## Fixes Applied

- Typo in `persistence.ts` (`pistentStorage` → `persistentStorage`)
- Conflicting CSS class `.detail-content` used for both container and body text
- Missing TypeScript declaration for custom storage API
- Outdated copyright year
- Added localStorage fallback + Vite scaffolding for easy local development

## Running Locally

```bash
npm install
npm run dev
```

Then open the URL shown by Vite (usually http://localhost:5173).

## Notes

Sample articles are illustrative (2023 dates). Images from Unsplash.

Built with ❤️ for Naija.
