# Ordella — Marketing Site Plan

**Version:** 1.0  
**Last updated:** 2026-05-24  
**Product:** Multi-tenant restaurant SaaS (Admin, POS, Storefront, Driver, Customer, KDS, Onboarding, Branding, Stripe Billing)  
**Implementation target:** Next.js 14 app (recommended: `apps/marketing` or `apps/www` in monorepo)

**Primary conversion goal:** Visitor → **free trial signup** → onboarding wizard → first order → paid subscription (Starter / Pro).

**Canonical marketing domain:** `ordella.com` (example)  
**App entry:** `app.ordella.com` → `POST /api/v1/onboarding/signup` → Admin UI onboarding

---

## Table of contents

1. [Site map & information architecture](#1-site-map--information-architecture)
2. [Core pages (summary)](#2-core-pages-summary)
3. [Landing page (homepage)](#3-landing-page-homepage)
4. [Pricing page](#4-pricing-page)
5. [Features page](#5-features-page)
6. [Docs / Help Center](#6-docs--help-center)
7. [Blog / SEO hub](#7-blog--seo-hub)
8. [Conversion funnel & metrics](#8-conversion-funnel--metrics)
9. [Branding & visuals](#9-branding--visuals)
10. [Technical implementation notes](#10-technical-implementation-notes)
11. [Launch checklist](#11-launch-checklist)

---

## 1) Site map & information architecture

```
/                          Landing (homepage)
/pricing                   Plans + comparison + FAQ
/features                  Deep product capabilities
/features/[slug]           Optional feature detail (v2)
/docs                      Help Center home
/docs/[category]/[slug]    Doc articles
/blog                      Blog index
/blog/[slug]               Blog posts
/legal/privacy             Privacy policy
/legal/terms               Terms of service
/contact                   Sales / support (Enterprise)
/signup                    Redirect → app.ordella.com/signup (or embedded form)
/login                     Redirect → admin.ordella.com/login
```

**Global chrome (all marketing pages):**

- Logo → `/`
- Nav: Features · Pricing · Docs · Blog
- CTAs: **Start free trial** (primary) · **Log in** (secondary → Admin)
- Footer: Product links, Docs categories, Legal, Social, Status page link (v2)

---

## 2) Core pages (summary)

### Landing page (`/`)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Communicate value in 5 seconds; drive trial signups and pricing exploration |
| **Audience** | Restaurant owners, ops managers, multi-location brands, tech-forward independents |
| **Structure** | Hero → social proof → product overview → value pillars → how it works → screenshots carousel → pricing preview → FAQ teaser → final CTA |
| **Primary CTA** | **Start free trial** → `{APP_URL}/signup` or inline signup |
| **Secondary CTA** | **See pricing** → `/pricing` · **Book a demo** (Enterprise) → `/contact` |
| **App connection** | CTA passes UTM params; signup hits onboarding API; default plan = **Free** |

### Pricing page (`/pricing`)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Compare plans; remove price objection; push Starter trial upgrade |
| **Audience** | Evaluators comparing Toast/Square/custom stacks; finance-aware owners |
| **Structure** | Plan cards → comparison table → billing FAQ → enterprise CTA |
| **Primary CTA** | **Start free** (Free) / **Start 14-day trial** (Starter) |
| **Secondary CTA** | **Contact sales** (Enterprise) |
| **App connection** | Plan selection stored in `?plan=starter` → onboarding billing step pre-selects plan |

### Features page (`/features`)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Educate on modules; support SEO for “restaurant POS + online ordering platform” |
| **Audience** | Buyers doing feature research before signup |
| **Structure** | Hero → module sections (Admin, POS, Storefront, etc.) → integrations → CTA band |
| **Primary CTA** | **Start free trial** |
| **Secondary CTA** | **View pricing** |
| **App connection** | Deep links to relevant docs (`/docs/storefront/...`) |

### Docs / Help Center (`/docs`)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Reduce support load; improve activation; SEO for long-tail “how to” queries |
| **Audience** | New tenants, staff trainers, developers (API overview v2) |
| **Structure** | Sidebar categories · search · article MDX · “Was this helpful?” |
| **Primary CTA** | **Start free trial** (sticky sidebar / article footer) |
| **Secondary CTA** | **Contact support** |
| **App connection** | Links to live Admin/POS URLs; embeds short Loom/GIF where needed |

### Blog (`/blog`)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Organic traffic; thought leadership; retargeting audiences |
| **Audience** | Restaurant operators, franchise ops, delivery-focused brands |
| **Structure** | Index with tags · featured post · category filters · newsletter signup (v2) |
| **Primary CTA** | In-article CTA box → **Start free trial** |
| **Secondary CTA** | **Read related doc** |
| **App connection** | Bottom-of-post CTA; UTM `utm_campaign=blog_{slug}` |

---

## 3) Landing page (homepage)

### Hero copy (suggested)

**Headline:**  
**Run every order channel from one platform.**

**Subheadline:**  
Ordella unifies in-store POS, online ordering, kitchen displays, delivery, and customer apps—built for multi-location restaurants with your brand on every screen.

**Hero supporting bullets (optional):**

- Launch your branded storefront in minutes, not weeks  
- One menu, one inventory view, every channel  
- Subdomain or your own domain—fully themed per location  

**Hero CTAs:** Primary **Start free trial** · Secondary **Watch 2-min overview** (modal video)

**Hero visual:** Composite mockup—Admin dashboard (left) + Storefront on phone (center) + KDS tablet (right) on branded gradient using Ordella marketing theme (not tenant-specific).

### Core value pillars (5)

| # | Pillar | One-liner | Icon/visual |
|---|--------|-----------|-------------|
| 1 | **Unified POS** | Fast in-store checkout, receipts, and kitchen tickets | POS cart + receipt screenshot |
| 2 | **Online ordering** | Branded storefront, basket, checkout, live tracking | Storefront menu + order tracking on mobile |
| 3 | **Delivery & drivers** | Assign routes, driver app, proof of delivery | Driver app map + status chips |
| 4 | **Customer loyalty** | Order history, reorder, addresses in your app | Customer app home + orders list |
| 5 | **Multi-tenant control** | Admin, roles, billing, per-tenant branding & domains | Admin settings + branding panel |

### Section-by-section outline

#### 3.1 Hero

- Full-width layout; headline left, visual right (desktop), stacked (mobile)
- Trust microcopy under CTA: “Free plan · No credit card · 1 location included”
- **Screenshot:** Hero composite (see above)

#### 3.2 Social proof

- Logo strip: “Trusted by independent restaurants & growing brands” (placeholder logos until customers exist—use “Pilot partners” label)
- 2–3 short quotes (beta customers) OR stat bar: “10k+ orders processed” (when true)
- Optional: G2/Capterra badges (post-launch)

#### 3.3 Product overview (“One platform, every channel”)

- Diagram: Customer → Storefront/POS → API → KDS / Admin / Driver
- 30-second loop animation or static SVG
- **No screenshot**—use architecture graphic

#### 3.4 Feature grid (value pillars)

- 5 cards linking to `/features#pos`, `#storefront`, etc.
- Each card: icon, title, 2-line copy, “Learn more →”
- **Screenshots:** Thumbnail crop per pillar (see §9)

#### 3.5 How it works (3 steps)

| Step | Title | Copy | Visual |
|------|-------|------|--------|
| 1 | **Create your restaurant** | Sign up, add locations, import or build your menu | Onboarding wizard screenshot |
| 2 | **Go live on every channel** | Enable POS, publish storefront, optional delivery | Split POS + Storefront |
| 3 | **Grow with data & billing** | Reports, promotions, upgrade plan as you scale | Admin reports + Billing tab |

**CTA after step 3:** **Start free trial**

#### 3.6 Screenshots / product tour

- Tabbed or horizontal scroll: **Admin · POS · Storefront · KDS · Driver · Customer**
- Full-width browser frames; consistent demo tenant “Bella Kitchen” branding
- Caption per tab explaining outcome (“Kitchen sees orders in real time”)

#### 3.7 Pricing preview

- 4 plan cards (abbreviated); highlight **Starter** as “Most popular”
- Link: **Compare all plans →** `/pricing`
- **CTA:** **Start free trial**

#### 3.8 FAQ teaser (4 questions)

- Link to full FAQ on `/pricing#faq` or expand accordion
- Topics: free plan limits, custom domain, Stripe fees, data ownership

#### 3.9 Final CTA band

- Dark/contrast section; repeat headline shortened: **Ready to unify your restaurant?**
- **Start free trial** + **Talk to sales** (Enterprise)

---

## 4) Pricing page

### Plans (aligned with `BillingPlanRegistry`)

| Plan | Price (marketing—set in Stripe) | Target user | Locations | Orders / month | Key features |
|------|----------------------------------|-------------|-----------|----------------|--------------|
| **Free** | $0 | Single-location pilot, proof of concept | **1** | **100** | Admin, POS, Storefront, KDS, 1 branded theme, subdomain |
| **Starter** | e.g. $49–79 / mo | Independent / 2–3 locations | **3** | **1,000** | Everything in Free + staff invites, delivery module, custom domain, 14-day trial on paid features |
| **Pro** | e.g. $149–199 / mo | Busy multi-location, high online volume | **Unlimited** | **10,000** | Everything in Starter + priority support, advanced reports, promotions (when live), API access (v2) |
| **Enterprise** | Custom | Franchises, 10+ locations, SLA needs | **Custom** | **Custom** | SSO (v2), dedicated support, custom contracts, onboarding assistance |

*Display “orders/month” and “locations” exactly as enforced in app to avoid trust issues.*

### Plan card CTAs

| Plan | CTA |
|------|-----|
| Free | **Start free** → signup, `plan=free` |
| Starter | **Start 14-day trial** → signup, `plan=starter` |
| Pro | **Start 14-day trial** → signup, `plan=pro` |
| Enterprise | **Contact sales** → `/contact` form |

### Feature comparison table (structure)

Rows (grouped):

**Platform** — Multi-location · Custom domain · Subdomain · Role-based access · Tenant branding  
**Ordering** — POS · Online storefront · Order tracking · KDS · Customer app  
**Operations** — Inventory · Promotions · Reports · Delivery & driver app  
**Billing & support** — Stripe subscriptions · Invoices · Email support · Priority support · SLA  

Columns: Free | Starter | Pro | Enterprise  
Cells: ✓ / — / “Custom” / footnote tooltips

### Pricing FAQ topics

| Topic | Answer direction |
|-------|------------------|
| Is the Free plan really free? | Yes, with stated limits; upgrade anytime |
| What counts as an order? | Completed paid or submitted orders per billing period (link to docs) |
| Payment processing fees | Stripe Connect/card fees separate from Ordella subscription |
| Can I change plans? | Upgrade/downgrade via Admin → Billing; downgrade blocked if over limits |
| Trial terms | 14 days on Starter; card required when Stripe live |
| Cancellation | Cancel subscription; data export policy (link legal) |
| Support channels | Email/chat by plan; Enterprise SLA |
| Custom domain setup | DNS + `tenant_domains` verification (link docs) |
| Annual billing | v2: 2 months free positioning |

---

## 5) Features page

### Page structure

1. **Hero** — “Everything you need to run a modern restaurant” + CTA  
2. **Anchor nav** — POS · Storefront · KDS · Delivery · Customer · Admin · Branding · Billing  
3. **Module sections** (one per H2, alternating image left/right)  
4. **Integrations strip** — Stripe, future: Uber/DoorDash, accounting (placeholders labeled “Coming soon”)  
5. **Comparison callout** — “Why not patch together 5 tools?” bullet list  
6. **CTA band** — trial + pricing  

### Module section template (each)

- **Headline** + 3 benefit bullets  
- **Screenshot** (see §9)  
- **Link:** Read the guide → `/docs/{category}/...`  
- **Micro-CTA:** Start free trial  

### Suggested anchor content (one paragraph each)

| Module | Headline | Key bullets |
|--------|----------|-------------|
| Admin | **Command center for your brand** | Menu, inventory, orders, staff, reports |
| POS | **In-store sales without friction** | Quick cart, payments, receipts, KDS sync |
| Storefront | **Your menu, your domain, your brand** | Mobile-first ordering, checkout, tracking |
| KDS | **Kitchen clarity in real time** | Station views, item-level prep states |
| Delivery | **From kitchen to doorstep** | Driver assignments, status, proof of delivery |
| Customer app | **Guests who come back** | History, reorder, saved addresses |
| Branding | **Look like you, not like us** | Logo, colors, typography, presets |
| Billing | **Predictable SaaS pricing** | Plans, usage, Stripe invoices |

---

## 6) Docs / Help Center

**URL pattern:** `/docs` · `/docs/[category]` · `/docs/[category]/[slug]`  
**Format:** MDX in `apps/marketing/content/docs/` or dedicated `apps/docs`  
**Search:** Algolia DocSearch or Pagefind (static) at launch  

### Categories & initial articles

#### Getting Started

| Slug | Title |
|------|-------|
| `what-is-ordella` | What is Ordella? |
| `system-requirements` | Hardware & browser requirements |
| `architecture-overview` | How Admin, POS, and Storefront connect |
| `glossary` | Glossary (order, location, tenant, channel) |

#### Tenant Onboarding

| Slug | Title |
|------|-------|
| `create-account` | Create your account |
| `onboarding-wizard` | Complete the onboarding wizard |
| `add-first-location` | Add your first location |
| `build-your-menu` | Build your first menu |
| `go-live-checklist` | Go-live checklist |

#### Admin

| Slug | Title |
|------|-------|
| `admin-overview` | Admin dashboard overview |
| `manage-products` | Manage products & categories |
| `manage-orders` | View and manage orders |
| `inventory-basics` | Inventory adjustments |
| `staff-and-roles` | Invite staff & roles |
| `reports-overview` | Reports overview |

#### POS

| Slug | Title |
|------|-------|
| `pos-setup` | Set up POS for a location |
| `pos-checkout` | Take payments at the register |
| `pos-receipts` | Receipts & reprints |
| `pos-offline` | Offline mode (or “planned”) |

#### Storefront

| Slug | Title |
|------|-------|
| `storefront-overview` | Online ordering overview |
| `custom-domain` | Connect a custom domain |
| `checkout-and-payments` | Checkout & payments |
| `order-tracking` | Customer order tracking |

#### Delivery

| Slug | Title |
|------|-------|
| `enable-delivery` | Enable delivery |
| `driver-app-setup` | Set up the driver app |
| `assign-deliveries` | Assign and track deliveries |

#### Branding / Theming

| Slug | Title |
|------|-------|
| `branding-overview` | Brand your restaurant |
| `theme-presets` | Light, dark & custom presets |
| `logo-and-assets` | Upload logo & icons |

#### Billing

| Slug | Title |
|------|-------|
| `plans-and-limits` | Plans, locations & order limits |
| `upgrade-plan` | Upgrade or change plan |
| `invoices-and-payment-method` | Invoices & payment method |
| `stripe-faq` | Stripe & billing FAQ |

### Docs UX requirements

- Left sidebar: categories (collapsible on mobile)  
- Right TOC on long articles  
- Breadcrumbs: Docs → Category → Article  
- Footer on every article: **Start free trial** + **Was this helpful?**  
- “Edit on GitHub” (optional, if docs in repo)  
- Version badge: “Applies to Ordella v1.x”  

---

## 7) Blog / SEO hub

### Core content themes

| Theme | SEO intent | Example keywords |
|-------|------------|------------------|
| **Restaurant technology** | Platform buyers | restaurant management software, all-in-one POS |
| **POS & in-store ops** | POS switchers | modern restaurant POS, fast checkout |
| **Online ordering** | DTC restaurants | online ordering system, commission-free ordering |
| **Delivery operations** | Delivery-heavy brands | restaurant delivery software, driver app |
| **SaaS & multi-location ops** | Scaling brands | multi-location restaurant software |

### Initial blog posts (8–10 titles)

1. **How to Launch Commission-Free Online Ordering for Your Restaurant (2026 Guide)**  
2. **POS vs Online Ordering: Why Your Restaurant Needs Both on One Platform**  
3. **Kitchen Display Systems (KDS) Explained: Reduce Ticket Times Without Chaos**  
4. **Multi-Location Restaurant Software: What to Look for Before You Buy**  
5. **Restaurant Delivery in-House vs Third-Party Apps: Cost Breakdown**  
6. **How to Brand Your Online Menu So It Matches Your Dining Room**  
7. **Staff Roles & Permissions: A Practical RBAC Guide for Restaurants**  
8. **From Signup to First Order: Onboarding Checklist for New Ordella Tenants**  
9. **Stripe for Restaurants: Separating SaaS Billing from Customer Card Payments**  
10. **10 Reports Every Restaurant Manager Should Run Weekly**  

### Internal linking strategy

| From | Link to |
|------|---------|
| Every post intro | Relevant `/features#...` section |
| Mid-article CTA box | `/pricing` with plan mention |
| End of post | **Start free trial** → `/signup?utm_*` |
| How-to posts | 2–3 deep links to `/docs/...` |
| Comparison posts | `/pricing` comparison table |
| Pillar posts | 3+ related posts in “Related reading” |

**URL slug pattern:** `/blog/{year}/{slug}` or `/blog/{slug}` (pick one; use consistently in sitemap).

---

## 8) Conversion funnel & metrics

### Ideal funnel

```
Awareness (Blog, SEO, Ads, Referral)
    ↓
Landing / Features (value prop, screenshots)
    ↓
Pricing (plan selection, objection handling)
    ↓
Signup (app.ordella.com — POST /onboarding/signup)
    ↓
Onboarding wizard (menu, POS, delivery, payments steps)
    ↓
Activation: First order (POS or Storefront)
    ↓
Habit: 10+ orders in 14 days
    ↓
Monetization: Upgrade to Starter/Pro (Billing tab / plan limits hit)
```

### Metrics by stage

| Stage | Metric | Target (initial benchmarks) | Tool |
|-------|--------|-----------------------------|------|
| Landing visit | Unique visitors | Baseline week 1 | GA4 / Plausible |
| Landing → trial click | CTR on primary CTA | 3–8% | Analytics event `cta_trial_click` |
| Pricing page view | % of sessions | 25–40% of landings | Pageview |
| Pricing → signup | Conversion | 10–20% of pricing views | Event `signup_start` |
| Signup started → completed | Signup completion rate | > 70% | API log / product analytics |
| Onboarding step completion | % per step (menu, POS, …) | > 60% each | Backend onboarding events |
| Time to first order | Median hours from signup | < 48h | Product DB |
| First order → 10 orders | Activation rate | > 30% in 14d | Product DB |
| Free → paid upgrade | Upgrade rate | 5–15% in 30d | Stripe + `tenant_billing` |
| Blog → signup | Assisted conversions | Track UTM | UTM + analytics |

### Drop-off diagnostics

| Drop-off | Likely cause | Fix |
|----------|--------------|-----|
| High bounce on landing | Weak hero / slow LCP | A/B headline; optimize images |
| Pricing but no signup | Price unclear / limits confusing | Comparison table + FAQ |
| Signup abandon | Long form | Social login v2; fewer fields |
| Onboarding abandon | Empty menu / no sample data | Seed demo products |
| No first order | Staff not trained | Docs + onboarding email drip |
| No upgrade | Free limits sufficient | Usage emails near 80% limits |

### UTM convention

```
?utm_source={source}&utm_medium={medium}&utm_campaign={campaign}&utm_content={cta_location}
```

Examples: `homepage_hero`, `pricing_starter_card`, `blog_kds_explained`.

---

## 9) Branding & visuals

### Marketing site design system (Ordella brand—not tenant)

Define once in `apps/marketing/styles/` (or Tailwind preset):

| Token | Usage |
|-------|--------|
| Primary | CTAs, links (align with default tenant theme primary or dedicated brand color) |
| Secondary | Accents, badges |
| Neutral scale | Text, borders, section backgrounds |
| Typography | Headings: bold geometric sans; body: readable sans (match `shared-ui` where possible) |
| Radius / shadow | Match product UI for screenshot cohesion |

**Rule:** Marketing site uses **Ordella master brand**; product screenshots use **demo tenant “Bella Kitchen”** with warm palette so prospects see theming capability without clash.

### Screenshot & visual inventory

Capture from **staging** at 1440×900 (desktop) and 390×844 (mobile). Use consistent browser chrome (optional Figma frame).

| ID | Asset | Used on |
|----|-------|---------|
| V1 | Admin — Products list | Landing grid, Features Admin |
| V2 | Admin — Order detail | Features Admin |
| V3 | Admin — Reports (sales) | Landing, Features |
| V4 | Admin — Settings → Branding (live preview) | Landing pillars, Features Branding |
| V5 | Admin — Settings → Billing (plan + usage) | Pricing, Features Billing |
| V6 | POS — Home / menu grid | Landing hero composite, Features POS |
| V7 | POS — Cart + checkout | Features POS, How it works |
| V8 | POS — Receipt screen | Features POS |
| V9 | Storefront — Menu (mobile) | Hero, Features Storefront |
| V10 | Storefront — Basket + checkout | Features Storefront |
| V11 | Storefront — Order tracking | Features Storefront |
| V12 | KDS — Active tickets | Landing, Features KDS |
| V13 | Driver — Task list + map | Features Delivery |
| V14 | Driver — Delivery status update | Features Delivery |
| V15 | Customer — Home + orders | Features Customer |
| V16 | Onboarding — Wizard step (menu) | How it works |
| V17 | Architecture diagram (SVG) | Landing overview |
| V18 | Plan comparison graphic (optional) | Pricing |

**Video (v2):** 90–120s product tour hosted on YouTube/Vimeo; embed in hero modal.

### Accessibility for visuals

- Alt text describing outcome, not just “screenshot”  
- Don’t rely on screenshot text alone for critical pricing info (duplicate in HTML)  

---

## 10) Technical implementation notes

### Next.js 14 app structure (suggested)

```
apps/marketing/
  app/
    layout.tsx              # Global nav, footer, analytics
    page.tsx                # Landing
    pricing/page.tsx
    features/page.tsx
    docs/[[...slug]]/page.tsx
    blog/page.tsx
    blog/[slug]/page.tsx
    signup/page.tsx         # Redirect or embedded signup
    sitemap.ts
    robots.ts
  content/
    docs/**/*.mdx
    blog/**/*.mdx
  components/
    marketing/              # Hero, PlanCard, FeatureGrid, CTA
  lib/
    analytics.ts
    seo.ts
```

**Monorepo:** Reuse `@ordella/shared-ui` for buttons/cards; **do not** mount tenant `ThemeProvider` on marketing pages.

### Routing to app (multi-tenant)

| Marketing action | Destination |
|------------------|-------------|
| Start free trial | `https://app.{PLATFORM_BASE_DOMAIN}/signup?plan=free&utm_*` |
| Log in | `https://admin.{PLATFORM_BASE_DOMAIN}/login` |
| After signup | Onboarding wizard on Admin (JWT from `POST /api/v1/onboarding/signup`) |

Environment variables:

```env
NEXT_PUBLIC_MARKETING_URL=https://ordella.com
NEXT_PUBLIC_APP_URL=https://app.ordella.com
NEXT_PUBLIC_ADMIN_URL=https://admin.ordella.com
NEXT_PUBLIC_API_URL=https://api.ordella.com
```

### SEO

| Item | Implementation |
|------|----------------|
| **Meta title/description** | `generateMetadata` per page; template `%s · Ordella` |
| **Open Graph** | `og:title`, `og:description`, `og:image` (1200×630), `og:url` |
| **Twitter card** | `summary_large_image` |
| **Canonical URLs** | `alternates.canonical` on all indexable pages |
| **Sitemap** | `app/sitemap.ts` — `/`, `/pricing`, `/features`, `/docs/*`, `/blog/*` |
| **robots.txt** | `app/robots.ts` — allow marketing; disallow `/api` if any |
| **Structured data** | `Organization`, `SoftwareApplication`, `FAQPage` on pricing FAQ |
| **Performance** | `next/image` for screenshots; static generation for docs/blog |

### Analytics & consent

| Tool | Purpose |
|------|---------|
| **Plausible** or **GA4** | Pageviews, funnel events |
| **Events** | `cta_trial_click`, `pricing_plan_select`, `signup_redirect`, `docs_search` |
| **Cookie banner** | Consent before loading analytics in EU/UK; link to `/legal/privacy` |
| **Stripe** | Not on marketing site (billing in app only) |

### Performance targets (marketing)

- LCP < 2.5s on landing (mobile)  
- CLS < 0.1  
- Lighthouse SEO score > 90  

---

## 11) Launch checklist

### Content

- [ ] Hero copy approved  
- [ ] All V1–V18 screenshots captured on staging demo tenant  
- [ ] Pricing matches `BillingPlanRegistry` limits  
- [ ] Legal: Privacy + Terms published  
- [ ] 5+ docs articles live (Getting Started + Onboarding + Billing)  
- [ ] 3+ blog posts scheduled for launch week  

### Technical

- [ ] Production deploy (Vercel recommended) on `ordella.com`  
- [ ] SSL + `www` redirect policy  
- [ ] Sitemap submitted to Google Search Console  
- [ ] Analytics + cookie banner verified in EU mode  
- [ ] Signup redirect to `app.*` tested with UTM preservation  
- [ ] Open Graph preview validated (Twitter, LinkedIn, Slack)  

### Conversion

- [ ] Full funnel test: Landing → Signup → Onboarding → First order  
- [ ] `plan=` query param flows to billing step  
- [ ] Enterprise contact form delivers to sales inbox  

---

## Related documents

| Document | Purpose |
|----------|---------|
| [PRODUCTION_READINESS_TEST_PLAN.md](./PRODUCTION_READINESS_TEST_PLAN.md) | QA before public traffic |
| [PRODUCTION_READINESS_CHECKLIST.md](./PRODUCTION_READINESS_CHECKLIST.md) | GO/NO-GO gates |
| [infrastructure/deployment/ARCHITECTURE.md](./infrastructure/deployment/ARCHITECTURE.md) | Domains & hosting |
| [apps/api/src/modules/billing/registry/billing-plan.registry.ts](./apps/api/src/modules/billing/registry/billing-plan.registry.ts) | Source of truth for plan limits |

---

## Document history

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-24 | Initial marketing site plan |
