# Tabs

Section switcher within a single page context.

**Tokens:** [COLOR_TOKENS](../tokens/COLOR_TOKENS.md) · [TYPOGRAPHY_TOKENS](../tokens/TYPOGRAPHY_TOKENS.md) · [SPACING_TOKENS](../tokens/SPACING_TOKENS.md) · [ANIMATION_TOKENS](../tokens/ANIMATION_TOKENS.md)

**Related:** [LAYOUT_PRIMITIVES](./LAYOUT_PRIMITIVES.md) PageSection below panels

---

## Anatomy (horizontal)

```
[ Tab A ]  [ Tab B ]  [ Tab C ]     ← tablist
─────────────────────              ← indicator (primary-600)
│ Panel content for active tab   │
└────────────────────────────────┘
```

### Vertical

```
│ Tab A │  Panel content
│ Tab B │
│ Tab C │
```

---

## Props / variants

| Prop | Values | Description |
|------|--------|-------------|
| `orientation` | `horizontal` \| `vertical` | Layout |
| `variant` | `underline` \| `pill` | **One per app** — do not mix |
| `value` / `onChange` | string | Controlled active tab |
| `tabs` | `{ id, label, disabled?, panel }[]` | Data |

### Active / inactive states

| State | Underline variant | Pill variant |
|-------|-------------------|--------------|
| **inactive** | `neutral-600` text | `neutral-100` bg |
| **active** | `neutral-900` text + 2px `primary-600` bottom border | `neutral-0` bg + `shadow-sm` |
| **disabled** | `neutral-400`, no pointer | same |
| **hover** (inactive) | `neutral-900` text | `neutral-200` bg |

Panel padding top: `space-24` (horizontal) or panel left `space-24` (vertical).

---

## Responsive collapse

| Breakpoint | Behavior |
|------------|----------|
| desktop | All tabs visible in tablist |
| mobile ≤480px | **Option A:** scrollable tablist horizontal | **Option B:** replace with [Select](./SELECT.md) “Section” |
| admin-ui reports | Keep underline tabs; scroll tablist if >5 tabs |

**Rule:** Do not wrap tab labels to two lines—truncate with ellipsis + `title` tooltip.

---

## Keyboard navigation

| Key | Action |
|-----|--------|
| `ArrowLeft` / `Right` | Previous / next tab (horizontal) |
| `ArrowUp` / `Down` | Previous / next (vertical) |
| `Home` / `End` | First / last tab |
| `Enter` / `Space` | Activate tab |

`role="tablist"`, tabs `role="tab"`, panels `role="tabpanel"`.

---

## Usage guidelines

- **admin-ui:** catalog sections, report periods (Month / Quarter / Year).  
- **storefront-ui:** PDP Description / Nutrition.  
- **marketing-ui:** optional for pricing tiers—not for primary nav.  
- Do not use tabs for **navigation between routes**—use sidebar or links.  
- Max **7** tabs per list; merge or use nested PageSections if more.

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| One variant (underline) across admin-ui | Underline + pill on same app |
| Tab “Inventory” / “Transfers” | Tab “Click here” |
| Select dropdown for sections on mobile driver-ui | 8 squeezed tabs on 320px |
| `aria-selected` on active tab | Div buttons without roles |

---

## Examples (text)

| Context | Spec |
|---------|------|
| admin-ui product detail | horizontal underline: Details, Variants, History |
| storefront PDP | horizontal: Description, Reviews |
| admin-ui settings (vertical) | vertical tabs left, form right on desktop |
