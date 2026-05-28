# Ordella Design System (ODS) — Overview

**ODS** is the single source of truth for how Ordella looks and behaves across product surfaces. It defines **tokens** (type, color, space, radius, elevation), **components**, **layout patterns**, **module templates**, and **QA rules** so every UI feels like one platform—not seven unrelated apps.

**Related:** [Brand visual identity](../brand/VISUAL_IDENTITY.md) · [Brand component styles](../brand/COMPONENT_STYLES.md) · [Implementation guide](./IMPLEMENTATION_GUIDE.md)

**Implementation homes (today):** `packages/ui` · `apps/shared-ui` · per-app `globals.css` (convergence in progress)

---

## What ODS is

ODS is **documentation plus shared implementation**—not a Figma file alone. It translates [brand guidelines](../brand/BRAND_OVERVIEW.md) into enforceable rules: which button variant to use on a destructive inventory action, how much space sits between a `PageHeader` and a data table, and which breakpoints `pos-ui` must honor on a 1024×768 lane display.

ODS does **not** replace product UX research or domain workflows. It ensures that when two teams build a “settings” page—one in `admin-ui`, one in `customer-app`—users recognize Ordella instantly and engineers ship faster with shared primitives.

**Out of scope for ODS docs:** API design, copy/voice ([Voice and Tone](../brand/VOICE_AND_TONE.md)), or marketing narrative ([website copy](../website/copy/homepage.md))—though tokens align.

---

## Goals: consistency, speed, quality

| Goal | ODS delivers |
|------|----------------|
| **Consistency** | Same primary color semantics, spacing scale, and component anatomy everywhere |
| **Speed** | Reuse `Button`, `DataTable`, `PageHeader` instead of one-off CSS per screen |
| **Quality** | WCAG AA contrast, touch targets on POS/KDS, visual QA checklists before “done” |

**Consistency** means a “success” toast in `driver-app` matches `admin-ui`. **Speed** means new `admin-ui` list pages use the admin layout template without redesigning the sidebar. **Quality** means no screen ships with random `margin: 13px` or ad-hoc hex colors outside tokens.

---

## Mandatory adoption by UI module

Every listed UI **must** consume ODS tokens and components (via `shared-ui` / `packages/ui` as implemented). Custom CSS is limited to layout composition using ODS primitives—**no inline styles**, no one-off hex in components.

| Module | Repo path | ODS focus |
|--------|-----------|-----------|
| **admin-ui** | `apps/admin-ui` | Dense data, sidebar shell, tables, forms |
| **customer-ui** | `apps/customer-app` | Account, orders, loyalty—consumer clarity |
| **storefront-ui** | `apps/storefront` | Browse, PDP, cart, checkout |
| **marketing-ui** | `apps/marketing` | Hero, sections, prose, CTA |
| **driver-ui** | `apps/driver-app` | Mobile-first, list/detail, status |
| **kds-ui** | `apps/kds-ui` | Full-screen tickets, color-coded SLA |
| **pos-ui** | `apps/pos-ui` | Touch, fixed chrome, cart + grid |

**supplier-ui** and other apps should align when they touch retailer-facing flows; prioritize the seven above for launch QA.

Until tokens fully converge, each app maps local CSS variables to ODS names in PR descriptions ([STEP_1](./STEP_1_FOUNDATIONS.md) migration table).

---

## Refactor execution (`/design-system/refactor`)

| File | Contents |
|------|----------|
| [refactor/OVERVIEW.md](./refactor/OVERVIEW.md) | Phases, refactor-complete definition, module plan index |
| [STRATEGY.md](./refactor/STRATEGY.md) · [CODING_GUIDELINES.md](./refactor/CODING_GUIDELINES.md) · [PR_CHECKLIST.md](./refactor/PR_CHECKLIST.md) | Branching, code rules, PR gate |
| `*_REFACTOR_PLAN.md` | Per-module screen order, files, done criteria |

Use with [migration](./migration/OVERVIEW.md) and [visual QA](./visual-qa/OVERVIEW.md) when implementing refactors.

---

## Visual QA (`/design-system/visual-qa`)

| File | Contents |
|------|----------|
| [visual-qa/OVERVIEW.md](./visual-qa/OVERVIEW.md) | Purpose, ODS layer connection, design-complete, visual vs functional defects |
| [GLOBAL_VISUAL_QA_CHECKLIST.md](./visual-qa/GLOBAL_VISUAL_QA_CHECKLIST.md) | Alignment, spacing, type, color, components, responsive, a11y |
| [MODULE_SPECIFIC_QA.md](./visual-qa/MODULE_SPECIFIC_QA.md) | Per-UI checks (all 7 modules) |
| [SCREEN_REVIEW_TEMPLATE.md](./visual-qa/SCREEN_REVIEW_TEMPLATE.md) | Per-screen sign-off |
| [BEFORE_AFTER_EXAMPLES.md](./visual-qa/BEFORE_AFTER_EXAMPLES.md) | Text before/after by module |

STEP_5 summarizes QA; **visual-qa specs are authoritative** for review and sign-off.

---

## Module templates (`/design-system/module-templates`)

