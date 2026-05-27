# Module Layout Rules

Per-UI dimensions and patterns. Shell primitives: [LAYOUT_PRIMITIVES](./LAYOUT_PRIMITIVES.md). Templates: [STEP_4](../STEP_4_MODULE_LAYOUT_TEMPLATES.md).

---

## admin-ui

**Repo:** `apps/admin-ui`

| Property | Value |
|----------|--------|
| Shell | [SidebarLayout](./LAYOUT_PRIMITIVES.md#sidebarlayout-admin-ui) |
| Sidebar width | 240px expanded / 64px collapsed |
| Topbar height | 56px |
| Content padding | `space-24` horizontal + vertical |
| Content background | `neutral-50` |
| Narrow forms | `container-sm` 640px inside content |

### Table layout rules

| Rule | Spec |
|------|------|
| Placement | Full-width [PageSection](./LAYOUT_PRIMITIVES.md#pagesection-grouped-content) inside Card |
| Header | Sticky when rows > 20; `z-sticky` |
| Horizontal scroll | Wrapper `overflow-x: auto` on mobile |
| Filters | Full-span row above table; [Flex](./LAYOUT_PRIMITIVES.md#flex-alignment--distribution) |
| Empty state | Centered in table area; primary CTA |

**Example (text):** Inventory — PageHeader “Inventory” → filter Flex → Card with full-span Table.

---

## pos-ui

**Repo:** `apps/pos-ui`

| Property | Value |
|----------|--------|
| Shell | [SplitLayout](./LAYOUT_PRIMITIVES.md#splitlayout-pos-ui) |
| Viewports | 1024×768 primary; 1280×800 supported |
| Topbar | 56px; location + cashier + clock |

### Fixed layout grid

| Region | Size |
|--------|------|
| Product pane | ~62% width; internal auto-fill grid |
| Cart panel | ~38%; **min 360px** |
| Action footer | 64–72px height; sticky |

### Product grid sizing

| Viewport | Min tile | Columns (approx) |
|----------|----------|------------------|
| 1024×768 | 120px | 5–6 |
| 1280×800 | 128px | 6–7 |

Gutter `space-12`; tile [Card](../components/CARD.md) `radius-md`.

### Touch target spacing

| Element | Rule |
|---------|------|
| Buttons | `lg` 48px height |
| Line items | 56px min row height |
| Keypad keys | 48px; gap `space-8` |
| Between footer actions | `space-8` |

**Rule:** No admin SidebarLayout; no document body scroll.

---

## kds-ui

**Repo:** `apps/kds-ui`

| Property | Value |
|----------|--------|
| Shell | [FullscreenLayout](./LAYOUT_PRIMITIVES.md#fullscreenlayout-kds-ui) |
| Viewport QA | **1920×1080** landscape primary |

### Full-screen grid

| Property | Value |
|----------|--------|
| Ticket card min | 280×180px |
| Gutter | `space-16` |
| Columns at 1080p | 4–6 auto-fill |
| Scroll | Ticket area vertical only |

### Card sizing + status layout

| Status | Border / bg | Label |
|--------|-------------|--------|
| New | `info-500` border, `info-50` tint | “NEW” |
| In progress | `border-default` | “COOKING” |
| Warning SLA | `warning-500`, `warning-50` | “8m” |
| Overdue | `error-500`, `error-50` | “OVERDUE” |

**Rule:** Text label required on every status ([COLOR_TOKENS](../tokens/COLOR_TOKENS.md)).

---

## driver-ui

**Repo:** `apps/driver-app`

| Property | Value |
|----------|--------|
| Shell | [MobileListLayout](./LAYOUT_PRIMITIVES.md#mobilelistlayout-driver-ui) |
| Design width | 375px mobile first |

### List → detail

| Pattern | Rule |
|---------|------|
| List | Full-width Cards in Stack `space-12` |
| Detail | PageHeader with back; sections Stack |
| Tablet+ | Optional 40% list / 60% map split at ≥769px |

### Bottom action bar

| Rule | Value |
|------|--------|
| Position | Sticky bottom; `z-sticky` |
| Content | One primary [Button](../components/BUTTON.md) full width |
| Padding | `space-16` + safe-area-inset-bottom |
| Secondary | Above primary as ghost or secondary, not side-by-side on 320px |

---

## storefront-ui

**Repo:** `apps/storefront`

| Property | Value |
|----------|--------|
| Container | `container-lg` 1280px |
| Padding | `space-16` mobile, `space-24` desktop |

### Product grid

| Breakpoint | Columns |
|------------|---------|
| mobile | 2 |
| tablet | 3 |
| desktop | 4 |

Auto-fill min width 160px; gutter per [GRID_SYSTEM](./GRID_SYSTEM.md).

### Filter sidebar

| Breakpoint | Behavior |
|------------|----------|
| desktop ≥769px | Left sidebar 240px + product grid |
| tablet | Collapsible drawer |
| mobile | Filter button → full-screen drawer |

### Responsive collapse

PDP: gallery + info 50/50 desktop → stacked mobile. Cart sticky footer on mobile.

---

## customer-ui

**Repo:** `apps/customer-app`

| Property | Value |
|----------|--------|
| Goal | Simple, minimal |
| Container | `container-lg`; forms `container-sm` |
| Layout | Stack + Card; no sidebar |
| Nav | Top bar or tab bar only |

**Example (text):** Order history — PageHeader “Orders” → Stack of order Cards → tap to detail.

Align tokens with storefront-ui; reduce marketing density (no hero sections).

---

## marketing-ui

**Repo:** `apps/marketing`

| Property | Value |
|----------|--------|
| Outer container | `container-xl` 1440px |
| Content | `container-lg` 1280px |
| Section spacing | `space-48`–`space-64` vertical |

### Hero layout

| Element | Rule |
|---------|------|
| Structure | Stack centered or 2-col text + media |
| Title | `font-size-display` desktop |
| CTA | Primary [Button](../components/BUTTON.md) + optional secondary |
| Media | `radius-lg`; max width 100% of column |

### Section spacing + CTA alignment

| Section type | Spacing | CTA |
|--------------|---------|-----|
| Feature grid | `space-48` below hero | per-card ghost link |
| CTA band | `space-64` padding y | center Stack; primary centered |
| Footer | `space-32` padding | links Inline/Flex |

**Example (text):** Homepage — full-bleed hero bg → inner `container-lg` → feature Grid 3-col desktop → CTA band center.

---

## Cross-module summary

| UI | Shell | Max content | Special |
|----|-------|-------------|---------|
| admin-ui | Sidebar | fluid | sticky tables |
| pos-ui | Split | 100vw | fixed QA |
| kds-ui | Fullscreen | 100vw | status colors |
| driver-ui | Mobile list | 100% | bottom CTA |
| storefront-ui | Container lg | 1280px | filter drawer |
| customer-ui | Container lg | 1280px | minimal |
| marketing-ui | Container xl/lg | 1440/1280 | hero + sections |

Next: [RESPONSIVE_BEHAVIOR.md](./RESPONSIVE_BEHAVIOR.md)
