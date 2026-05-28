# customer-ui Refactor Plan

**Repo:** `apps/customer-app` · **Template:** [CUSTOMER_UI_TEMPLATE](../module-templates/CUSTOMER_UI_TEMPLATE.md)

---

## Key views

| View | Routes / files |
|------|----------------|
| Profile | `app/(customer)/profile/page.tsx`, `components/profile-view.tsx` |
| Orders list | `app/(customer)/orders/page.tsx`, `components/orders-list.tsx` |
| Order detail | `app/(customer)/orders/[orderId]/page.tsx`, `components/order-detail-view.tsx` |
| Addresses | `app/(customer)/addresses/page.tsx`, `components/addresses-view.tsx` |
| Home / saved / rewards | `home/page.tsx`, `saved/page.tsx`, `rewards/page.tsx` |
| Shell | `app/(customer)/layout.tsx`, `customer-header.tsx`, `customer-bottom-nav.tsx` |

---

## Refactor order

| Order | View |
|-------|------|
| 1 | `(customer)/layout.tsx` — minimal shell |
| 2 | Orders list + detail (list → detail pattern) |
| 3 | Profile form |
| 4 | Addresses |
| 5 | Secondary: rewards, subscriptions, support |

---

## Per view execution

| Step | Action |
|------|--------|
| 1 | [CUSTOMER_UI_TEMPLATE](../module-templates/CUSTOMER_UI_TEMPLATE.md) — no hero, no sidebar |
| 2 | `container-lg` / forms `container-sm` 640px |
| 3 | [Card](../components/CARD.md) list rows + [Badge](../components/BADGE.md) status |
| 4 | [Stack](../layout/LAYOUT_PRIMITIVES.md) spacing `space-16`–`space-24` |
| 5 | Match storefront [COLOR](../tokens/COLOR_TOKENS.md) / [TYPE](../tokens/TYPOGRAPHY_TOKENS.md) preset |
| 6 | Visual QA customer module |

---

## Done criteria (customer-ui)

- [ ] Profile, orders list, order detail, addresses — design-complete  
- [ ] No `font-size-display` on account pages  
- [ ] List/detail PASS mobile 375px  
- [ ] Token parity with storefront-ui  

**Estimated effort:** 1–2 weeks after storefront phase 1.

**Dependency:** Complete storefront token preset first.
