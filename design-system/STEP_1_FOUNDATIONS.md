# ODS Step 1 — Foundations

Typography, spacing, color, elevation, radius, and borders. All product UIs map CSS variables to these token names.

**Related:** [OVERVIEW](./OVERVIEW.md) · [Token reference](./tokens/) ([typography](./tokens/TYPOGRAPHY_TOKENS.md), [spacing](./tokens/SPACING_TOKENS.md), [color](./tokens/COLOR_TOKENS.md)) · [Brand visual identity](../brand/VISUAL_IDENTITY.md) · `apps/shared-ui/tailwind.preset.cjs` · `apps/marketing/app/globals.css`

---

## Typography scale

**Font families**

| Token | Stack | Use |
|-------|-------|-----|
| `font-sans` | Inter, system-ui, sans-serif | All UI except code |
| `font-mono` | JetBrains Mono, ui-monospace, monospace | API snippets, SKUs, receipt IDs |

**Scale (desktop default; POS/KDS may +1 step for touch context)**

| Token | Size | Line height | Weight | Use |
|-------|------|-------------|--------|-----|
| `display-lg` | 48px | 1.1 (52px) | 600 | marketing-ui hero only |
| `heading-xl` | 36px | 1.2 | 600 | marketing-ui page title |
| `heading-lg` | 24px | 1.3 | 600 | admin-ui page title, PageHeader |
| `heading-md` | 20px | 1.4 | 600 | Card titles, modal titles |
| `heading-sm` | 16px | 1.4 | 600 | Subsection, table group header |
| `body-md` | 16px | 1.5 | 400 | Default body, form inputs |
| `body-sm` | 14px | 1.5 | 400 | Tables, dense admin-ui, secondary copy |
| `caption` | 12px | 1.4 | 400 | Timestamps, help text, badges |
| `code-sm` | 13px | 1.45 | 400 | Inline code, monospace fields |

**Rules**

- UI labels: **sentence case** (not ALL CAPS except POS SKU shortcuts where space-constrained).  
- **Tabular nums** (`font-variant-numeric: tabular-nums`) on money, qty, order IDs in `admin-ui`, `pos-ui`, `kds-ui`.  
- Max prose width **72ch** on `marketing-ui`; data tables may use full content width.  
- Do not use `display-lg` inside `admin-ui`, `pos-ui`, or `kds-ui`.

**Example (text):** Page title “Inventory” = `heading-lg`; column header “On hand” = `body-sm` weight 500; cell value `1234` = `body-sm` tabular.

---

## Spacing scale (4px base, 8px rhythm)

All margin, padding, and gap values **must** be ODS space tokens (multiples of 4). Prefer **8px rhythm** for vertical stacks between sections.

| Token | px | Typical use |
|-------|-----|-------------|
| `space-0` | 0 | — |
| `space-1` | 4 | Icon-text gap, chip padding y |
| `space-2` | 8 | Inline field gap, compact lists |
| `space-3` | 12 | Input padding y (dense) |
| `space-4` | 16 | Card padding, form field gap |
| `space-5` | 20 | — |
| `space-6` | 24 | Section gap inside page, modal padding |
| `space-8` | 32 | Block below PageHeader |
| `space-10` | 40 | — |
| `space-12` | 48 | marketing-ui section gap |
| `space-16` | 64 | marketing-ui large section |

**Vertical rhythm rules**

- Between `PageHeader` and first content block: **`space-8`** (32px).  
- Between stacked cards in admin-ui: **`space-6`**.  
- Form label → input: **`space-2`**.  
- Input → error text: **`space-1`**.  
- POS product grid gutter: **`space-3`** minimum.

**Anti-pattern:** `margin-top: 13px`, `padding: 10px 15px` — round to nearest token or fix design.

---

## Color system

### Primary

| Token | Hex | Usage |
|-------|-----|--------|
| `primary-50` | `#F0FDFA` | Tint backgrounds |
| `primary-100` | `#CCFBF1` | Hover row (subtle) |
| `primary-600` | `#0F766E` | **ODS canonical** primary actions, links |
| `primary-700` | `#0D9488` | Primary hover |
| `primary-800` | `#115E59` | Active/pressed |

**Migration:** `marketing-ui` maps `--color-primary: #3A6DFF` → `primary-600` target in phased PR.

### Secondary

