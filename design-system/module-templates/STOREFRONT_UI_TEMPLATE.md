# storefront-ui Module Template

Public commerce: browse, PDP, cart, checkout.

**Repo:** `apps/storefront`

**Related:** [layout/CONTAINERS](../layout/CONTAINERS.md) · [layout/GRID_SYSTEM](../layout/GRID_SYSTEM.md) · [STOREFRONT in layout rules](../layout/MODULE_LAYOUT_RULES.md#storefront-ui)

---

## Global shell

```
┌─────────────────────────────────────────────┐
│ SITE HEADER (sticky) — logo, nav, cart icon  │
├─────────────────────────────────────────────┤
│ CONTAINER-LG (1280px max, paddingX token)   │
│   page content                               │
├─────────────────────────────────────────────┤
│ FOOTER                                       │
└─────────────────────────────────────────────┘
```

**Tokens:** `container-lg`; padding `space-16` mobile / `space-24` desktop.

---

## Product listing layout (PLP)

```
Category title — font-size-2xl
Flex: [Filter btn mobile] [Sort Select] [result count]
┌──────────┬──────────────────────────────────┐
│ FILTERS  │ PRODUCT GRID                      │  desktop
│ 240px    │  auto-fill min 160px, 2–4 cols   │
│ sidebar  │                                   │
└──────────┴──────────────────────────────────┘
Pagination or infinite scroll
```

| Breakpoint | Grid | Filters |
|------------|------|---------|
| mobile ≤480 | 2 columns | drawer full-screen |
| tablet | 3 columns | drawer |
| desktop | 4 columns | sidebar 240px |

**Gutter:** `space-12` mobile, `space-16` tablet+ ([SPACING_TOKENS](../tokens/SPACING_TOKENS.md)).

**Components:** [Card](../components/CARD.md) product tile; [Select](../components/SELECT.md) sort; [Badge](../components/BADGE.md) “Sale”.

---

## Product detail layout (PDP)

```
desktop (12-col inside container-lg):
┌─────────────────┬─────────────────┐
│ GALLERY 50%     │ INFO 50%         │
│  images         │  title heading-lg│
│                 │  price tabular   │
│                 │  variant Select  │
│                 │  primary Add cart│
└─────────────────┴─────────────────┘
Tabs: Description | Reviews | Nutrition
```

| mobile | stack gallery above info |
| Alignment | Left text; price prominent |
| CTA | [Button](../components/BUTTON.md) primary full width mobile sticky optional |

**Spacing:** Section `space-32` below gallery block.

---

## Cart drawer layout

Triggered from header cart icon—not full page by default.

```
┌─────────────────────────┐
│ HEADER "Cart (3)"  [×]  │
├─────────────────────────┤
│ LINE ITEMS scroll        │
│  image | name | qty | $  │
├─────────────────────────┤
│ SUMMARY subtotal/tax/total│
├─────────────────────────┤
│ [Checkout] primary full   │
└─────────────────────────┘
```

| Property | Value |
|----------|--------|
| Width | 400px desktop drawer; 100% mobile sheet |
| Z-index | `z-drawer` |
| Line gap | `space-16` |

---

## Checkout layout

```
Step indicator (1 Shipping — 2 Payment — 3 Review)
Stack / 2-col desktop:
  LEFT (span-7): forms per step
  RIGHT (span-5): summary Card sticky
mobile: summary accordion below step OR sticky bottom bar total + Pay
```

| Step | Content |
|------|---------|
| Shipping | [FORM_LAYOUT](../components/FORM_LAYOUT.md); address fields |
| Payment | hosted fields placeholder + [Input](../components/INPUT.md) billing |
| Review | line list + totals + primary Place order |

**Spacing:** Step sections `space-32`; fields `space-16`.

---

## Responsive rules

| Element | mobile | tablet | desktop |
|---------|--------|--------|---------|
| Container | 100% | 100% max 720 | max 1280 |
| PLP grid | 2 col | 3 col | 4 col + sidebar |
| PDP | stack | stack or 50/50 | 50/50 |
| Checkout CTA | sticky bottom | inline | summary sticky |

**Typography:** Hero category titles `font-size-2xl`; body `font-size-md`.

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| Filter drawer on mobile | 240px sidebar crushed on 320px |
| Sticky checkout bar on mobile | Hidden total below fold |
| Add to cart primary on PDP | Ghost-only add |
| Cart drawer + checkout page | Duplicate full cart page without reason |

---

## Components summary

[Button](../components/BUTTON.md) · [Card](../components/CARD.md) · [Input](../components/INPUT.md) · [Select](../components/SELECT.md) · [Tabs](../components/TABS.md) PDP · [Badge](../components/BADGE.md) · [Modal](../components/MODAL.md) size confirm
