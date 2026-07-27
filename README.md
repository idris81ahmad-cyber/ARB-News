# ARB News 🇳🇬

**The Pulse of Nigeria** — Production-minded Next.js news app with live providers, resilience, SEO, and accessible UX.

## Features

- 📡 Live news via **GNews** / **NewsAPI** with Naija-first ranking
- ♻️ Retries + stale cache + sample fallback
- 📰 Category filter + search + clear filters
- 🔍 Article detail routes + **Read original story**
- 💾 Save / unsave + clear-all
- 🌙 Theme + `prefers-color-scheme`
- ♿ Skip link, ARIA, Esc back, focus management
- 🖼️ Image fallbacks, skeletons, empty states
- ↗ Share, reading time, Framer Motion
- 🗺️ `sitemap.xml`, `robots.txt`, Open Graph image
- 🧪 Vitest unit tests
- 📋 [Deploy checklist](./DEPLOY.md)

## Stack

Next.js 15 App Router · React 19 · Tailwind CSS v4 · Framer Motion · Vitest

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

```bash
npm test
npm run build
```

## Live news

| Variable | Provider |
|----------|----------|
| `GNEWS_API_KEY` | [GNews.io](https://gnews.io/) |
| `NEWS_API_KEY` | [NewsAPI.org](https://newsapi.org/) |
| `NEWS_PROVIDER` | `auto` \| `gnews` \| `newsapi` |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for SEO |

Without keys, sample articles are served so local/CI builds always work.

## Architecture

```
src/
├── app/                 # routes, API, sitemap, robots, OG image
├── components/          # UI + feature components
├── data/                # sample fallback
├── hooks/
├── lib/
│   ├── news/            # providers, relevance, retry, stale cache, logs
│   └── …
└── types/
```

Pipeline: **live (retry) → stale cache → sample**.

## Production

See **[DEPLOY.md](./DEPLOY.md)** for Vercel env vars, smoke tests, and security notes.

Built with ❤️ for Naija.
