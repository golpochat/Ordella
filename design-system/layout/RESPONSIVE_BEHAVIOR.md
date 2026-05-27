# Responsive Behavior

How layout and [components](../components/OVERVIEW.md) adapt across breakpoints. Breakpoint definitions: [BREAKPOINTS](./BREAKPOINTS.md).

**Related:** [GRID_SYSTEM](./GRID_SYSTEM.md) · [MODULE_LAYOUT_RULES](./MODULE_LAYOUT_RULES.md) · [STEP_5 QA](../STEP_5_VISUAL_QA_RULES.md)

---

## Component adaptation by breakpoint

| Component | mobile ≤480 | tablet 481–768 | desktop 769+ |
|-----------|-------------|----------------|--------------|
| [Button](../components/BUTTON.md) | Full-width allowed in sticky bars | Inline groups | Inline groups |
| [Input](../components/INPUT.md) | 100% width | 100% or half in 6-col | Fixed max in forms |
| [Select](../components/SELECT.md) | 100% width | Same | Inline in filter Flex |
| [Modal](../components/MODAL.md) | Full width − `space-16` margin | max-width tokens | sm/md/lg |
| [Table](../components/TABLE.md) | Horizontal scroll wrapper | Scroll or hide low-priority cols | Full columns |
| [Card](../components/CARD.md) | Full span | 2-col possible | Grid spans |
| [Tabs](../components/TABS.md) | Scroll tablist or Select fallback | Scroll tablist | Full tablist |
| [PageHeader](../components/LAYOUT_PRIMITIVES.md) | Actions below title | Row if space | Actions right |

**pos-ui / kds-ui:** component sizes stay `lg`; layout does not collapse to mobile patterns.

---

## Grid collapse

| Layout | mobile (4-col) | tablet (6-col) | desktop (12-col) |
|--------|----------------|----------------|------------------|
| Dashboard KPIs | 2×2 | 3+3 or 2×3 | 4× span-3 |
| Feature 3-up | 1 col stack | 2+1 or 3 | 3× span-4 |
| Form 2-col | 1 col | 2 col | 2 col |
| Sidebar + content | drawer + full | optional split | 3+9 or shell |

**Rule:** Reduce spans, never shrink gutter below token minimum.

---

## Navigation changes

| UI | mobile | tablet | desktop |
|----|--------|--------|---------|
| **admin-ui** | Hamburger → drawer overlay | Collapsed icon sidebar optional | 240px sidebar |
| **storefront-ui** | Bottom or top nav compact | Same + filter drawer | Mega menu optional |
| **customer-ui** | Tab bar / menu | Top nav | Top nav |
| **marketing-ui** | Hamburger menu | Full nav if fits | Full nav |
| **driver-ui** | App bar + back | Same | Optional split view |
| **pos-ui** | N/A (fixed) | N/A | Topbar only |
| **kds-ui** | N/A | N/A | Station header only |

**Z-index:** drawer `z-drawer`; modal `z-modal` above drawer ([Z_INDEX_TOKENS](../tokens/Z_INDEX_TOKENS.md)).

---

## Table behavior

| Pattern | When | Module |
|---------|------|--------|
| **Horizontal scroll** | Default admin mobile | admin-ui |
| **Column hide** | Priority columns only <768px | admin-ui |
| **Stacked card rows** | Optional pattern per route | admin-ui rare |
| **No table** | Use Card list | driver-ui |
| **N/A** | Grid cards | kds-ui, pos-ui products |

**Example (text):** admin-ui orders table at 400px — scroll wrapper; “Customer” column hidden; actions remain icon column.

---

## POS / KDS stability at fixed resolutions

| Rule | pos-ui | kds-ui |
|------|--------|--------|
| Breakpoint media | Do not collapse split to single column | Do not reduce ticket min width below 280px |
| Typography | Fixed `font-size-lg` labels | Fixed status badges |
| Touch spacing | Constant 48px targets | Large bump/complete buttons |
| Scroll | Product grid only | Ticket grid only |
| QA viewports | 1024×768, 1280×800 | 1920×1080 |

**Regression test:** Screenshot compare at fixed sizes before release.

---

## Examples: forms

| UI | mobile | desktop |
|----|--------|---------|
| admin-ui settings | Single column Stack | 2-col Grid for city/state/zip |
| customer-ui profile | Full width fields | `container-sm` centered |
| storefront checkout | Sticky pay bar | 2-col shipping if logged in |
| pos-ui discount | Full-width sheet field | Same at all POS sizes |

---

## Examples: tables

| UI | Behavior |
|----|----------|
| admin-ui inventory desktop | 12-col full; sticky header |
| admin-ui inventory mobile | Scroll; filters stacked Flex |
| marketing-ui | No data tables—use prose |
| storefront-ui orders (customer) | Card list, not Table |

---

## examples: dashboards

| UI | desktop | mobile |
|----|---------|--------|
| admin-ui HQ | 4 KPI span-3 + chart span-8 | KPI 2×2; chart full |
| marketing-ui | 3 feature cards span-4 | stack full |

---

## examples: product grids

| UI | mobile | tablet | desktop | pos 1024 |
|----|--------|--------|---------|------------|
| storefront-ui | 2 col | 3 col | 4 col | — |
| pos-ui | — | — | — | 5–6 col auto-fill in main pane |

Filter sidebar → drawer ≤768px on storefront.

---

## QA checklist (layout)

| # | Check |
|---|--------|
| 1 | Correct shell for module ([MODULE_LAYOUT_RULES](./MODULE_LAYOUT_RULES.md)) |
| 2 | Container max-width respected (commerce/marketing) |
| 3 | Gutters use spacing tokens only |
| 4 | PageHeader → content `space-32` |
| 5 | POS/KDS tested at fixed viewports |
| 6 | No horizontal scroll on driver-ui list (except intentional) |
| 7 | admin table scrolls inside Card, not page |

See [STEP_5](../STEP_5_VISUAL_QA_RULES.md) for full design-complete criteria.

Return to [layout OVERVIEW](./OVERVIEW.md)
