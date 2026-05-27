# marketing-ui Module Template

Public marketing site: narrative, conversion, brand expression within ODS tokens.

**Repo:** `apps/marketing` · **Reference:** `app/globals.css`, `website/sections/`

**Related:** [layout/CONTAINERS](../layout/CONTAINERS.md) · [website/copy](../../website/copy/homepage.md) · [brand/VOICE_AND_TONE](../../brand/VOICE_AND_TONE.md)

---

## Page shell (text diagram)

```
┌─────────────────────────────────────────────┐
│ NAVBAR sticky z-sticky — logo, links, CTA    │
├─────────────────────────────────────────────┤
│ HERO (full bleed bg optional)                │
│   inner container-lg                         │
├─────────────────────────────────────────────┤
│ SECTIONS Stack (space-48 – space-64)         │
├─────────────────────────────────────────────┤
│ FOOTER container-lg                          │
└─────────────────────────────────────────────┘
```

**Containers:** outer `container-xl` 1440px; content `container-lg` 1280px; prose max **72ch**.

---

## Hero layout

```
┌─────────────────────────────────────────────────┐
│  HEADLINE — font-size-display (desktop)          │
│  SUBHEADLINE — font-size-md, neutral-600, max 72ch│
│  [Primary CTA]  [Secondary CTA]                  │
│  optional: product screenshot radius-lg          │
└─────────────────────────────────────────────────┘
```

| Element | Rule |
|---------|------|
| Headline | “The Retail Operating System” — sentence case |
| Subheadline | One value prop; `space-16` below headline |
| CTA gap | `space-12` between buttons |
| Vertical padding | `space-48` min mobile; `space-64` desktop |
| Media | `radius-lg`; `shadow-brand` allowed ([SHADOW_TOKENS](../tokens/SHADOW_TOKENS.md)) |

**Components:** [Button](../components/BUTTON.md) primary + secondary/ghost.

**Responsive:** Headline `font-size-2xl` mobile → `font-size-display` desktop ([TYPOGRAPHY_TOKENS](../tokens/TYPOGRAPHY_TOKENS.md)).

---

## Section spacing rules

| Between | Token |
|---------|-------|
| Major sections | `space-48`–`space-64` |
| Inside section title → content | `space-24` |
| Feature grid cards | gutter `space-24` |
| CTA band internal | `space-32` padding y |

**Alignment:** Section titles left-aligned; CTA bands center-aligned.

---

## Content blocks

### Features grid

```
PageSection title heading-xl
Grid 12-col desktop — 3× span-4
  Card elevation shadow or border
    icon / image
    title heading-md
    body body-md
```

| mobile | 1 column stack full span |
| tablet | 2 columns |

### Testimonials

```
container-md centered
Stack gap space-24
  Card quote body-md
  caption attribution
```

### Pricing

```
Grid 3-col desktop — plan Cards
  highlighted plan: border primary-600
  CTA per card: primary or secondary
```

Align tiers with [website/copy/pricing](../../website/copy/pricing.md) when published.

---

## CTA alignment rules

| CTA type | Alignment | Background |
|----------|-----------|------------|
| Hero | Left (or center on narrow marketing tests) | transparent / hero bg |
| Mid-page band | **Center** Stack | `neutral-50` or `primary-600` (inverted text) |
| Footer newsletter | Left form + right or stack mobile | `neutral-50` |
| Navbar | Right | `neutral-0` sticky |

**Rule:** One primary CTA per **viewport section**—secondary optional beside it.

---

## Responsive behavior

| Element | mobile ≤480 | tablet | desktop | wide 1441+ |
|---------|-------------|--------|---------|------------|
| Nav | hamburger drawer | full or condensed | full | full |
| Hero | stack text + image | 2-col optional | 2-col | wider media |
| Feature grid | 1 col | 2 col | 3 col | 3 col |
| Container padding | `space-16` | `space-24` | `space-24` | `space-32` outer |

**Rule:** Readable line length ≤72ch for paragraphs.

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| Hero headline + subhead + primary “Request demo” | Hero with 5 equal buttons |
| `space-64` between major sections | Inconsistent 40px gaps |
| Center mid-page CTA band | Random left/right CTAs per section |
| container-lg for feature copy | Full-bleed text 100% width on 4K |
| ODS [Button](../components/BUTTON.md) variants | Custom gradient buttons outside tokens |

---

## Components summary

[Button](../components/BUTTON.md) · [Card](../components/CARD.md) · [layout/Grid](../layout/GRID_SYSTEM.md) · [layout/Stack](../layout/LAYOUT_PRIMITIVES.md) · Navbar (app-specific wrapper using tokens) · [Tabs](../components/TABS.md) optional for pricing toggle

**Migration note:** marketing `primary` may be `#3A6DFF` until aligned to `primary-600` ([COLOR_TOKENS](../tokens/COLOR_TOKENS.md)).
