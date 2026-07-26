# ARB News 🇳🇬

**The Pulse of Nigeria** — A modern Nigerian news feed built with **Next.js 15 (App Router)**, **Tailwind CSS v4**, and **shadcn-style** UI components.

## Features

- 📡 Live news via **NewsAPI.org** or **GNews** (sample fallback without keys)
- 📰 Category filter + free-text search
- 🔍 Article detail routes with SEO metadata + “Full story” publisher link
- 💾 Save / unsave (localStorage or host `persistentStorage`)
- 🧹 Clear all saved
- 🌙 Light / dark theme (`prefers-color-scheme` on first load)
- ♿ Skip link, ARIA labels, focus management, Esc to go back
- 🖼️ `next/image` + SVG fallback on error
- ⏳ Skeleton loaders + empty states
- ↗ Share (Web Share API + clipboard)
- ✨ Framer Motion page transitions
- 🇳🇬 Green & gold brand theme

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 App Router |
| UI | Tailwind CSS v4 + CVA components (Button, Card, Badge, Input, Select) |
| Motion | Framer Motion |
| Icons | lucide-react |
| Data | NewsAPI / GNews → `/api/articles` → `useArticles` (sample fallback) |

## Getting started

```bash
npm install
cp .env.example .env.local   # optional for live news
# Add NEWS_API_KEY=... from https://newsapi.org/register
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without API keys the app still runs using sample articles.

```bash
npm run build
npm start
npm run lint
```

## Live news / CMS API

| Variable | Description |
|----------|-------------|
| `NEWS_API_KEY` | [NewsAPI.org](https://newsapi.org/) key (recommended) |
| `GNEWS_API_KEY` | Optional [GNews.io](https://gnews.io/) key |
| `NEWS_PROVIDER` | `auto` (default), `newsapi`, or `gnews` |

**Flow**

1. `GET /api/articles` calls `loadNews()` → `fetchNewsArticles()`
2. Tries NewsAPI (`top-headlines?country=ng` + `everything?q=Nigeria`) then GNews
3. Maps results into the shared `Article` type (category inference, stable ids from URL)
4. On missing key or provider failure → sample data + warning banner
5. Responses cached ~5 minutes (`revalidate = 300`)

```
src/lib/news/
  index.ts      # provider orchestration + fallback
  newsapi.ts    # NewsAPI.org client
  gnews.ts      # GNews client
  category.ts   # keyword → Politics/Sports/…
  id.ts         # stable numeric ids from URLs
```

### Vercel

Add the same env vars in the project **Settings → Environment Variables**, then redeploy.

## Project structure

```
src/
├── app/                 # App Router pages + API
│   ├── api/articles/
│   ├── article/[id]/
│   ├── saved/
│   └── page.tsx
├── components/          # UI + feature components
│   └── ui/
├── data/                # sample fallback articles
├── hooks/
├── lib/                 # news providers, persistence, utils
└── types/
```

Built with ❤️ for Naija.
