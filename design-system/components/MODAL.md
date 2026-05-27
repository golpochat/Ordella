# Modal

Focused overlay dialog for confirmations, forms, and critical flows.

**Tokens:** [SHADOW_TOKENS](../tokens/SHADOW_TOKENS.md) · [Z_INDEX_TOKENS](../tokens/Z_INDEX_TOKENS.md) · [ANIMATION_TOKENS](../tokens/ANIMATION_TOKENS.md) · [SPACING_TOKENS](../tokens/SPACING_TOKENS.md)

**Related:** [BUTTON](./BUTTON.md) · Drawer variant in [STEP_4](../STEP_4_MODULE_LAYOUT_TEMPLATES.md)

---

## Anatomy

```
     [ scrim — surface-overlay, z-overlay ]
┌─────────────────────────────────────┐
│ HEADER: title + close (optional)     │
├─────────────────────────────────────┤
│ BODY: scrollable content               │
├─────────────────────────────────────┤
│ FOOTER: actions                      │
└─────────────────────────────────────┘
     panel — z-modal, shadow-lg, radius-md
```

---

## Props / sizes

| Prop `size` | Max width | Use |
|-------------|-----------|-----|
| `sm` | 400px | Confirm delete, simple alerts |
| `md` | 560px | Standard forms |
| `lg` | 720px | Multi-section editors |

| Prop | Description |
|------|-------------|
| `open` | Controlled visibility |
| `onClose` | Called on dismiss |
| `closeOnOverlayClick` | default true; false for destructive confirm |
| `title` | Required string or node |
| `description` | Optional subtitle under title |

---

## Header / body / footer

| Section | Tokens / rules |
|---------|----------------|
| Header | `heading-md`; padding `space-24`; close button ghost `iconOnly` top-right |
| Body | padding `space-24`; `max-height: 70vh`; overflow-y auto |
| Footer | padding `space-24`; border-top `border-default`; Flex justify-end gap `space-8` |

Footer order (LTR): **secondary** (Cancel) left of **primary** (Save). Destructive confirm: destructive primary only after explicit copy.

---

## Overlay rules

| Rule | Value |
|------|--------|
| Scrim | `surface-overlay` token |
| Scroll lock | `body` overflow hidden while open |
| Stacking | One modal at a time; no modal under modal |
| Z-index | scrim `z-overlay`, panel `z-modal` |

---

## Close behavior

| Action | Result |
|--------|--------|
| Close (×) | `onClose` |
| Escape | `onClose` unless `preventClose` |
| Overlay click | `onClose` if enabled |
| Primary submit | Close on success after async complete |

Unsaved changes: intercept with secondary modal “Discard changes?”.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Focus trap | Tab cycles within panel |
| Initial focus | First focusable or primary action |
| Return focus | To trigger element on close |
| `role="dialog"` | `aria-modal="true"` |
| Label | `aria-labelledby` → title id |
| Description | `aria-describedby` when subtitle present |

---

## Responsive behavior

| Breakpoint | Rule |
|------------|------|
| mobile ≤480px | Full width minus `space-16` margin; `size` props cap at 100% |
| pos-ui | Prefer **full-screen sheet** (same anatomy, no max-width, radius-lg top only) |

---

## Usage guidelines

- **admin-ui:** edit entity, delete confirm.  
- **pos-ui:** payment flow = sheet not `sm` modal.  
- **driver-ui:** avoid nested modals; use bottom sheet pattern when needed.  
- Destructive actions always `size="sm"` with explicit object name in title.

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| Title “Delete location ‘Downtown’?” | Title “Are you sure?” |
| Footer Cancel + Delete (destructive) | Delete without confirmation |
| Trap focus inside dialog | Background still tabbable |
| pos-ui payment full-screen sheet | 400px payment modal on lane |

---

## Examples (text)

| Context | Spec |
|---------|------|
| admin-ui delete user | `sm`, destructive footer, `closeOnOverlayClick: false` |
| admin-ui edit product | `lg`, body form, Save/Cancel |
| pos-ui card payment | full-screen sheet, `lg` buttons in footer |
