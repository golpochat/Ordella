# Before / After Examples (Text)

Training reference for reviewers. **Before** = visual QA fail; **After** = pass. Cross-links point to fixes.

**Related:** [GLOBAL_VISUAL_QA_CHECKLIST](./GLOBAL_VISUAL_QA_CHECKLIST.md) · [components](../components/OVERVIEW.md) · [tokens](../tokens/)

---

## Spacing

### Bad vs correct (generic)

| Before (fail) | After (pass) | Rule |
|---------------|--------------|------|
| Section gap `margin-bottom: 30px` | `space-32` (32px) between PageSections | [SPACING_TOKENS](../tokens/SPACING_TOKENS.md) S1 |
| Card padding `18px 22px` | `space-24` uniform | [CARD](../components/CARD.md) |
| Form fields `gap: 10px` | `space-16` between fields | [FORM_LAYOUT](../components/FORM_LAYOUT.md) |

### admin-ui

| Before | After |
|--------|-------|
| PageHeader title 8px above table | `space-32` below PageHeader |
| KPI cards uneven gaps (20px, 28px) | Grid gutter `space-24` all sides |

### marketing-ui

| Before | After |
|--------|-------|
| Hero to features `space-24` | Hero to features `space-48` minimum |
| Feature cards internal `space-12` mixed | Card padding `space-24` consistent |

---

## Alignment

### Bad vs correct (generic)

| Before (fail) | After (pass) | Rule |
|---------------|--------------|------|
| Filter row indented 12px vs table | Shared content left edge | Global A4 |
| Modal primary left, cancel right | Cancel left, primary right (LTR footer) | [MODAL](../components/MODAL.md) |
| Price column left-aligned | Price column right, tabular-nums | Global A3 |

### storefront-ui

| Before | After |
|--------|-------|
| PLP product grid misaligned with category title | Title and grid share `container-lg` padding edge |
| PDP Add to cart not aligned with price block | Actions in same Stack column as price |

### pos-ui

| Before | After |
|--------|-------|
| Cart totals ragged decimal alignment | All amounts right-aligned tabular |
| Footer Pay not aligned with cart right edge | Footer padding matches cart panel `space-16` |

---

## Component usage

### Bad vs correct (generic)

| Before (fail) | After (pass) | Rule |
|---------------|--------------|------|
| `<div className="bg-teal-600 rounded px-4">Save</div>` | `<Button variant="primary">Save changes</Button>` | Global P1 |
| Red border on email, no message | `border-error` + caption “Enter a valid email.” | [INPUT](../components/INPUT.md) |
| Two buttons “Submit” + “Save” both primary | primary “Save changes” + secondary “Cancel” | Global P5 |

### admin-ui

| Before | After |
|--------|-------|
| Custom HTML table with div rows | [TABLE](../components/TABLE.md) semantic `<table>` in Card |
| “Delete” link text in table | ghost icon [Button](../components/BUTTON.md) with aria-label |

### kds-ui

| Before | After |
|--------|-------|
| Ticket card red background only | `error-50` bg + [Badge](../components/BADGE.md) “OVERDUE” |
| Text link “Done” 14px | [Button](../components/BUTTON.md) `lg` “Complete” |

### driver-ui

| Before | After |
|--------|-------|
| Small “Deliver” link top-right | Sticky bottom primary “Mark delivered” full width |
| Status dot green only | [Badge](../components/BADGE.md) `success` “Delivered” |

---

## Responsiveness

### Bad vs correct (generic)

| Before (fail) | After (pass) | Rule |
|---------------|--------------|------|
| admin table columns clip on 400px, no scroll | Wrapper `overflow-x: auto` | Global R7 |
| PageHeader actions overflow off-screen mobile | Actions stack below title | [layout/RESPONSIVE_BEHAVIOR](../layout/RESPONSIVE_BEHAVIOR.md) |

### admin-ui

| Before | After |
|--------|-------|
| Sidebar fixed 240px on 320px phone covering content | Hamburger opens drawer overlay |
| Settings form 2-col at 375px crushed | Single column `full` span |

### pos-ui

| Before | After |
|--------|-------|
| At 1024×768 cart panel 280px, grid crushed | Cart min 360px, product pane scrolls |
| Payment as centered 400px dialog | Full-screen payment sheet |

### kds-ui

| Before | After |
|--------|-------|
| 3-column grid with 200px unreadable cards | min 280px cards, 4–6 cols at 1080p |
| Portrait layout with stacked single column | Landscape-only full-screen grid |

### driver-ui

| Before | After |
|--------|-------|
| Designed at 1440px desktop only | Reviewed 375px; bottom bar + safe-area |
| Map 120px height crushing items list | Map min 200px in own PageSection |

### storefront-ui

| Before | After |
|--------|-------|
| Filter sidebar visible at 320px (50% width) | Filter drawer full-screen |
| Checkout button below fold mobile | Sticky bottom Checkout bar |

### customer-ui

| Before | After |
|--------|-------|
| Order table horizontal scroll on phone | Card list Stack |
| Profile form full viewport width on desktop | `container-sm` 640px centered |

### marketing-ui

| Before | After |
|--------|-------|
| Hero text full viewport width on ultrawide | `container-lg` + headline max readable width |
| Mid-page CTA left-aligned in centered band | CTA Stack `align center` in band |

---

## Broken vs correct behavior (summary table)

| Module | Broken | Correct |
|--------|--------|---------|
| **admin-ui** | 13px gaps; custom button; table clips mobile | Token gaps; ODS Button; scroll wrapper |
| **pos-ui** | 32px Pay; modal payment | 48px Pay; full-screen sheet |
| **kds-ui** | Color-only overdue | Label + semantic tokens |
| **driver-ui** | Top tiny CTA | Bottom sticky primary |
| **storefront-ui** | Sidebar on mobile | Filter drawer |
| **customer-ui** | Wide admin-style table | Card list |
| **marketing-ui** | Random 40px sections | `space-48`/`space-64` rhythm |

---

## How to cite in PR comments

Use format:

```
Visual QA FAIL (spacing): Section gap 30px → use space-32 per GLOBAL A1 / SPACING_TOKENS.
See BEFORE_AFTER_EXAMPLES — admin-ui spacing.
```

```
Visual QA PASS: SCREEN_REVIEW_TEMPLATE attached; global + MODULE_SPECIFIC admin-ui all pass.
```

Return to [OVERVIEW](./OVERVIEW.md)
