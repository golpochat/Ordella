# Color Tokens

Palette and semantic colors for all Ordella UIs. Canonical product primary: **`#0F766E`**. Marketing may temporarily use **`#3A6DFF`** until migration.

**Related:** [STEP_1 — Foundations](../STEP_1_FOUNDATIONS.md) · [Brand visual identity](../../brand/VISUAL_IDENTITY.md) · `apps/shared-ui/tailwind.preset.cjs`

---

## Primary palette

| Token | Hex | HSL (reference) | Usage |
|-------|-----|-----------------|--------|
| `primary-50` | `#F0FDFA` | 166 76% 97% | Tint backgrounds, selected row subtle |
| `primary-100` | `#CCFBF1` | 168 76% 89% | Hover backgrounds |
| `primary-600` | `#0F766E` | 174 77% 26% | **Default** buttons, links, focus ring |
| `primary-700` | `#0D9488` | 175 84% 32% | Primary hover |
| `primary-800` | `#115E59` | 176 61% 22% | Primary pressed / active |

**Tailwind mapping:** `--primary` → HSL of `primary-600`; `--primary-foreground` → `#FFFFFF`.

---

## Secondary palette

| Token | Hex | Usage |
|-------|-----|--------|
| `secondary-50` | `#F4F6F8` | Secondary button background |
| `secondary-100` | `#E8ECF0` | Secondary hover |
| `secondary-600` | `#475569` | Secondary emphasis text |
| `accent-500` | `#F59E0B` | Charts, highlights, badges |
| `accent-600` | `#D97706` | Accent hover |

**marketing-ui interim primary:** `#3A6DFF` — map to `primary-600` in migration PR; do not introduce new blues.

---

## Neutral palette

| Token | Hex | Usage |
|-------|-----|--------|
| `neutral-0` | `#FFFFFF` | Cards, modals, inputs on light |
| `neutral-50` | `#F4F6F8` | Page canvas (admin, app shells) |
| `neutral-100` | `#EEF1F4` | Zebra rows, subtle hover |
| `neutral-200` | `#E5E7EB` | Default borders |
| `neutral-400` | `#9CA3AF` | Placeholders, disabled text |
| `neutral-600` | `#6B7280` | Secondary text, captions |
| `neutral-900` | `#0F1A2A` | Primary text, headings |

---

## Semantic colors

| Role | Token (fg) | Hex | Token (bg) | Hex |
|------|------------|-----|------------|-----|
| **success** | `success-500` | `#2ECC71` | `success-50` | `#ECFDF5` |
| **warning** | `warning-500` | `#FFB020` | `warning-50` | `#FFFBEB` |
| **error** | `error-500` | `#FF6B6B` | `error-50` | `#FEF2F2` |
| **info** | `info-500` | `#3B82F6` | `info-50` | `#EFF6FF` |

**Rules**

- Status must include **text or icon**, not color alone (`kds-ui`, `driver-ui`).  
- Destructive actions use `error-500` / `destructive` theme slot—not `warning-500`.  
- Contrast: text on `neutral-0` ≥ **4.5:1** (WCAG AA).

---

## Background + surface colors

| Token | Hex / source | Usage |
|-------|--------------|--------|
| `background-default` | `neutral-50` | App page background |
| `background-elevated` | `neutral-0` | Cards, panels |
| `surface-default` | `neutral-0` | Maps to `--surface` in preset |
| `surface-muted` | `neutral-100` | Inset panels, sidebars |
| `surface-overlay` | `neutral-900` @ 40% opacity | Modal scrim |

**Module notes**

| Module | Background |
|--------|------------|
| admin-ui | `background-default` content area; sidebar `surface-muted` |
| pos-ui / kds-ui | `neutral-0` or `neutral-50`; high contrast |
| marketing-ui | `neutral-0` with section bands `neutral-50` |

---

## Border + divider colors

| Token | Value | Usage |
|-------|--------|--------|
| `border-default` | 1px solid `neutral-200` | Cards, inputs, table rows |
| `border-strong` | 1px solid `neutral-400` | Emphasized dividers |
| `border-focus` | 2px solid `primary-600` | Focus ring (with offset) |
| `border-error` | 1px solid `error-500` | Invalid inputs |
| `divider-subtle` | `neutral-100` fill or 1px `neutral-200` | Section separators |

**Preset mapping:** `--border` → HSL of `neutral-200`; `--input` → same or `neutral-200`.

---

## Dark mode placeholders

> Implement when `darkMode: class` is enabled globally. Values are **targets**—verify contrast before ship.

| Token | Light | Dark (placeholder) |
|-------|-------|---------------------|
| `background-default` | `neutral-50` | `#0B1220` |
| `background-elevated` | `neutral-0` | `#111827` |
| `foreground-primary` | `neutral-900` | `#F9FAFB` |
| `foreground-muted` | `neutral-600` | `#9CA3AF` |
| `border-default` | `neutral-200` | `#374151` |
| `primary-600` | `#0F766E` | `#14B8A6` (lighter for contrast) |
| `surface-overlay` | `neutral-900` @ 40% | `#000000` @ 60% |

**Rules**

- Use CSS variables only—no hard-coded light hex in dark-scoped components.  
- `pos-ui` / `kds-ui`: dark mode optional; optimize for bright kitchen / store lighting first.

---

## Examples (text only)

| Context | Tokens |
|---------|--------|
| admin-ui primary button | bg `primary-600`, text white, hover `primary-700` |
| Low stock row | text `warning-500`, badge bg `warning-50` |
| Invalid email field | border `border-error`, message `error-500` |
| kds-ui overdue ticket | bg `error-50`, border `error-500`, label “OVERDUE” |

Next: [RADIUS_TOKENS.md](./RADIUS_TOKENS.md) · QA: [STEP_5](../STEP_5_VISUAL_QA_RULES.md)
