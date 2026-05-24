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

## Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_MARKETING_URL` | Canonical site URL (sitemap, OG) |
| `NEXT_PUBLIC_APP_URL` | Signup redirect target (admin UI) |
| `NEXT_PUBLIC_SIGNUP_PATH` | Path on app host (default `/login`) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible analytics |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Google Analytics 4 |

## Content

- Docs: `content/docs/{category}/{slug}.md`
- Blog: `content/blog/{slug}.md`

Frontmatter: `title`, `description`, and for blog `date`, `tags`.

## Build

```bash
npm run build --workspace=@ordella/marketing
```

See [MARKETING_SITE_PLAN.md](../../MARKETING_SITE_PLAN.md) for product copy and screenshot inventory.
