# admin-ui Module Template

Back-office shell and page patterns for retailer operations.

**Repo:** `apps/admin-ui` · **Reference:** `app/(dashboard)/layout.tsx`

**Related:** [layout/SidebarLayout](../layout/LAYOUT_PRIMITIVES.md#sidebarlayout-admin-ui) · [layout/MODULE_LAYOUT_RULES](../layout/MODULE_LAYOUT_RULES.md#admin-ui) · [components/TABLE](../components/TABLE.md) · [components/FORM_LAYOUT](../components/FORM_LAYOUT.md)

---

## App shell (text diagram)

```
┌──────────┬──────────────────────────────────────────────────┐
│          │ TOPBAR 56px                                       │
│ SIDEBAR  │  [search]              [tenant] [notif] [user]    │
│ 240px    ├──────────────────────────────────────────────────┤
│  or 64px ├──────────────────────────────────────────────────┤
│          │ CONTENT (neutral-50, padding space-24)            │
│  nav     │  PageHeader → sections → tables/forms             │
│          │                                                   │
└──────────┴──────────────────────────────────────────────────┘
```

---

## Sidebar layout

| Property | Value |
|----------|--------|
| Width expanded | **240px** |
| Width collapsed | **64px** (icons only) |
| Background | `neutral-0` |
| Border | `border-default` right |
| Nav item height | 40px |
| Nav gap | `space-4` between groups |

### Collapse rules

| Breakpoint | Behavior |
|------------|----------|
| desktop ≥769px | Expanded default; user may collapse to 64px (persist preference) |
| tablet 481–768px | Collapsed 64px default |
| mobile ≤480px | **Hidden**; open via hamburger → drawer overlay `z-drawer` |

**Alignment:** Nav labels left-aligned; icons 20px, `space-12` to label.

---

## Topbar layout

| Property | Value |
|----------|--------|
| Height | **56px** |
| Padding | `space-16` horizontal |
| Background | `neutral-0` |
| Border | bottom `border-default` |
| Left | Global search [Input](../components/INPUT.md) `md`, max 400px |
| Right | [Button](../components/BUTTON.md) ghost (help), tenant switcher, avatar menu |

**Spacing:** Right action cluster `Inline` gap `space-8`.

---

## Content area structure

### List page (default)

```
PageHeader (title, description, actions)
Flex filters (Select, Input search, Button secondary/primary)
PageSection
  Card
    Table (full width, sticky header if >20 rows)
Pagination (below Card, space-24 top)
```

### List + detail

| Pattern | Layout |
|---------|--------|
| **Drawer** | Table full width; row click opens drawer 480px right |
| **Master-detail** | Table 40% / detail panel 60% desktop ≥769px |

### Settings page

```
PageHeader
Stack PageSections
  container-sm (640px) FormLayout per section
FormActions: secondary Cancel + primary Save
```

---

## Form layout patterns

| Pattern | Desktop | Mobile ≤480 |
|---------|---------|-------------|
| **Single column** | `container-sm` Stack | full width |
| **Two column** | 12-col: fields span-6 pairs | collapse to single column |
| **Sectioned** | PageSection per group; `space-32` between | same, full width |

**Spacing:** Field gap `space-16`; label→input `space-8` ([FORM_LAYOUT](../components/FORM_LAYOUT.md)).

**Components:** [Input](../components/INPUT.md), [Select](../components/SELECT.md), [Alert](../components/ALERT.md) at form top for errors.

---

## Dashboard layout patterns

```
PageHeader "Dashboard"
Grid 12-col, gutter space-24
  KPI Card ×4 (span-3 each)
PageSection "Sales"
  Card span-8 (chart)
  Card span-4 (table / list)
```

| Element | Spacing |
|---------|---------|
| KPI row gap | `space-24` gutter |
| Section below KPI | `space-32` |
| Card padding | `space-24` |

**Components:** [Card](../components/CARD.md) `elevation="border"`; chart domain widget inside Card body.

---

## Responsive rules

| Tier | Sidebar | Content | Table |
|------|---------|---------|-------|
| mobile | drawer | `space-16` padding | horizontal scroll |
| tablet | 64px | `space-24` | scroll or hide cols |
| desktop | 240px | `space-24` | full columns |

**Typography:** Page title `font-size-2xl` desktop; `font-size-xl` mobile ([TYPOGRAPHY_TOKENS](../tokens/TYPOGRAPHY_TOKENS.md)).

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| Inventory: PageHeader + filters + Table Card | Custom 200px sidebar on one page |
| Settings in `container-sm` | Full-width 12-col form for 3 fields |
| One primary in PageHeader | Two primaries “Save” and “Create” |
| Drawer 480px for row detail | New window for detail |

---

## Repo examples

`app/(dashboard)/inventory`, `catalog/`, `staff/`, `franchise-hq/`
