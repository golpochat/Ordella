# admin-ui Refactor Plan

**Repo:** `apps/admin-ui` · **Template:** [ADMIN_UI_TEMPLATE](../module-templates/ADMIN_UI_TEMPLATE.md)

---

## Refactor order

| Phase | Scope | Rationale |
|-------|--------|-----------|
| 0 | `app/(dashboard)/layout.tsx`, shared sidebar/topbar | Shell blocks all pages |
| 1 | `dashboard`, `inventory`, `catalog`, `orders` | Highest traffic |
| 2 | `locations`, `staff`, `reports` | Core ops |
| 3 | `franchise-hq/*`, `warehouse/*` | Same patterns as phase 1 |
| 4 | Long tail (integrations, AI, compliance, …) | Reuse Table/Form patterns |

---

## Key screens

| Type | Routes (examples) |
|------|-------------------|
| Dashboard | `(dashboard)/dashboard`, `franchise-hq/dashboard` |
| Lists | `inventory`, `catalog`, `orders`, `staff`, `suppliers` |
| Detail | `orders/[orderId]`, `locations/[id]`, `crm/[customerId]` |
| Forms | `locations/new`, settings-style pages |
| Settings | `notifications`, `developer`, tenant config pages |
| Reports | `reports`, `reports/sales`, analytics |

---

## Per-screen execution (repeat for each route)

| Step | Action | Doc |
|------|--------|-----|
| 1 | Classify: list / detail / form / dashboard | [migration screen types](../migration/OVERVIEW.md) |
| 2 | Apply [SidebarLayout](../layout/LAYOUT_PRIMITIVES.md#sidebarlayout-admin-ui) | [ADMIN_UI_TEMPLATE](../module-templates/ADMIN_UI_TEMPLATE.md) |
| 3 | Replace spacing → [SPACING_TOKENS](../tokens/SPACING_TOKENS.md) | `space-24` content, `space-32` sections |
| 4 | Replace typography → [TYPOGRAPHY_TOKENS](../tokens/TYPOGRAPHY_TOKENS.md) | `font-size-2xl` title, `font-size-sm` tables |
| 5 | Replace colors → [COLOR_TOKENS](../tokens/COLOR_TOKENS.md) | semantic stock statuses |
| 6 | Replace UI → [Table](../components/TABLE.md), [Button](../components/BUTTON.md), [Input](../components/INPUT.md), [Card](../components/CARD.md) | |
| 7 | Apply Stack, Flex, Grid, PageHeader, PageSection | [layout](../layout/OVERVIEW.md) |
| 8 | Responsive: drawer sidebar mobile; table scroll | [RESPONSIVE_BEHAVIOR](../layout/RESPONSIVE_BEHAVIOR.md) |
| 9 | Visual QA PASS | [MODULE_SPECIFIC_QA](../visual-qa/MODULE_SPECIFIC_QA.md#admin-ui-appsadmin-ui) |
| 10 | Mark design-complete | [SCREEN_REVIEW](../visual-qa/SCREEN_REVIEW_TEMPLATE.md) |

---

## Screen table (priority)

| Screen | Likely files | Template pattern |
|--------|--------------|------------------|
| Dashboard | `app/(dashboard)/dashboard/page.tsx`, KPI components | Grid + Cards |
| Inventory list | `inventory/page.tsx`, inventory table component | PageHeader + filters + Table |
| Catalog | `catalog/page.tsx`, `catalog/bundles/page.tsx` | List |
| Order detail | `orders/[orderId]/page.tsx` | Detail + sections |
| Location form | `locations/new/page.tsx`, `locations/[id]/page.tsx` | Form `container-sm` |
| Franchise HQ dashboard | `franchise-hq/dashboard/page.tsx` | Dashboard |
| Shell | `app/(dashboard)/layout.tsx`, `apps/shared-ui` sidebar | SidebarLayout |

*Log each route in team migration/refactor tracker as design-complete.*

---

## Done criteria (admin-ui module)

- [ ] `(dashboard)/layout.tsx` — 240px/64px sidebar, 56px topbar, `space-24` content padding  
- [ ] All **Phase 1–2** routes design-complete  
- [ ] No raw hex in `apps/admin-ui` components (grep audit)  
- [ ] Tables use ODS [Table](../components/TABLE.md) pattern  
- [ ] Settings forms ≤640px centered  
- [ ] Module QA PASS on spot-check: inventory, dashboard, locations/new  

**Estimated effort:** 4–6 weeks with 2 engineers (parallel phase 4 after patterns land).