| File | Contents |
|------|----------|
| [module-templates/OVERVIEW.md](./module-templates/OVERVIEW.md) | Purpose, token/component/layout connection, mandatory templates, approval rules |
| Per-UI `*_TEMPLATE.md` | admin, pos, kds, driver, storefront, customer, marketing shells and page patterns |

STEP_4 summarizes templates; **module template specs are authoritative** for per-app screens.

---

## Layout system (`/design-system/layout`)

| File | Contents |
|------|----------|
| [layout/OVERVIEW.md](./layout/OVERVIEW.md) | Purpose, tokens + components connection, mandatory use, goals |
| [BREAKPOINTS.md](./layout/BREAKPOINTS.md) · [GRID_SYSTEM.md](./layout/GRID_SYSTEM.md) · … | Breakpoints, grids, containers, primitives, module rules, responsive behavior |

STEP_3 summarizes layout; **layout specs are authoritative** for grids, containers, and module shells.

---

## Component library (`/design-system/components`)

| File | Contents |
|------|----------|
| [components/OVERVIEW.md](./components/OVERVIEW.md) | Library purpose, token consumption, mandatory use, no one-offs |
| [BUTTON.md](./components/BUTTON.md) · [INPUT.md](./components/INPUT.md) · … | Per-component anatomy, variants, a11y, do/don’t |

STEP_2 summarizes components; **component specs are authoritative** for implementation and QA.

---

## Token reference (`/design-system/tokens`)

| File | Contents |
|------|----------|
| [TYPOGRAPHY_TOKENS.md](./tokens/TYPOGRAPHY_TOKENS.md) | Families, sizes (xs–3xl), weights, responsive type |
| [SPACING_TOKENS.md](./tokens/SPACING_TOKENS.md) | 4px grid, scale 2–48px, padding/margin/rhythm |
| [COLOR_TOKENS.md](./tokens/COLOR_TOKENS.md) | Palettes, semantic, surfaces, dark placeholders |
| [RADIUS_TOKENS.md](./tokens/RADIUS_TOKENS.md) | sm / md / lg / full |
| [SHADOW_TOKENS.md](./tokens/SHADOW_TOKENS.md) | none / sm / md / lg / brand |
| [BREAKPOINT_TOKENS.md](./tokens/BREAKPOINT_TOKENS.md) | mobile–wide, POS/KDS viewports |
| [Z_INDEX_TOKENS.md](./tokens/Z_INDEX_TOKENS.md) | Layering for sticky, dropdown, modal, toast |
| [ANIMATION_TOKENS.md](./tokens/ANIMATION_TOKENS.md) | Durations, easing, motion rules |

STEP_1 summarizes foundations; token files are the **authoritative name + value** list for implementation.

---

## ODS document map

| Step | File | Contents |
|------|------|----------|
| 1 | [STEP_1_FOUNDATIONS.md](./STEP_1_FOUNDATIONS.md) | Type, space, color, elevation, radius, borders |
| 2 | [STEP_2_COMPONENTS.md](./STEP_2_COMPONENTS.md) | Buttons, inputs, tables, modals, etc. |
| 3 | [STEP_3_LAYOUT_SYSTEM.md](./STEP_3_LAYOUT_SYSTEM.md) | Grid, breakpoints, Stack/Flex/PageHeader |
| 4 | [STEP_4_MODULE_LAYOUT_TEMPLATES.md](./STEP_4_MODULE_LAYOUT_TEMPLATES.md) | Per-app shells and page patterns |
| 5 | [STEP_5_VISUAL_QA_RULES.md](./STEP_5_VISUAL_QA_RULES.md) | Checklists and design-complete definition |
| — | [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) | Migration order and compliance checklist |
| — | [refactor/OVERVIEW.md](./refactor/OVERVIEW.md) | Refactor execution plans per module |

---

## Link to implementation guidelines

Engineers and designers start here:

1. Read [STEP_1_FOUNDATIONS.md](./STEP_1_FOUNDATIONS.md) — install/token mapping in app `globals.css` or shared preset (`apps/shared-ui/tailwind.preset.cjs`).  
2. Use components per [STEP_2_COMPONENTS.md](./STEP_2_COMPONENTS.md) — import from `@ordella/ui` / `apps/shared-ui` where available.  
3. Apply layout per [STEP_3](./STEP_3_LAYOUT_SYSTEM.md) + correct template in [STEP_4](./STEP_4_MODULE_LAYOUT_TEMPLATES.md).  
4. Run [visual QA](./visual-qa/OVERVIEW.md) ([global checklist](./visual-qa/GLOBAL_VISUAL_QA_CHECKLIST.md) + [module QA](./visual-qa/MODULE_SPECIFIC_QA.md)) before marking Jira/design-complete.  
5. Follow migration priorities in [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md).

**Rule:** If a pattern is missing from ODS, **propose an ODS addition**—do not fork a one-off component in a single app without design review.

---

## Relationship to brand

ODS operationalizes [Visual Identity](../brand/VISUAL_IDENTITY.md). Brand owns story and palette intent; ODS owns **token names**, **component APIs**, and **per-module templates**. Conflicts resolve in favor of documented ODS after brand sign-off.

**Canonical product primary (target):** `primary-600` `#0F766E` — marketing currently uses `#3A6DFF` until migration ([brand note](../brand/VISUAL_IDENTITY.md)).
