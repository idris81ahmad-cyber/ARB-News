# ARB News — Deploy checklist

## Prerequisites

- [ ] GitHub repo: `idris81ahmad-cyber/ARB-News`
- [ ] Vercel project linked (e.g. `arb-news-next`)
- [ ] Node 20+ locally for builds

## Environment variables (Vercel + local)

| Variable | Required | Notes |
|----------|----------|--------|
| `GNEWS_API_KEY` or `NEWS_API_KEY` | One of them for live news | Free tiers OK |
| `NEWS_PROVIDER` | Optional | `auto` / `gnews` / `newsapi` |
| `NEXT_PUBLIC_SITE_URL` | Recommended | e.g. `https://arb-news-next.vercel.app` |

Local:

```bash
cp .env.example .env.local
# fill keys — never commit .env.local
```

Vercel CLI:

```bash
echo "YOUR_KEY" | vercel env add GNEWS_API_KEY production
echo "gnews" | vercel env add NEWS_PROVIDER production
echo "https://arb-news-next.vercel.app" | vercel env add NEXT_PUBLIC_SITE_URL production
```

## Pre-deploy checks

```bash
npm ci
npm test
npm run lint
npm run build
```

## Deploy

```bash
# From repo root (linked to Vercel project)
vercel --prod
```

Or push to `main` if Git integration is connected.

## Post-deploy smoke test

1. Open production URL → homepage loads
2. `GET /api/articles` → `meta.source` is `gnews` or `newsapi` (not always sample)
3. `/sitemap.xml` and `/robots.txt` respond 200
4. Open an article → **Read original story** works
5. Save / theme / search still work

## Observability

- Server logs emit JSON lines with `service: "arb-news"`, `requestId`, `provider`
- Check Vercel → Project → Logs / Runtime Logs for `[news]` / `GET /api/articles`
- API responses include `meta.requestId` and `X-Request-Id` header

## Security reminders

- Rotate any key that was pasted into chat or committed by mistake
- Prefer Vercel encrypted env vars over hard-coded secrets
- Free GNews has delayed real-time data; paid plans remove delay

## Resilience behaviour

1. Live provider with retries (exponential backoff)
2. Warm in-memory **stale cache** (up to 6h) if providers fail
3. Sample articles as last resort + warning banner
