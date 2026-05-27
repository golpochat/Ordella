# ODS Component Library — Overview

The **Ordella Component Library** is the canonical specification for interactive UI building blocks used across all product surfaces. It turns [design tokens](../tokens/) into composable, accessible patterns with fixed variants—no ad-hoc styling per screen.

**Related:** [ODS overview](../OVERVIEW.md) · [STEP_2 summary](../STEP_2_COMPONENTS.md) · [IMPLEMENTATION_GUIDE](../IMPLEMENTATION_GUIDE.md) · `packages/ui` · `apps/shared-ui`

---

## Purpose

| Goal | How the library helps |
|------|------------------------|
| **Consistency** | Same `Button`, `Input`, and `Table` anatomy in `admin-ui` and `storefront-ui` |
| **Speed** | Engineers import documented variants instead of reinventing markup |
| **Quality** | Built-in states (focus, error, loading), a11y rules, and QA alignment with [STEP_5](../STEP_5_VISUAL_QA_RULES.md) |

The library documents **what** each component is and **how** to use it. Implementation targets `packages/ui` and `apps/shared-ui`; apps consume via import, not copy-paste.

---

## How components consume design tokens

Every component maps props to token names—never raw hex or pixel literals in app code.

| Concern | Token source |
|---------|----------------|
| Color, borders | [COLOR_TOKENS](../tokens/COLOR_TOKENS.md) |
| Type | [TYPOGRAPHY_TOKENS](../tokens/TYPOGRAPHY_TOKENS.md) |
| Space, gap | [SPACING_TOKENS](../tokens/SPACING_TOKENS.md) |
| Radius | [RADIUS_TOKENS](../tokens/RADIUS_TOKENS.md) |
| Shadow | [SHADOW_TOKENS](../tokens/SHADOW_TOKENS.md) |
| Breakpoints | [BREAKPOINT_TOKENS](../tokens/BREAKPOINT_TOKENS.md) |
| Z-index, motion | [Z_INDEX_TOKENS](../tokens/Z_INDEX_TOKENS.md) · [ANIMATION_TOKENS](../tokens/ANIMATION_TOKENS.md) |

**Rule:** A component variant is a **named bundle of tokens** (e.g. `Button` `variant="primary"` → `primary-600` bg, `font-size-sm`, `radius-sm`). Changing a token updates all consumers after preset release.

---

## Mandatory use across UIs

These modules **must** use ODS components (or approved wrappers that delegate to them):

| Module | Repo | Priority components |
|--------|------|---------------------|
| **admin-ui** | `apps/admin-ui` | Table, Form layout, Modal, Button, Input, Select |
| **customer-ui** | `apps/customer-app` | Card, Input, Button, Alert |
| **storefront-ui** | `apps/storefront` | Card, Button, Input, Badge |
| **marketing-ui** | `apps/marketing` | Button, Card, Layout primitives |
| **driver-ui** | `apps/driver-app` | Button, Card, Toast, Badge |
| **kds-ui** | `apps/kds-ui` | Badge, Card, Alert (minimal set) |
| **pos-ui** | `apps/pos-ui` | Button (`lg`), Input (`lg`), Modal sheet |

Domain widgets (POS numpad, KDS ticket board) **wrap** ODS primitives internally—they are not exceptions to token rules.

---

## Rules: no custom one-off components

| Allowed | Not allowed |
|---------|-------------|
| Import `Button` with `variant` / `size` | New `<button className="…">` with unique colors per page |
| `Card` + `Stack` composition | Bordered `div` styled as a card with custom padding |
| Wrapper that passes props to ODS `Input` | Forked input with different border radius |
| Propose new ODS component via design review | Ship one-off component in single app without ODS doc |

**Exception process:** Open ODS proposal → add spec under `/design-system/components/` → implement in `packages/ui` → then use in apps.

**Also forbidden:** Inline styles (`style={{}}`), arbitrary Tailwind values (`p-[13px]`, `text-[#3366ff]`) on interactive UI.

---

## Component index

| Component | Spec |
|-----------|------|
| Button | [BUTTON.md](./BUTTON.md) |
| Input | [INPUT.md](./INPUT.md) |
| Select | [SELECT.md](./SELECT.md) |
| Table | [TABLE.md](./TABLE.md) |
| Card | [CARD.md](./CARD.md) |
| Modal | [MODAL.md](./MODAL.md) |
| Tabs | [TABS.md](./TABS.md) |
| Alert | [ALERT.md](./ALERT.md) |
| Toast | [TOAST.md](./TOAST.md) |
| Badge | [BADGE.md](./BADGE.md) |
| Form layout | [FORM_LAYOUT.md](./FORM_LAYOUT.md) |
| Layout primitives | [LAYOUT_PRIMITIVES.md](./LAYOUT_PRIMITIVES.md) |

---

## Implementation map

| Layer | Location |
|-------|----------|
| Spec (this folder) | `/design-system/components/*.md` |
| Tokens | `/design-system/tokens/*.md` |
| Shared preset | `apps/shared-ui/tailwind.preset.cjs` |
| React components | `packages/ui` (target) |

Start with [BUTTON.md](./BUTTON.md) and [LAYOUT_PRIMITIVES.md](./LAYOUT_PRIMITIVES.md) when scaffolding a new page.
