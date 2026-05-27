# Alert

Inline persistent message for context on the current view or form.

**Tokens:** [COLOR_TOKENS](../tokens/COLOR_TOKENS.md) · [TYPOGRAPHY_TOKENS](../tokens/TYPOGRAPHY_TOKENS.md) · [SPACING_TOKENS](../tokens/SPACING_TOKENS.md) · [RADIUS_TOKENS](../tokens/RADIUS_TOKENS.md)

**Related:** [TOAST](./TOAST.md) for transient feedback

---

## Anatomy

```
┌────────────────────────────────────────────────┐
│ [icon]  Title (optional)                        │
│         Message body — body-sm                  │
│         [Action link]              [dismiss ×]   │
└────────────────────────────────────────────────┘
```

| Part | Rule |
|------|------|
| Container | `radius-sm`, padding `space-16`, border 1px semantic or neutral |
| Icon | 20px, left, `space-12` gap to text |
| Title | `font-weight-medium`, optional |
| Message | `font-size-sm`, required |

---

## Props / variants

| Prop `variant` | Background | Border / icon | Use |
|----------------|------------|---------------|-----|
| `success` | `success-50` | `success-500` | Saved, connected, in stock |
| `warning` | `warning-50` | `warning-500` | Pending action, low stock |
| `error` | `error-50` | `error-500` | Form-level failure, blocked action |
| `info` | `info-50` | `info-500` | Tips, non-blocking notices |

| Prop | Description |
|------|-------------|
| `dismissible` | boolean; shows close control |
| `onDismiss` | callback; persist dismissal in session if needed |
| `action` | optional link button “View details” |

---

## Icon rules

| Variant | Icon semantics |
|---------|----------------|
| success | check circle |
| warning | alert triangle |
| error | x circle or alert octagon |
| info | info circle |

**Rule:** Icon is decorative if title + message are clear—set `aria-hidden` on icon; container `role="alert"` for error/warning that must be announced.

---

## Usage guidelines

- Place at **top of form** or **top of PageSection**—not floating.  
- **error** Alert for server 500 on submit; field errors stay on [INPUT](./INPUT.md).  
- **warning** for “API key expires in 3 days”.  
- **info** for beta banners in admin-ui.  
- Do not use Alert for success after save—prefer [Toast](./TOAST.md) unless user must read long text.  
- **kds-ui:** station offline = `error` Alert bar below header.

---

## Responsive behavior

Full width of parent; message wraps. Action link stacks below message on mobile if row too tight.

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| “Payment failed. Check card details or try another method.” | Red box with no text |
| warning + “Renew key” action link | Toast for permanent config issue |
| Dismissible info beta banner | Auto-dismiss error |
| success + icon + “Webhook created” | success Alert on every field blur |

---

## Examples (text)

| Context | Spec |
|---------|------|
| admin-ui billing | warning, dismissible, action “Update payment method” |
| admin-ui form submit fail | error, not dismissible until fixed |
| kds-ui printer offline | error, full width below station name |
| customer-ui maintenance | info, dismissible once per session |
