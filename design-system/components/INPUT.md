# Input

Textual and numeric field control with label, helper, and error slots.

**Tokens:** [COLOR_TOKENS](../tokens/COLOR_TOKENS.md) · [TYPOGRAPHY_TOKENS](../tokens/TYPOGRAPHY_TOKENS.md) · [SPACING_TOKENS](../tokens/SPACING_TOKENS.md) · [RADIUS_TOKENS](../tokens/RADIUS_TOKENS.md)

**Related:** [FORM_LAYOUT](./FORM_LAYOUT.md) · [SELECT](./SELECT.md)

---

## Anatomy

```
Label (optional required *)
Helper text (optional)
┌─────────────────────────────────────┐
│ [prefix]  value              [suffix] │
└─────────────────────────────────────┘
Error text (conditional)
```

| Slot | Typography | Spacing |
|------|------------|---------|
| Label | `font-size-sm`, `font-weight-medium` | `space-8` below label |
| Helper | `font-size-xs`, `neutral-600` | `space-4` above control or below label |
| Control | `font-size-md` | padding `space-12` y, `space-16` x |
| Error | `font-size-xs`, `error-500` | `space-4` below control |

---

## Props / variants / states

### Types (`type` prop)

| Type | Use | Notes |
|------|-----|--------|
| `text` | Names, titles | Default |
| `number` | Qty, amounts | `tabular-nums`; min/max props |
| `password` | Secrets | Toggle show optional; never log value |
| `search` | Filters, catalog search | Leading search icon; clear button when non-empty |
| `email` | Contact fields | Use with email validation pattern |
| `tel` | Phone | `inputmode="tel"` on mobile |

### Sizes

| Prop `size` | Height | Font |
|-------------|--------|------|
| `md` | 40px | `font-size-md` |
| `lg` | 48px | `font-size-md` | **pos-ui** default |

### States

| State | Border | Background | Text |
|-------|--------|------------|------|
| default | `border-default` | `neutral-0` | `neutral-900` |
| hover | `border-strong` | `neutral-0` | — |
| focus | `border-focus` + ring | `neutral-0` | — |
| disabled | `border-default` | `neutral-100` | `neutral-400` |
| error | `border-error` | `neutral-0` | — |
| readOnly | `border-default` | `neutral-50` | `neutral-900` |

---

## Validation patterns

| Pattern | Rule | Error message example |
|---------|------|------------------------|
| Required | `required` + visible indicator on label | “This field is required.” |
| Email | RFC-lite regex | “Enter a valid email address.” |
| Min/max number | `min`, `max` props | “Quantity must be between 1 and 99.” |
| Max length | `maxLength` + counter optional | “Maximum 100 characters.” |
| Async | Show loading on field; error after server response | “SKU already exists.” |

**Rule:** Error state requires **error text**—not border color alone ([STEP_5](../STEP_5_VISUAL_QA_RULES.md)).

---

## Responsive behavior

| Breakpoint | Rule |
|------------|------|
| mobile | Full width (`width: 100%`) in forms |
| desktop | Max width per [FORM_LAYOUT](./FORM_LAYOUT.md) (e.g. 320px short fields, 100% long text) |
| pos-ui | `size="lg"`; search bar full width in top bar |

---

## Usage guidelines

- Always associate `<label htmlFor>` or `aria-labelledby`.  
- Placeholder is **hint only**—not a label.  
- **admin-ui:** dense tables use inline edit variant (same tokens, compact padding TBD in ui package).  
- **storefront-ui:** search in header with `type="search"`.  
- Do not use Input for long prose—use Textarea (same spec, `min-height: 96px`).

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| Label “Tax ID” + helper “Shown on invoices” | Placeholder-only “Tax ID” |
| Password with show/hide toggle | Plain text password field |
| Error: “Enter a valid email.” | Red border only |
| pos-ui qty `type="number"` `size="lg"` | Default 40px qty on lane |

---

## Examples (text)

| Context | Spec |
|---------|------|
| admin-ui settings | Label + Input `md` + helper under label |
| pos-ui discount | Input `lg` + Button `lg` secondary “Apply” in Flex row |
| driver-ui search stops | `type="search"` full width, clear icon |
| customer-ui profile email | `type="email"` + validation on blur |
