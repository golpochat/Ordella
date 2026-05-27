# Typography Tokens

Canonical type tokens for Ordella. Map to Tailwind via `apps/shared-ui/tailwind.preset.cjs` and semantic classes in app themes.

**Related:** [STEP_1 — Foundations](../STEP_1_FOUNDATIONS.md) · [OVERVIEW](../OVERVIEW.md) · [Brand visual identity](../../brand/VISUAL_IDENTITY.md)

---

## Font families

| Token | Value | Usage |
|-------|--------|--------|
| `font-family-primary` | `Inter, ui-sans-serif, system-ui, -apple-system, sans-serif` | All UI copy, headings, labels |
| `font-family-mono` | `JetBrains Mono, ui-monospace, SFMono-Regular, monospace` | SKUs, receipt IDs, API snippets, `code-*` |

**Rules**

- Do not load more than these two families per app shell.  
- `pos-ui` / `kds-ui`: primary only; mono optional for order numbers.  
- `marketing-ui` may use display weight on primary family only—no third display font without brand approval.

---

## Font sizes

Size tokens use **pixel values** at desktop default. Semantic aliases map to [STEP_1](../STEP_1_FOUNDATIONS.md) names.

| Token | px | Semantic alias | Typical use |
|-------|-----|----------------|-------------|
| `font-size-xs` | 12px | `caption` | Timestamps, badges, help text |
| `font-size-sm` | 14px | `body-sm` | Tables, dense admin-ui, secondary body |
| `font-size-md` | 16px | `body-md` | Default body, inputs, driver-ui mobile |
| `font-size-lg` | 18px | — | POS/KDS labels (+1 touch context) |
| `font-size-xl` | 20px | `heading-md` | Card titles, modal titles |
| `font-size-2xl` | 24px | `heading-lg` | PageHeader title, admin-ui page title |
| `font-size-3xl` | 36px | `heading-xl` | marketing-ui page titles |
| `font-size-display` | 48px | `display-lg` | marketing-ui hero only |

**Code size:** `font-size-code` = **13px** (`code-sm` in STEP_1).

---

## Line heights

| Token | Value | Pair with sizes |
|-------|--------|-----------------|
| `line-height-tight` | 1.1 | `font-size-display` |
| `line-height-snug` | 1.2 | `font-size-3xl` |
| `line-height-heading` | 1.3–1.4 | `font-size-2xl`, `font-size-xl` |
| `line-height-body` | 1.5 | `font-size-md`, `font-size-sm` |
| `line-height-caption` | 1.4 | `font-size-xs` |
| `line-height-code` | 1.45 | `font-size-code` |

**Computed examples (desktop)**

| Size token | Line height token | Result |
|------------|-------------------|--------|
| `font-size-2xl` | `line-height-heading` (1.3) | 24px / 31px |
| `font-size-md` | `line-height-body` (1.5) | 16px / 24px |
| `font-size-xs` | `line-height-caption` (1.4) | 12px / 17px |

---

## Font weights

| Token | Value | Use |
|-------|--------|-----|
| `font-weight-regular` | 400 | Body, inputs, table cells |
| `font-weight-medium` | 500 | Table headers, labels, emphasis |
| `font-weight-semibold` | 600 | Headings, buttons |
| `font-weight-bold` | 700 | marketing-ui hero emphasis only |

**Rule:** Headings use **`font-weight-semibold` (600)** unless marketing hero specifies bold.

---

## Responsive typography rules

### Mobile (≤ 480px)

| Element | Size token | Notes |
|---------|------------|--------|
| Page title | `font-size-xl` (20px) | Down from `2xl` on admin |
| Body | `font-size-md` | Unchanged |
| Table / dense lists | `font-size-sm` | Unchanged |
| marketing hero | `font-size-2xl` (24px) | Down from `display` |
| marketing display | `font-size-3xl` (36px) | Max on mobile |

### Tablet (481–768px)

| Element | Size token |
|---------|------------|
| Page title | `font-size-2xl` |
| marketing hero | `font-size-3xl` |

### Desktop (769–1440px)

| Element | Size token |
|---------|------------|
| Page title | `font-size-2xl` |
| marketing hero | `font-size-display` |

### POS / KDS (operational)

| Rule | Value |
|------|--------|
| Product / ticket title | `font-size-lg` minimum |
| Body in cart lines | `font-size-md` |
| Status badge | `font-size-xs` + medium weight |
| Tabular nums | Required on prices and qty |

**Rule:** Do not use `font-size-display` or `font-size-3xl` in `admin-ui`, `pos-ui`, or `kds-ui`.

---

## Usage examples (text only)

### Headings

| Context | Tokens |
|---------|--------|
| admin-ui “Inventory” page | `font-size-2xl` + `font-weight-semibold` + `line-height-heading` |
| Card title “Weekly sales” | `font-size-xl` + semibold |
| marketing-ui hero “The Retail Operating System” | `font-size-display` + semibold + `line-height-tight` |

### Body

| Context | Tokens |
|---------|--------|
| Form description | `font-size-sm` + `font-weight-regular` + `line-height-body` |
| storefront-ui product description | `font-size-md` + regular |
| pos-ui cart line item | `font-size-md` + tabular nums |

### Labels

| Context | Tokens |
|---------|--------|
| Form field label | `font-size-sm` + `font-weight-medium` |
| Table column header | `font-size-sm` + medium + neutral text color |

### Captions

| Context | Tokens |
|---------|--------|
| “Last updated 2 min ago” | `font-size-xs` + `line-height-caption` |
| Input help text | `font-size-xs` + regular |
| kds-ui ticket age “12m” | `font-size-xs` + medium + semantic color |

---

## Module quick reference

| Module | Default body | Page title |
|--------|--------------|------------|
| admin-ui | `font-size-sm` / `md` in forms | `font-size-2xl` |
| customer-ui / storefront-ui | `font-size-md` | `font-size-2xl` |
| marketing-ui | `font-size-md` | `font-size-3xl`–`display` |
| driver-ui | `font-size-md` | `font-size-xl` mobile |
| pos-ui / kds-ui | `font-size-md`–`lg` | `font-size-xl` |

Next: [SPACING_TOKENS.md](./SPACING_TOKENS.md) · Components: [STEP_2](../STEP_2_COMPONENTS.md)
