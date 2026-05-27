# Shadow Tokens

Elevation via box-shadow. Operational UIs (`pos-ui`, `kds-ui`) prefer borders over shadow.

**Related:** [STEP_1 — Foundations](../STEP_1_FOUNDATIONS.md) · [STEP_2 — Components](../STEP_2_COMPONENTS.md) · [COLOR_TOKENS](./COLOR_TOKENS.md)

**Shadow color base:** `rgb(15 26 42 / …)` (`neutral-900` channel).

---

## Elevation levels

| Token | Value | Elevation role |
|-------|--------|----------------|
| `shadow-none` | `none` | Flat tables, kds-ui fullscreen, inline rows |
| `shadow-sm` | `0 1px 2px rgb(15 26 42 / 0.04)` | Cards, subtle lift |
| `shadow-md` | `0 4px 12px rgb(15 26 42 / 0.08)` | Dropdowns, popovers, sticky bars |
| `shadow-lg` | `0 8px 24px rgb(15 26 42 / 0.10)` | Modals, dialogs |
| `shadow-brand` | `0 4px 20px rgb(15 118 110 / 0.18)` | marketing-ui CTA cards only (`primary-600` tint) |

---

## Usage by surface

### Cards

| Context | Token | Rule |
|---------|-------|------|
| admin-ui dashboard card | `shadow-sm` **or** border only | Pick one motif per page |
| admin-ui nested card | `shadow-none` + `border-default` | No double elevation |
| marketing-ui feature card | `shadow-sm` or `shadow-brand` | One level only |
| pos-ui product tile | `shadow-none` | Use `border-default` |
| kds-ui ticket | `shadow-none` | Border + semantic bg |

### Dropdowns

| Element | Token |
|---------|-------|
| Select menu, autocomplete | `shadow-md` |
| Context menu | `shadow-md` |
| Admin table column filter popover | `shadow-md` |

**Rule:** Dropdown z-index uses [Z_INDEX_TOKENS](./Z_INDEX_TOKENS.md); shadow does not replace stacking context.

### Modals

| Element | Token |
|---------|-------|
| Dialog panel | `shadow-lg` |
| Drawer (admin-ui) | `shadow-md` on panel edge |
| POS full-screen sheet | `shadow-none` on panel; scrim only |

**Rule:** Do not apply `shadow-lg` to modal **and** inner card—inner stays `shadow-none` or border.

---

## Module rules

| Module | Max shadow |
|--------|------------|
| admin-ui | `shadow-lg` on modals only |
| marketing-ui | `shadow-brand` allowed on hero CTAs |
| pos-ui / kds-ui | `shadow-md` max; prefer none |
| driver-ui | `shadow-sm` on cards; toasts `shadow-md` |
| storefront-ui | `shadow-sm` on product cards |

---

## Examples (text only)

| Do | Don’t |
|----|--------|
| Modal: `shadow-lg` + scrim `surface-overlay` | Modal with `shadow-lg` + card inside also `shadow-lg` |
| admin-ui card: border OR `shadow-sm` | Both heavy border and `shadow-md` |
| kds-ui tickets: border only | `shadow-md` on every ticket (glare) |
| marketing pricing card: `shadow-brand` | `shadow-brand` on admin-ui settings |

Next: [BREAKPOINT_TOKENS.md](./BREAKPOINT_TOKENS.md)
