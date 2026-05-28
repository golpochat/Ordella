# pos-ui Refactor Plan

**Repo:** `apps/pos-ui` · **Template:** [POS_UI_TEMPLATE](../module-templates/POS_UI_TEMPLATE.md)

---

## Key flows

| Flow | Routes / components |
|------|---------------------|
| Product selection | `(pos)/home/page.tsx`, `components/pos-register.tsx` |
| Cart | `(pos)/cart/page.tsx`, `components/pos-cart-sidebar.tsx` |
| Checkout / payment | `(pos)/payment/page.tsx`, `components/payment-screen.tsx`, `pos-checkout-modal.tsx` |
| Receipt | `(pos)/receipt/page.tsx`, `components/receipt-screen.tsx` |
| Refund | *(route TBD or modal in payment)* — use destructive [Modal](../components/MODAL.md) |
| Offline | `lib/offline-sync.ts` UI + topbar [Alert](../components/ALERT.md) |
| Shell | `(pos)/layout.tsx`, `components/pos-top-bar.tsx` |

---

## Refactor order

| Order | Flow | Why |
|-------|------|-----|
| 1 | Shell + topbar + SplitLayout | Fixes grid for all flows |
| 2 | Home / product grid + cart sidebar | Core sale loop |
| 3 | Payment screen + keypad | Revenue critical |
| 4 | Receipt preview | Post-payment |
| 5 | Offline banner + disabled states | Risk isolation |
| 6 | Picking, session modals | Secondary |

---

## Per flow execution

| Step | Action |
|------|--------|
| 1 | Apply [SplitLayout](../layout/LAYOUT_PRIMITIVES.md#splitlayout-pos-ui) — 62/38, cart min 360px |
| 2 | Enforce touch: [Button](../components/BUTTON.md) `lg` 48px, [Input](../components/INPUT.md) `lg` |
| 3 | Product grid: auto-fill, gutter `space-12`, [Card](../components/CARD.md) tiles |
| 4 | Cart: 56px line rows, tabular totals |
| 5 | Payment: full-screen [Modal](../components/MODAL.md) sheet—not `sm` dialog |
| 6 | Verify **1024×768** and **1280×800** ([BREAKPOINTS](../layout/BREAKPOINTS.md)) |
| 7 | [MODULE_SPECIFIC_QA](../visual-qa/MODULE_SPECIFIC_QA.md) pos rows PASS |
| 8 | Mark design-complete |

---

## Likely files by flow

| Flow | Files |
|------|-------|
| Shell | `app/(pos)/layout.tsx`, `components/pos-top-bar.tsx` |
| Register | `components/pos-register.tsx`, `app/(pos)/home/page.tsx` |
| Cart | `components/pos-cart-sidebar.tsx`, `app/(pos)/cart/page.tsx` |
| Payment | `components/payment-screen.tsx`, `app/(pos)/payment/page.tsx` |
| Receipt | `components/receipt-screen.tsx`, `app/(pos)/receipt/page.tsx` |
| Theme/tokens | `app/globals.css`, `tailwind.config.ts` |

---

## Done criteria (pos-ui)

- [ ] No document-level scroll; split panes scroll independently  
- [ ] Pay and lane actions `Button` `lg`  
- [ ] Payment full-screen sheet at 1024×768  
- [ ] QA screenshots at 1024×768 + 1280×800 attached to epic PR or folder  
- [ ] Offline [Alert](../components/ALERT.md) visible when simulated  
- [ ] No admin sidebar pattern anywhere  

**Estimated effort:** 2–3 weeks after shared `Button`/`Input` lg exports exist.
