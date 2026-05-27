# kds-ui Module Template

Full-screen kitchen display for ticket fulfillment. **Landscape only** for production QA.

**Repo:** `apps/kds-ui`

**Related:** [layout/FullscreenLayout](../layout/LAYOUT_PRIMITIVES.md#fullscreenlayout-kds-ui) · [components/CARD](../components/CARD.md) · [components/BADGE](../components/BADGE.md) · [COLOR_TOKENS](../tokens/COLOR_TOKENS.md)

---

## App shell (text diagram)

```
┌────────────────────────────────────────────────────────────────┐
│ HEADER 56px — Station | Course filter | Station filter | Clock  │
├────────────────────────────────────────────────────────────────┤
│ TICKET GRID (100vh − header, scroll vertical)                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│  │ T-101  │ │ T-102  │ │ T-103  │ │ T-104  │ │ T-105  │        │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │
│  auto-fill minmax(280px, 1fr), gutter space-16                 │
└────────────────────────────────────────────────────────────────┘
```

**Rule:** No sidebar; no marketing [Container](../layout/CONTAINERS.md); minimal shadow ([SHADOW_TOKENS](../tokens/SHADOW_TOKENS.md) `none`).

---

## Full-screen grid layout

| Property | 1920×1080 | 1280×720 |
|----------|-----------|----------|
| Columns (approx) | 5–6 | 3–4 |
| Card min size | **280 × 180px** | same |
| Gutter | `space-16` | `space-16` |
| Scroll | Vertical on grid only | same |

---

## Order card structure

```
┌─────────────────────────────┐
│ HEADER: Table/order # | Badge│  ← age / status
├─────────────────────────────┤
│ ITEMS (scroll if >6 lines)  │
│  2× Burger                  │
│  1× Fries                   │
├─────────────────────────────┤
│ FOOTER: timer | Bump | Done  │  ← Button lg
└─────────────────────────────┘
```

| Zone | Typography / spacing |
|------|---------------------|
| Header | `font-size-lg` semibold; padding `space-16` |
| Items | `font-size-md`; line gap `space-8` |
| Footer | `Flex justify="between"`; padding `space-16` |

**Components:** [Card](../components/CARD.md) `elevation="border"`; [Badge](../components/BADGE.md) for time/status.

---

## Color-coded status rules

| Status | Background | Border | Label (required) |
|--------|------------|--------|------------------|
| **New** | `info-50` | `info-500` 2px | “NEW” |
| **In progress** | `neutral-0` | `border-default` | “COOKING” or station text |
| **Warning SLA** | `warning-50` | `warning-500` | “8m” / time |
| **Overdue** | `error-50` | `error-500` | “OVERDUE” |
| **Complete** | animate out / dim | — | removed from grid |

**Rule:** Never status by color alone ([STEP_5](../STEP_5_VISUAL_QA_RULES.md)).

---

## Priority indicators

| Priority | Visual | Placement |
|----------|--------|-----------|
| Rush / VIP | `error-500` [Badge](../components/BADGE.md) “RUSH” | Header left |
| Standard | none | — |
| Held | `warning-500` “HELD” | Header |

Sort order (default): Overdue → Rush → oldest timer → New.

---

## Large touch target rules

| Control | Min size | Gap |
|---------|----------|-----|
| Bump | 48px height `lg` [Button](../components/BUTTON.md) secondary | `space-8` |
| Complete | 48px `lg` primary | `space-8` |
| Card tap (optional expand) | Full card width | — |
| Header filters | 40px height `md` | `space-12` |

**Spacing between cards:** `space-16` gutter only—no extra margin on cards.

---

## Landscape-only layout rules

| Rule | Detail |
|------|--------|
| Orientation | Design and QA at **landscape** only for wall mounts |
| Portrait 768×1024 | Unsupported for v1; do not optimize |
| Header | Always visible; `z-sticky` |
| Rotation | If device rotates, show [Alert](../components/ALERT.md) “Rotate to landscape” |

---

## KDS resolution rules (1080p landscape)

| Viewport | Role |
|----------|------|
| **1920 × 1080** | **Primary** wall display |
| 1280 × 720 | Secondary screen / smaller kitchen |
| 1024 × 768 | Pass-through station (min 3 columns) |

Regression: screenshot grid at 1920×1080 before release.

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| Ticket “OVERDUE” + red tint | Red card only |
| `shadow-none` cards | `shadow-lg` on tickets |
| Bump + Complete `lg` | 32px text-only links |
| 280px min card width | 200px unreadable cards |

---

## Components summary

[Button](../components/BUTTON.md) `lg` · [Badge](../components/BADGE.md) · [Card](../components/CARD.md) · [Alert](../components/ALERT.md) station offline · [Select](../components/SELECT.md) filters in header
