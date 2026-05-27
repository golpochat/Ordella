# Card

Grouped content surface with optional header, body, and footer.

**Tokens:** [SPACING_TOKENS](../tokens/SPACING_TOKENS.md) · [RADIUS_TOKENS](../tokens/RADIUS_TOKENS.md) · [SHADOW_TOKENS](../tokens/SHADOW_TOKENS.md) · [COLOR_TOKENS](../tokens/COLOR_TOKENS.md)

**Related:** [LAYOUT_PRIMITIVES](./LAYOUT_PRIMITIVES.md) · [TABLE](./TABLE.md)

---

## Anatomy

```
┌─────────────────────────────────────────┐
│ HEADER (optional)                        │
│   Title — heading-md                     │
│   Description — body-sm, neutral-600     │
├─────────────────────────────────────────┤
│ BODY                                     │
│   slot content                           │
├─────────────────────────────────────────┤
│ FOOTER (optional)                        │
│   actions aligned end                    │
└─────────────────────────────────────────┘
```

---

## Props / variants

| Prop | Values | Description |
|------|--------|-------------|
| `padding` | `dense` \| `default` \| `loose` | `space-16` / `space-24` / `space-32` |
| `elevation` | `none` \| `border` \| `shadow` | See below |
| `interactive` | boolean | Hover border or shadow; entire card clickable |
| `media` | slot top | Image 16:9 for storefront product tile |

### Elevation levels

| Prop `elevation` | Visual | Module |
|------------------|--------|--------|
| `none` | bg only | nested inside another card |
| `border` | `border-default`, `shadow-none` | admin-ui default |
| `shadow` | `shadow-sm`, optional light border | marketing-ui, storefront |

**Rule:** Do not combine heavy `shadow-md` + thick border on same card.

### Header / body / footer structure

| Section | Padding | Border |
|---------|---------|--------|
| Header | top/sides = card padding; bottom `space-16` | optional `border-default` bottom |
| Body | inherits card padding | — |
| Footer | `space-16` top; actions `Flex` gap `space-8` | optional top border |

Footer actions: secondary left, primary right ([BUTTON](./BUTTON.md)).

---

## Padding rules

| Context | `padding` |
|---------|-----------|
| admin-ui KPI / settings | `default` (`space-24`) |
| admin-ui dense widget | `dense` (`space-16`) |
| marketing-ui feature block | `loose` |
| storefront product tile | `dense` body; media flush top |

---

## Responsive behavior

| Breakpoint | Rule |
|------------|------|
| mobile | Cards in [Grid](./LAYOUT_PRIMITIVES.md) 1 col; full width |
| tablet | 2-col product grid |
| desktop | 3–4 col storefront; admin dashboard 4× KPI |

Interactive card: min tap target 44px on mobile storefront.

---

## Usage guidelines

- One primary idea per card.  
- **admin-ui:** wrap forms and chart widgets.  
- **storefront-ui:** product tile = Card + media + title + price + Badge.  
- **kds-ui:** ticket = Card + semantic border tint (not shadow).  
- Do not nest more than **one** card level without `elevation="none"` on inner.

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| Header “Weekly sales” + body chart | Title inside body without header slot |
| Footer “View report” ghost | Three primaries in footer |
| kds-ui ticket border `warning-500` | Heavy shadow on kitchen display |
| Product card image `radius-md` top | Square image with mismatched card radius |

---

## Examples (text)

| Context | Spec |
|---------|------|
| admin-ui dashboard | 4 KPI cards `elevation="border"`, `padding="default"` |
| storefront-ui PLP | `media` + title `heading-sm` + price tabular |
| customer-ui order row | interactive card, status Badge in header |
| marketing-ui feature | `elevation="shadow"`, `padding="loose"` |
