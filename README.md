# ARB News 🇳🇬

**The Pulse of Nigeria** — A modern Nigerian news feed built with **Next.js 15 (App Router)**, **Tailwind CSS v4**, and **shadcn-style** UI components.

## Features

- 📰 Category filter + free-text search
- 🔍 Article detail routes with SEO metadata
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
| Data | `src/data/sample-articles.ts` + `/api/articles` + `useArticles` hook |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
npm run lint
```

## Project structure

```
src/
├── app/                 # App Router pages + API
│   ├── api/articles/
│   ├── article/[id]/
│   ├── saved/
│   └── page.tsx
├── components/          # UI + feature components
│   └── ui/              # shadcn-style primitives
├── data/
├── hooks/
├── lib/                 # articles, persistence, utils
└── types/
```

## Data layer

- Server: `lib/articles.ts` (`getArticles`, `getArticleById`, `filterArticles`)
- Client: `hooks/use-articles.ts` fetches `/api/articles`
- Swap the API route body for a real CMS/news API without changing UI components

## Deploy

Ready for **Vercel**: connect the GitHub repo and deploy. Image host `images.unsplash.com` is allow-listed in `next.config.ts`.

Built with ❤️ for Naija.
