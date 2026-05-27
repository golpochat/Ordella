# Grid System

Column-based layout for admin, commerce, and marketing pages. Gutters use [SPACING_TOKENS](../tokens/SPACING_TOKENS.md) only.

**Related:** [BREAKPOINTS](./BREAKPOINTS.md) · [components/Grid](../components/LAYOUT_PRIMITIVES.md) · [TABLE](../components/TABLE.md)

---

## Column counts by breakpoint

| Breakpoint | Columns | Use |
|------------|---------|-----|
| **mobile** (≤480px) | **4** | Phone layouts, driver-ui |
| **tablet** (481–768px) | **6** | Tablet storefront, narrow admin |
| **desktop** (769–1440px) | **12** | admin-ui, storefront desktop, marketing |
| **wide** (1441px+) | **12** (same); content may center in wider container | marketing-ui |

**pos-ui / kds-ui:** do not use page-level 12-col grid—use [SplitLayout](./LAYOUT_PRIMITIVES.md#splitlayout-pos-ui) or ticket auto-fill grid.

---

## Gutter sizes

| Breakpoint | Gutter token | px |
|------------|--------------|-----|
| mobile | `space-12` | 12 |
| tablet | `space-16` | 16 |
| desktop / wide | `space-24` | 24 |

**Rule:** Gutter = gap between columns, not extra margin on container edges (container padding is separate—see [CONTAINERS](./CONTAINERS.md)).

---

## Content alignment

| Rule | Specification |
|------|----------------|
| Grid tracks | Equal-width columns within container |
| Default align | `stretch` for cards in cells |
| Text in cells | Left-align; numbers right-align in tables |
| Full-bleed row | `col-span` = full column count for that breakpoint |
| Centering marketing hero | Center **container**, not individual col offsets |

---

## Column spans

Span props are **per breakpoint** (conceptual API):

| Span name | mobile (4-col) | tablet (6-col) | desktop (12-col) |
|-----------|----------------|----------------|------------------|
| `full` | 4 | 6 | 12 |
| `half` | 2 | 3 | 6 |
| `third` | — | 2 | 4 |
| `quarter` | 1 | — | 3 |
| `two-thirds` | — | 4 | 8 |

**Rule:** On mobile, prefer `full` for forms and tables wrapper; use `half` only for paired short fields.

---

## Responsive collapse behavior

| Pattern | mobile | tablet | desktop |
|---------|--------|--------|---------|
| 4× KPI cards | 2×2 (`span 2`) | 3+3 or 2×3 | 4× `span 3` |
| Form 2-col | stack `full` | `half` × 2 | `half` × 2 |
| Sidebar + main | main `full`; sidebar drawer | optional 2+4 | 3+9 or fixed shell |
| Product grid (storefront) | 2 col auto | 3 col | 4 col |

**Collapse rule:** When `span` total exceeds column count, wrap to next row—never overflow horizontally without scroll container.

---

## Examples: forms

**admin-ui — Create location (desktop 12-col)**

| Field | Span |
|-------|------|
| Location name | 6 |
| Location code | 6 |
| Address line 1 | 12 |
| City | 4 |
| State | 4 |
| ZIP | 4 |

**mobile:** all fields `full` (4).

---

## Examples: tables

**admin-ui — Inventory list**

| Region | Span |
|--------|------|
| PageHeader | full |
| Filters toolbar | full |
| Table Card | full |

Table **inside** Card scrolls horizontally on mobile; grid does not replace table semantics ([TABLE](../components/TABLE.md)).

---

## Examples: dashboards

**admin-ui — Franchise HQ dashboard (desktop)**

| Widget | Span |
|--------|------|
| Revenue KPI | 3 |
| Orders KPI | 3 |
| Margin KPI | 3 |
| Alerts KPI | 3 |
| Sales chart | 8 |
| Top locations table | 4 |

**tablet:** KPIs `span 2` (6-col); chart `full`.

**marketing-ui — Feature grid**

| Card | desktop span | mobile |
|------|--------------|--------|
| Feature A | 4 | full |
| Feature B | 4 | full |
| Feature C | 4 | full |

---

## Commerce product grid (storefront-ui, pos-ui)

Not the 12-col system—**auto-fill** grid:

| Breakpoint | Min tile width | Columns (approx) |
|------------|----------------|------------------|
| mobile | 140px | 2 |
| tablet | 160px | 3–4 |
| desktop | 200px | 4 |
| pos 1024px | 120px | 5–6 in product pane |

Gutter: `space-12` pos-ui; `space-16` storefront tablet+.

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| KPI row 4× span-3 on desktop | Four divs with `width: 23%` |
| Gutters `space-24` on admin dashboard | 20px gutter |
| Table in full-span Card | Table columns squeezed into span-6 |
| pos-ui product auto-fill in split pane | 12-col page grid on register |

Next: [CONTAINERS.md](./CONTAINERS.md)
