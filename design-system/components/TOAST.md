# Toast

Transient global notification for action feedback.

**Tokens:** [COLOR_TOKENS](../tokens/COLOR_TOKENS.md) · [SHADOW_TOKENS](../tokens/SHADOW_TOKENS.md) · [Z_INDEX_TOKENS](../tokens/Z_INDEX_TOKENS.md) · [ANIMATION_TOKENS](../tokens/ANIMATION_TOKENS.md)

**Related:** [ALERT](./ALERT.md) · [BUTTON](./BUTTON.md) optional action

---

## Anatomy

```
┌─────────────────────────────────────┐
│ [icon]  Message            [×]      │
│         Optional action link         │
└─────────────────────────────────────┘
```

| Part | Rule |
|------|------|
| Container | min-width 320px; max-width 420px; `radius-sm`; `shadow-md`; padding `space-16` |
| Message | `font-size-sm` |
| Z-index | `z-toast` |

---

## Props / variants

| Prop `variant` | Left accent / icon | Use |
|----------------|-------------------|-----|
| `success` | `success-500` | Saved, sent, completed |
| `warning` | `warning-500` | Partial success, retry suggested |
| `error` | `error-500` | Failed save, network error |
| `info` | `info-500` | Neutral FYI |

Same semantic pairing as [ALERT](./ALERT.md); toast is **brief** (one line preferred).

| Prop | Description |
|------|-------------|
| `duration` | ms until auto-dismiss |
| `persistent` | boolean; no auto-dismiss (errors) |
| `action` | `{ label, onClick }` optional |

---

## Auto-dismiss rules

| Variant | Default duration | Persistent |
|---------|------------------|------------|
| success | 5000ms | no |
| info | 5000ms | no |
| warning | 7000ms | no |
| error | — | **yes** until user dismisses |

Pause timer on hover/focus for accessibility.

---

## Stacking behavior

| Rule | Value |
|------|--------|
| Position desktop | top-right, offset `space-24` from edges |
| Position mobile driver-ui | bottom-center, safe-area inset |
| Stack direction | newest on top (desktop) |
| Gap between toasts | `space-8` |
| Max visible | 3; queue additional |
| Enter/exit | `duration-normal` `ease-out` / `ease-in` |

---

## Usage guidelines

- **admin-ui:** “Changes saved”, “Export started”.  
- **driver-ui:** “Delivery marked complete” bottom toast.  
- Use **error** toast for failed API; add action “Retry” when applicable.  
- Do not toast on every autosave—debounce or use subtle inline indicator.  
- Do not duplicate [Alert](./ALERT.md) content—pick one channel.

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| “Product archived.” success 5s | Toast on every keystroke |
| error persistent + “Dismiss” | error auto-dismiss in 3s |
| Max 3 stacked | 10 toasts covering entire screen |
| driver-ui bottom placement | top-right on narrow phone |

---

## Examples (text)

| Context | Spec |
|---------|------|
| admin-ui save settings | success, 5s |
| admin-ui bulk delete fail | error, persistent, action Retry |
| storefront add to cart | success, 3s, shorter copy |
| driver-ui offline sync fail | error, bottom, persistent |