| Token | Hex | Usage |
|-------|-----|--------|
| `secondary-50` | `#F4F6F8` | Secondary button bg |
| `secondary-600` | `#475569` | Secondary text emphasis |
| `accent-500` | `#F59E0B` | Highlights, chart series 2 |
| `accent-600` | `#D97706` | Accent hover |

### Neutrals

| Token | Hex | Usage |
|-------|-----|--------|
| `neutral-0` | `#FFFFFF` | Cards, modals |
| `neutral-50` | `#F4F6F8` | Page background |
| `neutral-100` | `#EEF1F4` | Subtle zebra / hover |
| `neutral-200` | `#E5E7EB` | Borders default |
| `neutral-400` | `#9CA3AF` | Placeholder text |
| `neutral-600` | `#6B7280` | Secondary text |
| `neutral-900` | `#0F1A2A` | Primary text |

### Semantic

| Token | Hex | Usage | Pair with |
|-------|-----|--------|-----------|
| `success-500` | `#2ECC71` | Positive, in-stock | icon + label |
| `success-50` | `#ECFDF5` | Success alert bg | — |
| `warning-500` | `#FFB020` | Pending, low stock | icon + label |
| `warning-50` | `#FFFBEB` | Warning alert bg | — |
| `error-500` | `#FF6B6B` | Errors, destructive | icon + label |
| `error-50` | `#FEF2F2` | Error alert bg | — |
| `info-500` | `#3B82F6` | Informational | icon + label |
| `info-50` | `#EFF6FF` | Info alert bg | — |

**Rules**

- Body on `neutral-0`: contrast ≥ **4.5:1**.  
- `primary-600` on white: verify AA for buttons.  
- **Never** convey status by color alone (`kds-ui` ticket states need text/icon).

### CSS variable mapping (shared-ui pattern)

Map in app `:root`:

```css
/* Example mapping — implement in shared theme file */
--primary: 174 77% 26%;        /* primary-600 in HSL for Tailwind */
--destructive: 0 84% 71%;      /* error-500 */
--border: 214 20% 90%;          /* neutral-200 */
```

Reference: `apps/shared-ui/tailwind.preset.cjs` (`primary`, `destructive`, `muted`, `card`).

---

## Elevation / shadows

Use sparingly on operational UIs; marketing may use more depth.

| Token | Value (example) | Use |
|-------|-----------------|-----|
| `shadow-none` | none | Flat tables, kds-ui full-screen |
| `shadow-sm` | `0 1px 2px rgb(15 26 42 / 0.04)` | Cards admin-ui |
| `shadow-md` | `0 4px 12px rgb(15 26 42 / 0.08)` | Dropdowns, popovers |
| `shadow-lg` | `0 8px 24px rgb(15 26 42 / 0.1)` | Modals |
| `shadow-brand` | `0 4px 20px rgb(primary / 0.18)` | marketing-ui CTA cards only |

**Rules**

- `pos-ui` / `kds-ui`: prefer **borders** over shadows for performance and glare.  
- One elevation level per surface type—do not stack `shadow-lg` on nested cards.

---

## Border radius + border rules

### Radius

| Token | px | Use |
|-------|-----|-----|
| `radius-sm` | 6px | Inputs, chips, small buttons |
| `radius-md` | 12px | Cards, modals |
| `radius-lg` | 16px | marketing-ui screenshots, large panels |
| `radius-full` | 9999px | Avatars, pills |

**POS/KDS:** minimum **`radius-sm`** on touch controls; **`radius-md`** on tiles.

### Borders

| Token | Width / style | Color |
|-------|---------------|--------|
| `border-default` | 1px solid | `neutral-200` |
| `border-strong` | 1px solid | `neutral-400` (focus rings separate) |
| `border-focus` | 2px solid | `primary-600` + offset ring |

**Rules**

- Dividers in tables: `border-default` row bottom only—no double borders.  
- Error inputs: `border-error-500` + error message below—do not only recolor border red without text.

---

## Module notes

| Module | Foundation priority |
|--------|---------------------|
| admin-ui | `body-sm` tables, `space-6` cards, semantic colors for stock |
| pos-ui | +1 type step for labels, 48px min touch, high contrast |
| kds-ui | Semantic bg tints for ticket age, minimal shadow |
| driver-ui | `body-md` mobile, `space-4` list rows |
| storefront-ui / customer-ui | `body-md`, marketing-aligned primary after migration |
| marketing-ui | `display-lg`, `shadow-brand`, section `space-12` |

Next: [STEP_2_COMPONENTS.md](./STEP_2_COMPONENTS.md)
