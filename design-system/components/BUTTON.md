# Button

Primary interactive control for actions. One **primary** per action cluster.

**Tokens:** [COLOR_TOKENS](../tokens/COLOR_TOKENS.md) · [TYPOGRAPHY_TOKENS](../tokens/TYPOGRAPHY_TOKENS.md) · [SPACING_TOKENS](../tokens/SPACING_TOKENS.md) · [RADIUS_TOKENS](../tokens/RADIUS_TOKENS.md) · [ANIMATION_TOKENS](../tokens/ANIMATION_TOKENS.md)

**Related:** [STEP_2](../STEP_2_COMPONENTS.md) · [MODAL](./MODAL.md) footer patterns

---

## Anatomy

```
[ optional icon ]  Label text  [ optional icon ]
└─ inline-flex, gap space-8, radius-sm, font body-sm/md ─┘
```

| Part | Token / rule |
|------|----------------|
| Container | `inline-flex`, `align-items: center`, `justify-content: center` |
| Gap (icon ↔ label) | `space-8` |
| Radius | `radius-sm` |
| Font | `font-size-sm` (sm/md), `font-size-md` (lg) |
| Weight | `font-weight-semibold` |

---

## Props / variants / states

### Variants

| Prop `variant` | Background | Text | Border |
|----------------|------------|------|--------|
| `primary` | `primary-600` | white | none |
| `secondary` | `neutral-50` | `neutral-900` | `border-default` |
| `ghost` | transparent | `primary-600` | none |
| `destructive` | `error-500` | white | none |

### Sizes

| Prop `size` | Height | Padding x | Min width |
|-------------|--------|-----------|-----------|
| `sm` | 32px | `space-12` | auto |
| `md` | 40px | `space-16` | auto |
| `lg` | 48px | `space-20` | auto ( **pos-ui** default ) |

### States

| State | Visual | Behavior |
|-------|--------|----------|
| **default** | Variant colors | Pointer cursor |
| **hover** | Primary → `primary-700`; secondary → `neutral-100` bg | `duration-fast` |
| **active** | Primary → `primary-800` | Pressed |
| **disabled** | 50% opacity, `neutral-400` text on secondary | `pointer-events: none` |
| **loading** | Spinner left of label, disabled | Label → “Saving…” / “Loading…” |

### Icon support

| Prop | Values | Rule |
|------|--------|------|
| `leftIcon` | React node / icon name | 16px icon in sm/md; 20px in lg |
| `rightIcon` | same | Chevron for menu trigger only |
| `iconOnly` | boolean | Requires `aria-label`; hit area = size height square |

---

## Responsive behavior

| Breakpoint | Rule |
|------------|------|
| mobile (≤480px) | Full-width primary allowed in driver-ui / storefront footers |
| tablet+ | Inline button groups; max one full-width per sticky bar |
| pos-ui / kds-ui | Default `size="lg"`; never `sm` on payment actions |

---

## Usage guidelines

- **One** `variant="primary"` per PageHeader action group and modal footer.  
- Pair **destructive** with [MODAL](./MODAL.md) confirmation.  
- Use **ghost** for toolbar actions; **secondary** for Cancel.  
- **pos-ui:** “Pay”, “Hold”, “Discount” — `lg` + clear verbs, not “OK”.  
- **admin-ui:** “Create location”, “Export CSV” (ghost).

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| Primary “Save changes” + secondary “Cancel” | Two primaries on same row |
| `loading` + “Saving…” on submit | Blank disabled button |
| Icon-only settings gear with `aria-label="Settings"` | Icon-only with no label |
| Destructive “Delete location” in confirm modal | Destructive “Back” |
| pos-ui Pay button `size="lg"` | 32px Pay button |

---

## Examples (text)

| Context | Spec |
|---------|------|
| admin-ui inventory header | ghost “Export”, secondary “Import”, primary “Add product” |
| storefront-ui cart footer | full-width primary “Checkout” on mobile |
| driver-ui task detail | sticky full-width primary “Mark delivered” |
| kds-ui ticket actions | secondary “Bump”, primary “Complete” both `lg` |
