# Layout Breakpoints

Canonical viewport ranges for ODS Layout. Token definitions: [BREAKPOINT_TOKENS](../tokens/BREAKPOINT_TOKENS.md).

**Related:** [RESPONSIVE_BEHAVIOR](./RESPONSIVE_BEHAVIOR.md) · [GRID_SYSTEM](./GRID_SYSTEM.md) · [CONTAINERS](./CONTAINERS.md)

---

## Standard breakpoints

| Token | Width range | CSS `min-width` (next tier) | Primary UIs |
|-------|-------------|----------------------------|-------------|
| **mobile** | ≤ 480px | default (no min) | **driver-ui**, storefront mobile, customer-ui |
| **tablet** | 481–768px | `481px` | storefront, admin collapsed nav |
| **desktop** | 769–1440px | `769px` | **admin-ui**, **storefront-ui**, **customer-ui** |
| **wide desktop** | 1441px+ | `1441px` | **marketing-ui** hero, large monitors |

**Rule:** Design mobile-first; enhance at `481px`, `769px`, `1441px`.

---

## POS fixed resolutions

Layout is **fluid within viewport** but QA is fixed—do not rely on resize for lane UX.

| Viewport | Size | Priority | Module |
|----------|------|----------|--------|
| `viewport-pos-landscape` | **1024 × 768** | Primary | **pos-ui** |
| `viewport-pos-wide` | **1280 × 800** | Supported lane display | **pos-ui** |
| `viewport-pos-portrait` | 768 × 1024 | Secondary | pos-ui |

| Rule | Value |
|------|--------|
| Main chrome | No document-level horizontal scroll |
| Split ratio | Product ~62% / cart ~38% at 1024px |
| Touch spacing | [SPACING_TOKENS](../tokens/SPACING_TOKENS.md) `space-12`+ between tap targets |

---

## KDS fixed resolutions

| Viewport | Size | Module |
|----------|------|--------|
| `viewport-kds-1080p` | **1920 × 1080** landscape | **kds-ui** primary wall |
| `viewport-kds-720` | 1280 × 720 | kds-ui secondary |
| `viewport-kds-tablet` | 1024 × 768 | kds-ui pass-through |

**Rule:** Ticket grid uses auto-fill min **280px** card width; target **4–6** columns at 1080p.

---

## Responsive rules: typography

From [TYPOGRAPHY_TOKENS](../tokens/TYPOGRAPHY_TOKENS.md):

| Element | mobile ≤480 | tablet 481–768 | desktop 769+ | wide 1441+ |
|---------|-------------|----------------|--------------|------------|
| Page title | `font-size-xl` (20px) | `font-size-2xl` | `font-size-2xl` | same |
| marketing hero | `font-size-2xl` | `font-size-3xl` | `font-size-display` | `font-size-display` |
| Body | `font-size-md` | `font-size-md` | `font-size-md` | `font-size-md` |
| admin table | `font-size-sm` | `font-size-sm` | `font-size-sm` | `font-size-sm` |
| pos-ui / kds-ui labels | `font-size-lg` | `font-size-lg` | `font-size-lg` | fixed viewport |

**Rule:** No `font-size-display` in admin-ui, pos-ui, or kds-ui at any breakpoint.

---

## Responsive rules: spacing

From [SPACING_TOKENS](../tokens/SPACING_TOKENS.md):

| Context | mobile | tablet | desktop | wide |
|---------|--------|--------|---------|------|
| Page padding X | `space-16` | `space-24` | `space-24` | `space-24`–`space-32` |
| Section gap | `space-32` | `space-32` | `space-32` | `space-48` marketing |
| PageHeader → content | `space-32` | `space-32` | `space-32` | `space-32` |
| Grid gutter | `space-12` | `space-16` | `space-24` | `space-24` |

**pos-ui / kds-ui:** spacing does not shrink below `space-12` on touch rows.

---

## Responsive rules: grids

| Breakpoint | Column count | See |
|------------|--------------|-----|
| mobile | 4 | [GRID_SYSTEM](./GRID_SYSTEM.md) |
| tablet | 6 | |
| desktop / wide | 12 | |
| pos-ui | internal split, not 12-col page | [MODULE_LAYOUT_RULES](./MODULE_LAYOUT_RULES.md) |
| kds-ui | auto-fill ticket grid | |

---

## Responsive rules: containers

| Breakpoint | Max content width | See |
|------------|-------------------|-----|
| mobile | 100% | [CONTAINERS](./CONTAINERS.md) |
| tablet | 640–720px centered (commerce) | |
| desktop | 960–1280px | |
| wide | 1440px max outer; 1280px prose | |

**admin-ui:** content area is **fluid** inside shell (no 1280 cap on tables).

---

## Examples (text only)

| Scenario | Breakpoint behavior |
|----------|---------------------|
| driver-ui task list | Designed at 375px mobile; tablet adds optional map column |
| storefront PLP | 2-col mobile → 3 tablet → 4 desktop grid |
| admin-ui sidebar | Hidden/drawer mobile; fixed 240px desktop ≥769px |
| pos-ui checkout | Identical layout at 1024×768 and 1280×800; more grid columns at 1280 |

Next: [GRID_SYSTEM.md](./GRID_SYSTEM.md)
