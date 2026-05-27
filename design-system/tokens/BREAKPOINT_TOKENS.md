# Breakpoint Tokens

Responsive width tokens and fixed operational resolutions. Use with layout templates in [STEP_4](../STEP_4_MODULE_LAYOUT_TEMPLATES.md).

**Related:** [STEP_3 — Layout system](../STEP_3_LAYOUT_SYSTEM.md) · [TYPOGRAPHY_TOKENS](./TYPOGRAPHY_TOKENS.md) · [SPACING_TOKENS](./SPACING_TOKENS.md)

---

## Standard breakpoints

| Token | Range | Min width (CSS) | Typical devices |
|-------|--------|-----------------|-----------------|
| `breakpoint-mobile` | ≤ 480px | — (default) | Phone portrait, driver-ui primary |
| `breakpoint-tablet` | 481–768px | `481px` | Tablet portrait, narrow admin |
| `breakpoint-desktop` | 769–1440px | `769px` | Laptop, admin sidebar, storefront |
| `breakpoint-wide` | 1441px+ | `1441px` | Large monitors, marketing hero |

### Tailwind / CSS mapping (recommended)

| Token | `min-width` media |
|-------|-------------------|
| `breakpoint-tablet` | `@media (min-width: 481px)` |
| `breakpoint-desktop` | `@media (min-width: 769px)` |
| `breakpoint-wide` | `@media (min-width: 1441px)` |

**Legacy aliases (STEP_3):** `sm` 640px, `md` 768px, `lg` 1024px — align new work to table above; migrate `sm`/`md` in phased PRs.

---

## POS / KDS fixed resolutions

Design and QA at these viewports even if CSS is fluid.

| Token | Resolution | Module | Orientation |
|-------|------------|--------|-------------|
| `viewport-pos-landscape` | 1024 × 768 | pos-ui | **Primary** |
| `viewport-pos-portrait` | 768 × 1024 | pos-ui | Supported |
| `viewport-kds-hd` | 1920 × 1080 | kds-ui | Wall display |
| `viewport-kds-720` | 1280 × 720 | kds-ui | Secondary |
| `viewport-kds-tablet` | 1024 × 768 | kds-ui | Pass-through station |

**Rules**

- Touch targets ≥ 44×44px at all POS/KDS viewports.  
- No horizontal scroll on `viewport-pos-landscape` for main chrome (grid may scroll internally).

---

## Responsive behavior rules

### Layout

| Breakpoint | Behavior |
|------------|----------|
| mobile | Single column; PageHeader actions stack below title |
| tablet | admin-ui sidebar collapsible optional; storefront 3-col grid |
| desktop | admin-ui sidebar fixed 240px; storefront 4-col; max-width 1280px content |
| wide | marketing-ui optional wider hero; content still max 1280px readable |

### Typography

See [TYPOGRAPHY_TOKENS](./TYPOGRAPHY_TOKENS.md)—hero and page titles step down on mobile.

### Spacing

See [SPACING_TOKENS](./SPACING_TOKENS.md)—page padding `space-16` mobile → `space-24` desktop.

### Components

| Component | mobile | desktop |
|-----------|--------|---------|
| Modal | Full-width with `space-16` margin | `shadow-lg` centered, max-width tokens from STEP_2 |
| DataTable admin-ui | Horizontal scroll allowed | Full columns |
| driver-ui bottom CTA | Sticky full width | Optional side panel at tablet+ |

### Module-specific

| Module | Primary breakpoint |
|--------|-------------------|
| admin-ui | `breakpoint-desktop` |
| customer-ui / storefront-ui | mobile-first → desktop |
| marketing-ui | all four tokens |
| driver-ui | `breakpoint-mobile` |
| pos-ui / kds-ui | fixed viewports above |

---

## Examples (text only)

| Scenario | Rule |
|----------|------|
| admin-ui inventory at 400px width | Table scrolls; filters wrap; no sidebar overlay without drawer |
| storefront PDP at 480px | Gallery stacks above info; sticky cart footer |
| pos-ui at 1024×768 | Product grid + cart split; no document body scroll |
| kds-ui at 1280×720 | Minimum 3 ticket columns at 280px card width |

Next: [Z_INDEX_TOKENS.md](./Z_INDEX_TOKENS.md) · QA: [STEP_5](../STEP_5_VISUAL_QA_RULES.md)
