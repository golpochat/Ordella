# ODS Step 4 — Module Layout Templates

Per-app shells and recurring page patterns. Repo paths in parentheses; doc names use **-ui** suffix per ODS convention.

**Related:** [Module template specs](./module-templates/OVERVIEW.md) · [STEP_3_LAYOUT_SYSTEM.md](./STEP_3_LAYOUT_SYSTEM.md) · [OVERVIEW](./OVERVIEW.md)

> **Authoritative detail:** See `/design-system/module-templates/*.md` for full diagrams, spacing, responsive rules, and do/don’t per UI.

---

## admin-ui layout template

**Repo:** `apps/admin-ui` · **Reference:** `app/(dashboard)/layout.tsx`, `apps/shared-ui` sidebar patterns

### Shell

```
┌──────────┬────────────────────────────────────────┐
│ Sidebar  │ Topbar (search, tenant, user)           │
│ 240px    ├────────────────────────────────────────┤
│ nav      │ PageHeader + content (padding space-6) │
│          │                                          │
└──────────┴────────────────────────────────────────┘
```

| Zone | Spec |
|------|------|
| Sidebar width | 240px expanded / 64px collapsed |
| Sidebar bg | `neutral-0` border-r `border-default` |
| Content bg | `neutral-50` |
| Topbar height | 56px |

### Typical pages

| Pattern | Structure |
|---------|-------------|
| **List** | PageHeader + filters Flex + DataTable Card |
| **List + detail** | Split: table 40% / detail drawer 60% OR master-detail routes |
| **Settings** | PageHeader + PageSections Stack; max-width 640px for forms |
| **Reports** | PageHeader + date tabs + chart Card + table Card |

**Examples in repo:** `app/(dashboard)/inventory`, `catalog/`, `staff/`, `franchise-hq/`

---

## pos-ui layout template

**Repo:** `apps/pos-ui`

### Shell (fixed, no document scroll on main chrome)

```
┌─────────────────────────────────────────────────────┐
│ Topbar: location, cashier, clock          [actions] │
├──────────────────────────────┬──────────────────────┤
│ Product grid (scroll)        │ Cart panel (fixed w) │
│ 60–65%                       │ 35–40% min 360px     │
│ categories + search          │ lines, totals, pay    │
├──────────────────────────────┴──────────────────────┤
│ Action bar: primary Pay, secondary Hold, ghost ...   │
└─────────────────────────────────────────────────────┘
```

| Rule | Value |
|------|--------|
| Touch targets | Buttons `lg` 48px min |
| Product tile | `radius-md`, image + title `body-sm` + price tabular |
| Cart line height | 56px min |
| Modal | Full-screen sheet for payment |

**Do not** use admin sidebar pattern on POS.

---

## kds-ui layout template

**Repo:** `apps/kds-ui`

### Shell (full-screen)

```
┌─────────────────────────────────────────────────────┐
│ Station name | Filters (station, course) | Clock     │
├─────────────────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  (auto-fill grid)   │
│ │ T-1 │ │ T-2 │ │ T-3 │ │ T-4 │  ticket cards       │
│ └─────┘ └─────┘ └─────┘ └─────┘                       │
│  scroll vertical only                                 │
└─────────────────────────────────────────────────────┘
```

| Ticket card | Spec |
|-------------|------|
| Min size | 280×180px |
| Status colors | semantic bg tint + bold status label |
| New | `info-50` border `info-500` |
| In progress | `neutral-0` |
| Overdue | `warning-50` / `error-50` by SLA threshold |
| Actions | Bump, complete—`lg` buttons |

**No** marketing shadows; high contrast for kitchen lighting.

---

## driver-ui layout template

**Repo:** `apps/driver-app` · **Reference:** `app/(driver)/layout.tsx`

### Shell (mobile-first)

```
┌──────────────────────┐
│ App bar: title, menu │
├──────────────────────┤
│ List Stack (scroll)  │
│  - task card         │
│  - task card         │
├──────────────────────┤
│ Sticky bottom CTA    │
└──────────────────────┘
```

| Pattern | Structure |
|---------|-------------|
| **List** | Cards `space-3` gap; status badge; swipe optional |
| **Detail** | PageHeader back + map placeholder + Stack sections |
| **Actions** | Primary full-width bottom |

Breakpoint `sm+`: optional two-column map + detail; default design at `xs`.

---

## storefront-ui + customer-ui templates

**Repos:** `apps/storefront`, `apps/customer-app`

### Storefront — product listing

```
PageHeader or hero strip (category title)
Filter/sort Flex
Product Grid (2–4 col)
Pagination
```

### Storefront — product detail (PDP)

```
Grid: gallery 50% | info 50% (stack on mobile)
  title heading-lg, price tabular, variant selects, primary Add to cart
Tabs: Description, Nutrition (PageSection)
```

### Storefront — cart

```
Line items Stack
Summary Card (subtotal, tax, total)
Primary Checkout sticky bottom mobile
```

### customer-ui

Mirror storefront tokens; focus **account** patterns:

| Page | Template |
|------|----------|
| Orders list | Card rows, status badge |
| Order detail | PageHeader + timeline Stack |
| Profile settings | PageSection form max 640px |

**Reference:** `apps/storefront/components/`, `apps/customer-app/` routes

---

## marketing-ui template

**Repo:** `apps/marketing` · **Reference:** `app/globals.css`, `website/sections/`

### Page structure

```
Navbar (sticky)
Hero (display-lg + subhead + primary CTA)
Section Stack space-12 (prose max 72ch or 12-col grid)
  Feature grid / product overview / CTA band
Footer
```

| Section type | Spec |
|--------------|------|
| **Hero** | `space-12`–`space-16` vertical padding; optional screenshot frame `radius-lg` `shadow-brand` |
| **CTA band** | `primary-600` bg or `neutral-50`; centered Stack |
| **Prose** | `body-md`; headings `heading-xl` / `heading-lg` |

Align copy with [website/copy](../../website/copy/homepage.md); tokens migrate to ODS primary over time.

---

## Template selection rule

| If the screen is… | Use template |
|-------------------|--------------|
| Back-office configuration | admin-ui |
| Checkout lane / register | pos-ui |
| Kitchen tickets | kds-ui |
| Delivery driver tasks | driver-ui |
| Public shop | storefront-ui |
| Logged-in shopper account | customer-ui |
| Public marketing | marketing-ui |

Next: [STEP_5_VISUAL_QA_RULES.md](./STEP_5_VISUAL_QA_RULES.md)
