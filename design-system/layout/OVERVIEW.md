# ODS Layout System — Overview

The **Ordella Layout System (ODS Layout)** defines how pages, regions, and content are structured across all product UIs. It sits between **tokens** (spacing, breakpoints) and **components** (Button, Table, Card), providing shells, grids, containers, and primitives that every screen must compose from.

**Related:** [ODS overview](../OVERVIEW.md) · [STEP_3 summary](../STEP_3_LAYOUT_SYSTEM.md) · [STEP_4 module templates](../STEP_4_MODULE_LAYOUT_TEMPLATES.md) · [IMPLEMENTATION_GUIDE](../IMPLEMENTATION_GUIDE.md)

---

## Purpose

| Need | Layout system answer |
|------|----------------------|
| Where does content live? | Container max-widths and horizontal padding |
| How do columns behave? | 12 / 6 / 4 column grids with tokenized gutters |
| How do apps differ? | Module shells: SidebarLayout, SplitLayout, FullscreenLayout, etc. |
| When does layout change? | Breakpoint rules for typography, spacing, grids, navigation |

ODS Layout is **documentation-first**. Implementation targets shared layout components in `packages/ui` / `apps/shared-ui`, composed with [layout primitives in components](../components/LAYOUT_PRIMITIVES.md).

---

## Connection to tokens + components

```
Design tokens          Components              Layout
─────────────────────────────────────────────────────────
BREAKPOINT_TOKENS  →   Button, Input, Table  →  PageHeader
SPACING_TOKENS     →   Card, Modal           →  Stack / Grid
TYPOGRAPHY_TOKENS  →   Badge, Alert          →  SidebarLayout
COLOR_TOKENS       →   …                     →  Container widths
```

| Layer | Folder | Role |
|-------|--------|------|
| Tokens | [/design-system/tokens](../tokens/) | Values (px, cols, breakpoints) |
| Components | [/design-system/components](../components/) | Interactive UI blocks |
| **Layout** | `/design-system/layout/` | Page structure, grids, module shells |

**Rule:** Layout files reference token **names** only. Components are placed **inside** layout regions—never the reverse.

---

## Mandatory use across all UIs

Every module must use ODS Layout patterns (or wrappers that match these specs):

| UI | Repo | Primary layout doc |
|----|------|-------------------|
| **admin-ui** | `apps/admin-ui` | [MODULE_LAYOUT_RULES](./MODULE_LAYOUT_RULES.md#admin-ui) · SidebarLayout |
| **pos-ui** | `apps/pos-ui` | SplitLayout · fixed viewport |
| **kds-ui** | `apps/kds-ui` | FullscreenLayout |
| **driver-ui** | `apps/driver-app` | MobileListLayout |
| **storefront-ui** | `apps/storefront` | Container + product grid |
| **customer-ui** | `apps/customer-app` | Minimal Container + Stack |
| **marketing-ui** | `apps/marketing` | Container wide + section Stack |

Custom page shells per feature without layout review are **not allowed**.

---

## Goals

| Goal | How layout delivers |
|------|---------------------|
| **Consistency** | Same PageHeader anatomy in admin and storefront account pages |
| **Responsiveness** | Defined collapse: 12 → 6 → 4 columns; sidebar → drawer |
| **Alignment** | 4px/8px grid via [SPACING_TOKENS](../tokens/SPACING_TOKENS.md); no arbitrary margins |
| **Scalability** | Module rules extend without forking grid math per team |

---

## Document map

| File | Contents |
|------|----------|
| [BREAKPOINTS.md](./BREAKPOINTS.md) | Mobile through wide; POS/KDS viewports; responsive token rules |
| [GRID_SYSTEM.md](./GRID_SYSTEM.md) | 12 / 6 / 4 columns, gutters, spans, examples |
| [CONTAINERS.md](./CONTAINERS.md) | Widths, padding, fluid vs fixed |
| [LAYOUT_PRIMITIVES.md](./LAYOUT_PRIMITIVES.md) | Stack, Inline, Flex, Grid, shells |
| [MODULE_LAYOUT_RULES.md](./MODULE_LAYOUT_RULES.md) | Per-UI dimensions and patterns |
| [RESPONSIVE_BEHAVIOR.md](./RESPONSIVE_BEHAVIOR.md) | Cross-cutting adaptation rules |

Start with [BREAKPOINTS.md](./BREAKPOINTS.md) and [MODULE_LAYOUT_RULES.md](./MODULE_LAYOUT_RULES.md) for your app.
