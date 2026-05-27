# Radius Tokens

Border radius scale for surfaces and controls.

**Related:** [STEP_1 — Foundations](../STEP_1_FOUNDATIONS.md) · [STEP_2 — Components](../STEP_2_COMPONENTS.md) · `apps/shared-ui/tailwind.preset.cjs` (`--radius`)

---

## Border radius scale

| Token | px | CSS variable (target) |
|-------|-----|------------------------|
| `radius-sm` | 6px | `calc(var(--radius) - 4px)` in preset |
| `radius-md` | 12px | `calc(var(--radius) - 2px)` |
| `radius-lg` | 16px | `var(--radius)` base |
| `radius-full` | 9999px | Pills, avatars, circular chips |

**Base variable:** `--radius: 12px` (maps `radius-md` as default component radius).

---

## Usage rules by component

### Cards

| Module | Token | Rule |
|--------|-------|------|
| admin-ui | `radius-md` | All dashboard and settings cards |
| storefront-ui | `radius-md` | Product tiles |
| marketing-ui | `radius-lg` | Feature cards, screenshot frames |
| kds-ui | `radius-md` | Ticket cards; no `radius-lg` on nested items |

**Rule:** One radius per card—do not mix `sm` on outer and `lg` on inner without inset pattern.

### Buttons

| Variant / size | Token |
|----------------|-------|
| sm / md default | `radius-sm` |
| lg (pos-ui) | `radius-sm` or `radius-md` | Pick one per app and stay consistent |
| Icon-only | `radius-sm` or `radius-full` for circular |

### Inputs

| Type | Token |
|------|-------|
| text, number, select, textarea | `radius-sm` |
| pos-ui large touch fields | `radius-sm` minimum |

### Modals / drawers

| Surface | Token |
|---------|-------|
| Modal panel | `radius-md` (top corners if bottom sheet: `radius-lg` top only) |
| Drawer panel | `radius-md` on inner edge (optional) |
| Full-screen POS sheet | `radius-lg` top corners only |

---

## Module-specific rules

| Module | Rule |
|--------|------|
| **pos-ui** | Tiles `radius-md`; keys `radius-sm`; no `radius-full` on rectangular pay buttons |
| **kds-ui** | Ticket `radius-md`; status chips `radius-full` |
| **admin-ui** | Tables stay square (`radius-none` on table wrapper); cards `radius-md` |
| **marketing-ui** | Hero media `radius-lg`; buttons `radius-sm`–`md` |

---

## Examples (text only)

| Do | Don’t |
|----|--------|
| Inventory KPI card: `radius-md` 12px | Card with 10px custom radius |
| Avatar 40×40: `radius-full` | Square avatar with `radius-sm` |
| POS product tile: `radius-md` | Mix 8px and 12px tiles on same grid |
| Modal: `radius-md` on panel | `radius-lg` on modal + `radius-lg` on nested card |

Next: [SHADOW_TOKENS.md](./SHADOW_TOKENS.md)
