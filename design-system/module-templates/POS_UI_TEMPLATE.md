# pos-ui Module Template

Fixed register layout for lane and counter—no responsive collapse of split panes.

**Repo:** `apps/pos-ui`

**Related:** [layout/SplitLayout](../layout/LAYOUT_PRIMITIVES.md#splitlayout-pos-ui) · [layout/BREAKPOINTS](../layout/BREAKPOINTS.md) · [components/BUTTON](../components/BUTTON.md) · [components/MODAL](../components/MODAL.md)

---

## App shell (text diagram)

```
┌─────────────────────────────────────────────────────────────┐
│ TOPBAR 56px — location | cashier | clock        [actions]  │
├───────────────────────────────┬─────────────────────────────┤
│ MAIN (~62%) scroll            │ CART (~38%, min 360px)      │
│  categories + search          │  header                     │
│  product grid                 │  line items (scroll)        │
│                               │  totals                     │
├───────────────────────────────┴─────────────────────────────┤
│ FOOTER ACTIONS 64–72px — Hold | Discount | Pay (primary)    │
└─────────────────────────────────────────────────────────────┘
```

**Rule:** `document` body does **not** scroll; only main product grid and cart lines scroll.

---

## Fixed layout grid

| Region | Width @ 1024px | Width @ 1280px |
|--------|----------------|----------------|
| Main | ~632px (62%) | ~800px (62%) |
| Cart | min 360px, max 420px | min 360px, max 440px |
| Footer | 100% span | 100% |

**Alignment:** Main left; cart right; footer buttons `Flex justify="between"` or end-aligned group.

---

## Product grid

| Property | 1024×768 | 1280×800 |
|----------|----------|----------|
| Layout | CSS auto-fill grid | same |
| Min tile width | 120px | 128px |
| Columns (approx) | 5–6 | 6–7 |
| Gutter | `space-12` | `space-12` |
| Tile | [Card](../components/CARD.md): image, title `font-size-sm`, price tabular |

### Touch targets

| Element | Size |
|---------|------|
| Product tile | min 96×96px tap area |
| Category chips | height 40px min |
| Search | [Input](../components/INPUT.md) `lg` in top of main |

---

## Cart panel layout

```
┌─────────────────────────┐
│ CART HEADER — order # / customer │
├─────────────────────────┤
│ LINE ITEMS (scroll)      │
│  thumb | name | qty | $  │  ← 56px min row height
│  ...                     │
├─────────────────────────┤
│ TOTALS — subtotal, tax, total    │  tabular-nums
├─────────────────────────┤
│ (footer actions on shell)        │
└─────────────────────────┘
```

| Zone | Spacing |
|------|---------|
| Header padding | `space-16` |
| Line gap | `space-8` |
| Totals padding | `space-16`; total row `font-weight-semibold` |

**Components:** [Button](../components/BUTTON.md) ghost for qty +/-; destructive remove via confirm [Modal](../components/MODAL.md).

---

## Payment screen layout

Full-screen [Modal](../components/MODAL.md) sheet (not `sm` dialog).

```
┌─────────────────────────────────────────┐
│ HEADER — "Payment" + close               │
├──────────────────┬──────────────────────┤
│ SUMMARY (40%)    │ KEYPAD / METHODS (60%) │
│  amount due      │  [Card][Cash][Split]   │
│  line summary    │  numpad 3×4 grid      │
│                  │  [Pay] primary lg      │
└──────────────────┴──────────────────────┘
```

| Element | Rule |
|---------|------|
| Keypad keys | 48×48px; gap `space-8` |
| Pay button | primary `lg` full width of method column |
| Methods | secondary toggles; one active state |

---

## Receipt preview layout

```
Modal md or sheet footer step
  Stack gap space-16
    receipt preview (mono font, font-size-sm)
    Flex: [Print] secondary | [Email] ghost | [Done] primary
```

**Alignment:** Receipt content left-aligned; max-width 320px centered in sheet.

---

## Offline mode layout

```
┌─────────────────────────────────────────┐
│ TOPBAR + [Alert](../components/ALERT.md) warning full width │
│ "Offline — sales will sync when connected"                  │
├───────────────────────────────┬─────────┤
│ (same split), banner persists │         │
└───────────────────────────────┴─────────┘
```

| Rule | Value |
|------|--------|
| Banner | `warning` variant; not dismissible |
| Pay button | disabled or cash-only per product rules |
| Sync indicator | topbar ghost icon + caption |

---

## Terminal resolution rules

| Viewport | Priority | QA required |
|----------|----------|-------------|
| **1024 × 768** landscape | **Primary** | Yes — every release |
| **1280 × 800** | Supported | Yes — grid column check |
| 768 × 1024 portrait | Secondary | Smoke test only |

**Spacing:** Do not reduce below `space-12` gutters at either resolution.

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| Split layout at 1024×768 | admin-ui sidebar |
| Pay `lg` in footer | 32px Pay |
| Full-screen payment sheet | 400px payment modal |
| Offline warning Alert in topbar | Silent offline with failing pay |

---

## Components summary

[Button](../components/BUTTON.md) `lg` · [Input](../components/INPUT.md) `lg` · [Card](../components/CARD.md) tiles · [Modal](../components/MODAL.md) sheet · [Badge](../components/BADGE.md) order tags · [Toast](../components/TOAST.md) sync messages
