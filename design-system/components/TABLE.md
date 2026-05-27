# Table

Tabular data display for admin and operational lists.

**Tokens:** [TYPOGRAPHY_TOKENS](../tokens/TYPOGRAPHY_TOKENS.md) · [COLOR_TOKENS](../tokens/COLOR_TOKENS.md) · [SPACING_TOKENS](../tokens/SPACING_TOKENS.md) · [Z_INDEX_TOKENS](../tokens/Z_INDEX_TOKENS.md)

**Related:** [CARD](./CARD.md) wrapping · [BUTTON](./BUTTON.md) row actions

---

## Anatomy

```
┌──────────────────────────────────────────────────────────┐
│ TH │ TH │ TH │ TH                    ← thead (sticky opt) │
├──────────────────────────────────────────────────────────┤
│ TD │ TD │ TD │ TD                    ← tbody rows         │
│ TD │ TD │ TD │ TD                                         │
└──────────────────────────────────────────────────────────┘
[ Pagination bar — optional placeholder ]
```

| Region | Element | Tokens |
|--------|---------|--------|
| Header cell | `<th>` | `font-size-sm`, `font-weight-medium`, `neutral-600` |
| Body cell | `<td>` | `font-size-sm`, `neutral-900` |
| Row | `<tr>` | min-height 40px; border-bottom `border-default` |
| Numeric column | `<td align="right">` | `tabular-nums` |

---

## Props / variants

| Prop | Values | Description |
|------|--------|-------------|
| `zebra` | boolean | Even rows `neutral-50` bg |
| `stickyHeader` | boolean | `z-sticky` when rows > 20 |
| `density` | `comfortable` \| `compact` | Row min 40px vs 36px (admin only) |
| `emptyState` | React node | Message + primary CTA |
| `loading` | boolean | Skeleton rows or spinner overlay |

### Sorting (placeholder)

| Prop | Behavior |
|------|----------|
| `sortable` | Click header toggles asc/desc; icon ▲/▼ |
| `sortColumn` / `sortDirection` | Controlled state |
| Default | Unsorted; first click = asc |

### Filtering (placeholder)

| Pattern | Rule |
|---------|------|
| External filters | Flex row above table in [PageSection](./LAYOUT_PRIMITIVES.md) |
| Column filter | Icon in header → popover `z-dropdown` |

### Pagination (placeholder)

| Prop | Default |
|------|---------|
| `pageSize` | 25 (admin), 50 optional |
| `pageSizeOptions` | [25, 50, 100] |
| Footer | “Showing 1–25 of 240” + prev/next |

---

## Row / header styles

| Style | Rule |
|-------|------|
| Header | Bottom border `border-default`; no vertical grid lines |
| Row hover | `neutral-100` bg (admin) |
| Selected row | `primary-50` bg + `aria-selected` |
| Actions column | Icon [Button](./BUTTON.md) `ghost` `iconOnly`; width ≤ 48px per action |

---

## Responsive patterns

| Pattern | When | Behavior |
|---------|------|----------|
| **Scrollable** | Default admin desktop | `overflow-x: auto` on wrapper; min-width on table |
| **Stacked card** | mobile ≤480px optional | Each row → [Card](./CARD.md) with label:value pairs |
| **Hide columns** | tablet | `priority` prop on columns; low priority hidden |

**admin-ui:** Prefer scrollable over stacked for dense inventory.  
**driver-ui:** Use Card list pattern—not Table—for tasks.

---

## Usage guidelines

- Use semantic `<table>`, `<thead>`, `<tbody>`.  
- Column headers are **sentence case**.  
- Right-align money, qty, dates (numeric).  
- Empty state required: “No products yet” + primary “Add product”.  
- **kds-ui / pos-ui:** use Card grid for tickets/products—not this Table spec.

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| Sticky header on 100+ SKU list | Header scrolls away on long lists |
| Zebra on wide financial tables | Zebra + row hover same color |
| Ghost icon edit/delete in actions | Full-width “Actions” text link column |
| Empty state with CTA | Blank tbody |

---

## Examples (text)

| Context | Spec |
|---------|------|
| admin-ui inventory | sortable Name, numeric On hand, actions icons |
| admin-ui reports | zebra off; pagination 50 rows |
| mobile admin (future) | stacked Card per row with same data |
