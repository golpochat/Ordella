# Badge

Compact status label for counts, states, and metadata.

**Tokens:** [COLOR_TOKENS](../tokens/COLOR_TOKENS.md) · [TYPOGRAPHY_TOKENS](../tokens/TYPOGRAPHY_TOKENS.md) · [RADIUS_TOKENS](../tokens/RADIUS_TOKENS.md) · [SPACING_TOKENS](../tokens/SPACING_TOKENS.md)

**Related:** Chip (removable) in [STEP_2](../STEP_2_COMPONENTS.md)—extends Badge with × action

---

## Anatomy

```
┌──────────────┐
│  Label text  │   ← inline-flex, radius-full or radius-sm
└──────────────┘
```

| Part | Rule |
|------|------|
| Padding | `space-4` y, `space-8` x (sm); `space-6` y, `space-12` x (md) |
| Font | `font-size-xs`, `font-weight-medium` |
| Radius | `radius-full` (pill) default; `radius-sm` for rectangular count badges |

---

## Props / variants

| Prop `variant` | Background | Text |
|----------------|------------|------|
| `neutral` | `neutral-100` | `neutral-900` |
| `success` | `success-50` | `success-500` (darken for AA if needed) |
| `warning` | `warning-50` | `warning-500` |
| `error` | `error-50` | `error-500` |
| `info` | `info-50` | `info-500` |

| Prop `size` | Height approx | Use |
|-------------|---------------|-----|
| `sm` | 20px | Table cells, dense admin |
| `md` | 24px | Card headers, driver-ui list |

Optional `dot` prop: 8px circle before label for live status.

---

## Usage guidelines

- Always include **text** (“Overdue”, “3”)—not color dot alone ([kds-ui](../STEP_5_VISUAL_QA_RULES.md)).  
- **admin-ui:** stock status, role labels.  
- **driver-ui:** “In progress”, “Completed”.  
- **kds-ui:** ticket age “12m” → `warning` / `error` by SLA threshold.  
- **storefront-ui:** “Sale”, “New” on product cards.  
- Max ~20 characters; truncate with ellipsis.

---

## Responsive behavior

Badges do not change size across breakpoints; increase to `md` on touch-only POS labels if needed.

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| Badge “Low stock” warning on row | Yellow row only |
| neutral “Draft” on unpublished product | Primary button styled as badge |
| kds-ui “OVERDUE” error + red tint card | 8px red dot only |
| sm in table Status column | md badge crammed in 32px row |

---

## Examples (text)

| Context | Spec |
|---------|------|
| admin-ui inventory | success “In stock”, warning “Low”, error “Out” |
| customer-ui orders | neutral “Shipped”, info “Processing” |
| kds-ui ticket | warning “8m”, error “OVERDUE” |
| storefront-ui | error variant “-20%” sale tag (ensure text contrast) |
