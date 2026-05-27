# Module-Specific Visual QA

Run **after** [GLOBAL_VISUAL_QA_CHECKLIST](./GLOBAL_VISUAL_QA_CHECKLIST.md) passes. Match patterns to [module templates](../module-templates/OVERVIEW.md).

---

## admin-ui (`apps/admin-ui`)

**Template:** [ADMIN_UI_TEMPLATE](../module-templates/ADMIN_UI_TEMPLATE.md)

| # | Check | Pass criteria |
|---|--------|---------------|
| AD1 | **Sidebar alignment** | 240px expanded / 64px collapsed; nav items align left; border `border-default`; mobile → drawer |
| AD2 | **Topbar** | 56px height; search + actions vertically centered; `space-16` horizontal padding |
| AD3 | **Content padding** | Main area `space-24`; background `neutral-50` |
| AD4 | **Table spacing** | Header `font-size-sm` medium; rows 40px min; sticky header if >20 rows; actions icon-only |
| AD5 | **Table scroll** | Mobile wrapper `overflow-x: auto`—no clipped columns without scroll |
| AD6 | **Form layout** | Settings ≤640px `container-sm`; field gap `space-16`; 2-col collapses on mobile |
| AD7 | **Dashboard cards** | KPI grid aligned to 12-col; gutter `space-24`; equal card heights per row |
| AD8 | **Don’t** | POS `lg` buttons; `font-size-display`; admin sidebar missing on desktop |

**Spot-check routes:** `inventory`, `catalog`, `staff`, `franchise-hq`

---

## pos-ui (`apps/pos-ui`)

**Template:** [POS_UI_TEMPLATE](../module-templates/POS_UI_TEMPLATE.md)

| # | Check | Pass criteria |
|---|--------|---------------|
| PO1 | **Product grid alignment** | Auto-fill grid; gutter `space-12`; tiles align to grid; no ragged orphan gaps |
| PO2 | **Split layout** | ~62/38 split at 1024×768; cart min **360px** |
| PO3 | **Cart panel spacing** | Header `space-16`; lines 56px min height; totals `space-16`; tabular prices |
| PO4 | **Payment screen** | Full-screen sheet; keypad keys **48px**; primary Pay `lg` |
| PO5 | **Touch targets** | All lane actions ≥44px; footer gap `space-8` |
| PO6 | **Receipt preview** | Mono `font-size-sm`; max 320px centered; actions aligned end |
| PO7 | **Scroll** | Only product grid + cart lines scroll—not document body |
| PO8 | **Offline banner** | `warning` [Alert](../components/ALERT.md) visible in topbar region |
| PO9 | **Don’t** | admin sidebar; `sm` Pay; 400px payment modal |

**QA viewports:** 1024×768 (required), 1280×800 (required)

---

## kds-ui (`apps/kds-ui`)

**Template:** [KDS_UI_TEMPLATE](../module-templates/KDS_UI_TEMPLATE.md)

| # | Check | Pass criteria |
|---|--------|---------------|
| KD1 | **Full-screen grid** | 100vh minus header; ticket area scrolls vertically only |
| KD2 | **Order card spacing** | Min 280×180px; gutter `space-16`; internal padding `space-16` |
| KD3 | **Timer visibility** | Age badge `font-size-xs` medium; readable at 3m |
| KD4 | **Color-coded status** | Label + color: NEW, COOKING, OVERDUE per [COLOR_TOKENS](../tokens/COLOR_TOKENS.md) |
| KD5 | **Priority** | RUSH badge visible when applicable |
| KD6 | **Touch** | Bump / Complete `Button` `lg` 48px |
| KD7 | **Shadows** | `shadow-none` on tickets—borders only |
| KD8 | **Don’t** | Mobile portrait layout; `shadow-lg` cards |

**QA viewport:** 1920×1080 landscape (required)

---

## driver-ui (`apps/driver-app`)

**Template:** [DRIVER_UI_TEMPLATE](../module-templates/DRIVER_UI_TEMPLATE.md)

| # | Check | Pass criteria |
|---|--------|---------------|
| DR1 | **Mobile-first** | Primary review at **375px** width |
| DR2 | **List spacing** | Cards `space-12` gap; full width; status [Badge](../components/BADGE.md) |
| DR3 | **List → detail** | Back on PageHeader; sections `space-32` apart |
| DR4 | **Bottom action bar** | Sticky; `space-16` padding + safe-area; primary full width |
| DR5 | **Map placeholder** | 200px+ min height; does not crush list content |
| DR6 | **Offline** | Warning Alert below app bar when offline |
| DR7 | **Don’t** | admin [Table](../components/TABLE.md); desktop-only hover; tiny map text |

---

## storefront-ui (`apps/storefront`)

**Template:** [STOREFRONT_UI_TEMPLATE](../module-templates/STOREFRONT_UI_TEMPLATE.md)

| # | Check | Pass criteria |
|---|--------|---------------|
| SF1 | **Container** | `container-lg` 1280px centered; paddingX tokenized |
| SF2 | **Product grid** | 2 / 3 / 4 cols mobile/tablet/desktop; gutter `space-12`–`space-16` |
| SF3 | **Filter sidebar** | 240px desktop; drawer mobile—no crushed sidebar at 320px |
| SF4 | **PDP layout** | Gallery + info 50/50 desktop; stacked mobile |
| SF5 | **Cart drawer** | 400px desktop / full mobile; summary + primary Checkout |
| SF6 | **Checkout** | Step indicator; sticky mobile pay bar |
| SF7 | **Don’t** | admin sidebar; pos keypad sizing |

---

## customer-ui (`apps/customer-app`)

**Template:** [CUSTOMER_UI_TEMPLATE](../module-templates/CUSTOMER_UI_TEMPLATE.md)

| # | Check | Pass criteria |
|---|--------|---------------|
| CU1 | **Minimal chrome** | No admin sidebar; no marketing hero |
| CU2 | **Token parity** | Matches storefront preset colors/type |
| CU3 | **List/detail** | Order cards aligned; detail timeline `Stack` `space-16` |
| CU4 | **Profile / orders** | Forms `container-sm` 640px; PageHeader per route |
| CU5 | **Alignment** | Amounts right tabular; labels left |
| CU6 | **Don’t** | `font-size-display` in settings; dense admin tables |

---

## marketing-ui (`apps/marketing`)

**Template:** [MARKETING_UI_TEMPLATE](../module-templates/MARKETING_UI_TEMPLATE.md)

| # | Check | Pass criteria |
|---|--------|---------------|
| MK1 | **Hero spacing** | `space-48`+ vertical padding; headline → subhead `space-16` |
| MK2 | **Section spacing** | `space-48`–`space-64` between major sections |
| MK3 | **CTA alignment** | Hero CTAs left (or approved center); mid-page band **centered** |
| MK4 | **Typography** | `font-size-display` desktop hero only; prose ≤72ch |
| MK5 | **One primary per section** | No competing primaries in same viewport |
| MK6 | **Containers** | `container-lg` content; `container-xl` outer optional |
| MK7 | **Don’t** | admin data tables; pos touch patterns; arbitrary section gaps |

---

## Module sign-off

| Module | Result PASS/FAIL | Reviewer | Date |
|--------|------------------|----------|------|
| | | | |

All module rows for target UI must **PASS** for design-complete.
