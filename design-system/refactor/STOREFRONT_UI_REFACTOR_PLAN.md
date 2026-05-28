# storefront-ui Refactor Plan

**Repo:** `apps/storefront` · **Template:** [STOREFRONT_UI_TEMPLATE](../module-templates/STOREFRONT_UI_TEMPLATE.md)

---

## Key views

| View | Routes / files |
|------|----------------|
| Product listing | `(public)/catalog/page.tsx`, `category/[id]`, `components/catalog-view.tsx` |
| Product detail | `(public)/product/[id]/page.tsx`, `components/product-detail.tsx` |
| Cart | `(public)/cart/page.tsx`, `(public)/basket/page.tsx`, `components/cart-view.tsx` |
| Checkout | `(public)/checkout/page.tsx`, `components/checkout-page-client.tsx`, `checkout-form.tsx` |
| Header/footer | `components/storefront-header.tsx`, `storefront-footer.tsx` |
| Shell | `app/(public)/layout.tsx`, `app/layout.tsx` |

---

## Refactor order

| Order | View |
|-------|------|
| 1 | `container-lg` + header/footer tokens |
| 2 | Catalog / category PLP grid |
| 3 | Product detail (PDP) |
| 4 | Cart drawer / cart page |
| 5 | Checkout + sticky mobile CTA |
| 6 | Order confirmation / tracking |

---

## Per view execution

| Step | Action |
|------|--------|
| 1 | [STOREFRONT_UI_TEMPLATE](../module-templates/STOREFRONT_UI_TEMPLATE.md) |
| 2 | PLP: 2/3/4 col grid; filter drawer mobile |
| 3 | PDP: gallery + info stack mobile |
| 4 | [Button](../components/BUTTON.md) primary Add to cart |
| 5 | Checkout: [FORM_LAYOUT](../components/FORM_LAYOUT.md) + summary Card |
| 6 | Responsive per [layout/BREAKPOINTS](../layout/BREAKPOINTS.md) |
| 7 | Visual QA storefront module |

---

## Done criteria (storefront-ui)

- [ ] Max width 1280px centered; token paddingX  
- [ ] PLP + PDP + checkout design-complete  
- [ ] Mobile sticky checkout bar  
- [ ] No admin sidebar  
- [ ] Filter sidebar → drawer ≤480px  

**Estimated effort:** 2–3 weeks (after marketing + admin patterns).
