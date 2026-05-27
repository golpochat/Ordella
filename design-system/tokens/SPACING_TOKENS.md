# Spacing Tokens

4px-base spacing scale for margin, padding, and gap. Prefer **8px vertical rhythm** between sections.

**Related:** [STEP_1 — Foundations](../STEP_1_FOUNDATIONS.md) · [STEP_3 — Layout](../STEP_3_LAYOUT_SYSTEM.md) · [IMPLEMENTATION_GUIDE](../IMPLEMENTATION_GUIDE.md)

---

## 4px base grid

Every spatial value must resolve to a token below (multiples of **2px** minimum; **4px** preferred for layout).

**Rule:** No raw values such as `13px`, `10px`, or `15px` in components.

---

## Spacing scale

Token name suffix = **pixel value**.

| Token | px | STEP_1 alias (legacy) | Typical use |
|-------|-----|------------------------|-------------|
| `space-2` | 2 | — | Icon optical adjust, error text gap |
| `space-4` | 4 | `space-1` | Label → input gap, chip padding y |
| `space-6` | 6 | — | Dense chip padding x |
| `space-8` | 8 | `space-2` | Inline groups, compact list rows |
| `space-12` | 12 | `space-3` | Input padding y, POS grid gutter min |
| `space-16` | 16 | `space-4` | Card padding, form field gap |
| `space-20` | 20 | `space-5` | Rare; prefer `space-16` or `space-24` |
| `space-24` | 24 | `space-6` | Section inner gap, modal padding, page gutter |
| `space-32` | 32 | `space-8` | Below PageHeader, block separation |
| `space-40` | 40 | `space-10` | Large component gaps |
| `space-48` | 48 | `space-12` | marketing-ui section gap |

**Extended (STEP_1 only):** `space-64` = 64px for marketing hero sections—use sparingly.

---

## Padding rules

| Surface | Padding token | Rule |
|---------|---------------|------|
| Card (admin) | `space-16` or `space-24` | Consistent within a page |
| Card (marketing) | `space-24`–`space-32` | More airy |
| Input (md) | `space-12` y, `space-16` x | Height 40px total |
| Input (pos lg) | `space-16` y, `space-20` x | Height 48px |
| Modal body | `space-24` | All sides |
| Button sm/md/lg | See [STEP_2](../STEP_2_COMPONENTS.md) | Horizontal padding only via component |

**Rule:** Symmetric padding unless design specifies otherwise; document asymmetry in PR.

---

## Margin rules

| Relationship | Margin token |
|--------------|--------------|
| PageHeader → first block | `margin-bottom: space-32` |
| PageSection → PageSection | `margin-bottom: space-32` |
| Card → Card (stack) | `space-24` gap (prefer gap over margin) |
| Form field → form field | `space-16` |
| Label → control | `space-8` (margin or gap) |
| Control → error text | `space-4` |

**Rule:** Prefer **flex/grid `gap`** over chained margins to avoid collapse bugs.

---

## Vertical rhythm rules

| Rhythm level | Token | px |
|--------------|-------|-----|
| Tight (in-component) | `space-4`–`space-8` | 4–8 |
| Component internal | `space-16` | 16 |
| Section internal | `space-24` | 24 |
| Section external | `space-32` | 32 |
| Page / marketing section | `space-48`–`space-64` | 48–64 |

**admin-ui example:** Filters row uses `gap: space-16`; table sits `space-32` below PageHeader.

**pos-ui example:** Product grid `gap: space-12`; cart panel internal lines `gap: space-8`.

---

## Responsive spacing adjustments

### Mobile (≤ 480px)

| Rule | Adjustment |
|------|------------|
| Page horizontal padding | `space-16` (down from `space-24` desktop) |
| Section gap | Keep `space-32`; may reduce hero to `space-48` |
| Card padding | `space-16` minimum |

### Tablet (481–768px)

| Rule | Adjustment |
|------|------------|
| Page gutter | `space-24` |
| Grid gutter | `space-16` |

### Desktop (769px+)

| Rule | Adjustment |
|------|------------|
| admin-ui content | `space-24` page padding |
| marketing sections | `space-48` between major blocks |

### POS / KDS

| Rule | Value |
|------|--------|
| Touch row height | ≥ 44px; use `space-12`+ internal padding |
| Grid gutter | `space-12` minimum, `space-16` preferred |
| Safe area | Respect device insets; add `space-16` to fixed footers |

---

## Examples (text only)

| Do | Don’t |
|----|--------|
| `gap: space-16` on form Stack | `gap: 15px` |
| PageHeader margin-bottom `space-32` | `margin-bottom: 30px` |
| driver-ui list `space-12` between cards | Mixed 10px / 14px gaps |
| marketing section `space-48` | Random `space-40` between every block |

**8px grid check:** `space-8`, `space-16`, `space-24`, `space-32`, `space-48` are valid rhythm steps—see [STEP_5](../STEP_5_VISUAL_QA_RULES.md).

Next: [COLOR_TOKENS.md](./COLOR_TOKENS.md)
