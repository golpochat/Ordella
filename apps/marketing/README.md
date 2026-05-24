# Ordella Marketing Site

Next.js 14 marketing site for [ordella.com](https://ordella.com) (local: port **3006**).

## Develop

```bash
# From repo root
cp apps/marketing/.env.example apps/marketing/.env.local
npm install
npm run dev --workspace=@ordella/marketing
```

Open http://localhost:3006

## Signup / CTAs

All “Start free trial” buttons link to the admin app (`NEXT_PUBLIC_APP_URL` + `NEXT_PUBLIC_SIGNUP_PATH`, default `http://localhost:3001/login`) with:

- `plan` — `free`, `starter`, `pro` (from pricing cards when applicable)
- `utm_source=marketing`, `utm_medium=web`, `utm_campaign` — `landing`, `pricing`, `blog`, `features`, or `docs`
- `utm_content` — CTA placement (e.g. `hero`, `pricing_starter`)

On-site `/signup` redirects to the same URL and forwards query params. The admin login page stores attribution in `sessionStorage` (`ordella_marketing_attribution`) for downstream onboarding.

## Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_MARKETING_URL` | Canonical site URL (sitemap, OG) |
| `NEXT_PUBLIC_APP_URL` | Signup redirect target (admin UI) |
| `NEXT_PUBLIC_SIGNUP_PATH` | Path on app host (default `/login`) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible analytics |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Google Analytics 4 |

## Content

- **Docs (MDX):** `content/docs/{slug}.mdx` — routes at `/docs/[slug]` (`/docs` redirects to Getting Started)
- **Blog (MDX):** `content/blog/{filename}.mdx` — routes at `/blog/[slug]`

Docs frontmatter: `title`, `description`, `category`, `order`.

Blog frontmatter: `title`, `description`, `slug`, `date`, `tags`, `featured` (optional).

Docs are compiled with `next-mdx-remote` (RSC). Custom MDX components live in `components/mdx/`.

## Product screenshots

PNG assets live in `public/screenshots/`. They are generated from Bella Kitchen demo UIs in `scripts/screenshot-studio/` (consistent 1200×750 desktop and 390×780 device frames).

```bash
npm install
npx playwright install chromium
npm run capture:screenshots --workspace=@ordella/marketing
```

Registry: `lib/screenshots.ts`. Components use `next/image` with lazy loading (hero uses `priority`).

## Build

```bash
npm run build --workspace=@ordella/marketing
```

See [MARKETING_SITE_PLAN.md](../../MARKETING_SITE_PLAN.md) for product copy and screenshot inventory.
