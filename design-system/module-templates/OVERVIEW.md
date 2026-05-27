# ODS Module Templates — Overview

**Module templates** are the approved page shells and recurring patterns for each Ordella UI. They turn the [layout system](../layout/OVERVIEW.md), [tokens](../tokens/), and [components](../components/OVERVIEW.md) into concrete structures teams ship every day.

**Related:** [ODS overview](../OVERVIEW.md) · [STEP_4 summary](../STEP_4_MODULE_LAYOUT_TEMPLATES.md) · [IMPLEMENTATION_GUIDE](../IMPLEMENTATION_GUIDE.md)

---

## Purpose

| Need | Module template answer |
|------|------------------------|
| Which shell does this app use? | SidebarLayout (admin) vs SplitLayout (pos) vs Fullscreen (kds) |
| What does a “list page” look like? | PageHeader → filters → table (admin) vs card list (driver) |
| How do we QA a screen? | Compare to the module’s `.md` file before design-complete |

Templates are **not** optional styling—they are the contract between design and engineering for launch readiness.

---

## Connection to tokens, components, layout

```
Tokens (values)  →  Layout (grid, breakpoints, containers)
                         ↓
Components (Button, Table, Card) composed inside
                         ↓
Module templates (admin-ui list page, pos-ui payment, …)
```

| Layer | Folder | Example |
|-------|--------|---------|
| Tokens | `/design-system/tokens/` | `space-24`, `primary-600`, `breakpoint-desktop` |
| Layout | `/design-system/layout/` | 12-col grid, SidebarLayout, CONTAINERS |
| Components | `/design-system/components/` | Button, Table, Modal, PageHeader |
| **Module templates** | `/design-system/module-templates/` | ADMIN_UI_TEMPLATE list + detail |

**Rule:** Templates reference token **names** and component **variants**—never one-off CSS.

---

## Why every UI must follow its template

| UI | Repo | Template |
|----|------|----------|
| **admin-ui** | `apps/admin-ui` | [ADMIN_UI_TEMPLATE](./ADMIN_UI_TEMPLATE.md) |
| **pos-ui** | `apps/pos-ui` | [POS_UI_TEMPLATE](./POS_UI_TEMPLATE.md) |
| **kds-ui** | `apps/kds-ui` | [KDS_UI_TEMPLATE](./KDS_UI_TEMPLATE.md) |
| **driver-ui** | `apps/driver-app` | [DRIVER_UI_TEMPLATE](./DRIVER_UI_TEMPLATE.md) |
| **storefront-ui** | `apps/storefront` | [STOREFRONT_UI_TEMPLATE](./STOREFRONT_UI_TEMPLATE.md) |
| **customer-ui** | `apps/customer-app` | [CUSTOMER_UI_TEMPLATE](./CUSTOMER_UI_TEMPLATE.md) |
| **marketing-ui** | `apps/marketing` | [MARKETING_UI_TEMPLATE](./MARKETING_UI_TEMPLATE.md) |

Cross-app consistency: a retailer moving from **storefront-ui** checkout to **admin-ui** order view should recognize Ordella structure, spacing, and actions.

---

## Rules: no custom layouts unless approved

| Allowed | Not allowed |
|---------|-------------|
| Compose template regions with ODS components | New sidebar width per feature team |
| Optional slots (e.g. chart in dashboard Card) | pos-ui single-column mobile collapse |
| Domain widget **inside** template region (POS numpad) | marketing-ui page without hero/section structure |
| Approved ODS template addition via PR to this folder | “Temporary” layout until after launch |

**Exception process:** Document in `/design-system/module-templates/` → design + platform sign-off → implement in `packages/ui` → roll out per [IMPLEMENTATION_GUIDE](../IMPLEMENTATION_GUIDE.md).

**Also forbidden:** Inline styles; layouts that bypass [STEP_5](../STEP_5_VISUAL_QA_RULES.md) module QA.

---

## Template index

| File | Module |
|------|--------|
| [ADMIN_UI_TEMPLATE.md](./ADMIN_UI_TEMPLATE.md) | Back-office |
| [POS_UI_TEMPLATE.md](./POS_UI_TEMPLATE.md) | Register / lane |
| [KDS_UI_TEMPLATE.md](./KDS_UI_TEMPLATE.md) | Kitchen display |
| [DRIVER_UI_TEMPLATE.md](./DRIVER_UI_TEMPLATE.md) | Delivery driver |
| [STOREFRONT_UI_TEMPLATE.md](./STOREFRONT_UI_TEMPLATE.md) | Public shop |
| [CUSTOMER_UI_TEMPLATE.md](./CUSTOMER_UI_TEMPLATE.md) | Shopper account |
| [MARKETING_UI_TEMPLATE.md](./MARKETING_UI_TEMPLATE.md) | Public marketing site |

---

## Template selection (quick)

| If the user is… | Use |
|-----------------|-----|
| Configuring catalog, staff, reports | admin-ui |
| Ringing up a sale | pos-ui |
| Fulfilling kitchen tickets | kds-ui |
| Delivering an order | driver-ui |
| Browsing / buying (guest) | storefront-ui |
| Managing account after login | customer-ui |
| Learning about Ordella (pre-login) | marketing-ui |
