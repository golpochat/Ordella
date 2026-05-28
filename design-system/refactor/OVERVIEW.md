# ODS Refactor Execution Plan — Overview

The **ODS Refactor** plan turns migration documentation into **how teams execute** refactors in code: phases, per-module screen lists, PR gates, and coding rules. Migration defines *what* to achieve; refactor defines *how to ship it* safely.

**Related:** [migration](../migration/OVERVIEW.md) · [visual QA](../visual-qa/OVERVIEW.md) · [IMPLEMENTATION_GUIDE](../IMPLEMENTATION_GUIDE.md) · [ODS overview](../OVERVIEW.md)

---

## Purpose

| Goal | Refactor plan delivers |
|------|------------------------|
| **Predictability** | Same prepare → refactor → verify → ship cycle per screen |
| **Safety** | Incremental PRs; behavior unchanged unless scoped |
| **Traceability** | Module plans list routes and likely files |
| **Quality** | Visual QA required before merge |

Refactor docs do **not** replace product specs—they constrain **UI structure and tokens** only.

---

## Connection to ODS layers

```
Tokens          →  replace hex/px in touched files
Components      →  replace div-buttons, custom inputs
Layout          →  Stack/Flex/Grid, containers, breakpoints
Module templates→  correct shell per app (sidebar vs split vs mobile list)
Migration       →  screen checklist + order ([migration](../migration/OVERVIEW.md))
Visual QA       →  verify before design-complete ([visual QA](../visual-qa/OVERVIEW.md))
Refactor (here) →  execution: branches, PRs, module screen order
```

| Layer | Doc |
|-------|-----|
| [Tokens](../tokens/) | [CODING_GUIDELINES](./CODING_GUIDELINES.md) |
| [Components](../components/OVERVIEW.md) | Module plans + [PR_CHECKLIST](./PR_CHECKLIST.md) |
| [Layout](../layout/OVERVIEW.md) | [STRATEGY](./STRATEGY.md), module plans |
| [Module templates](../module-templates/OVERVIEW.md) | Each `*_REFACTOR_PLAN.md` |
| [Migration](../migration/OVERVIEW.md) | [SCREEN_MIGRATION_CHECKLIST](../migration/SCREEN_MIGRATION_CHECKLIST.md) if present; else visual-qa screen template |
| [Visual QA](../visual-qa/OVERVIEW.md) | Every plan ends with QA + sign-off |

---

## Definition of “refactor complete”

### Screen level

A screen is **refactor complete** (same as migration **design-complete**) when:

1. Correct [module template](../module-templates/OVERVIEW.md) applied.  
2. ODS [tokens](../tokens/) only—no magic numbers for space/type/color.  
3. ODS [components](../components/OVERVIEW.md) only—no one-off interactive UI.  
4. [Global](../visual-qa/GLOBAL_VISUAL_QA_CHECKLIST.md) + [module](../visual-qa/MODULE_SPECIFIC_QA.md) visual QA **PASS**.  
5. [SCREEN_REVIEW_TEMPLATE](../visual-qa/SCREEN_REVIEW_TEMPLATE.md) attached to PR or ticket.  
6. Tested at module-required viewports ([layout/BREAKPOINTS](../layout/BREAKPOINTS.md)).

### Module level

A module is **refactor complete** when:

- App shell (`layout.tsx`) matches module template.  
- **100%** of in-scope routes in that module’s refactor plan are screen-complete.  
- Shared module components (e.g. `pos-top-bar.tsx`) use ODS.  
- No new PRs introduce non-ODS spacing or one-off buttons in that app.  
- Module row marked complete in team progress tracker (see [migration/OVERVIEW](../migration/OVERVIEW.md)).

**Out of scope** until explicitly added: auth-only stubs, feature-flagged experiments, third-party iframe-only pages.

---

## High-level phases

| Phase | Activities | Output |
|-------|------------|--------|
| **1. Prepare** | Map preset to tokens; identify screen type; pick template; branch | Refactor ticket + file list |
| **2. Refactor** | Shell → layout primitives → tokens → components | PR with focused diff |
| **3. Verify** | Visual QA checklists; viewport screenshots; a11y smoke | PASS on screen review |
| **4. Ship** | Merge; update progress tracker; deploy staging → prod | Screen design-complete |

See [STRATEGY](./STRATEGY.md) for branching and rollout.

---

## Module refactor plans

| Module | Plan |
|--------|------|
| admin-ui | [ADMIN_UI_REFACTOR_PLAN](./ADMIN_UI_REFACTOR_PLAN.md) |
| pos-ui | [POS_UI_REFACTOR_PLAN](./POS_UI_REFACTOR_PLAN.md) |
| kds-ui | [KDS_UI_REFACTOR_PLAN](./KDS_UI_REFACTOR_PLAN.md) |
| driver-ui | [DRIVER_UI_REFACTOR_PLAN](./DRIVER_UI_REFACTOR_PLAN.md) |
| storefront-ui | [STOREFRONT_UI_REFACTOR_PLAN](./STOREFRONT_UI_REFACTOR_PLAN.md) |
| customer-ui | [CUSTOMER_UI_REFACTOR_PLAN](./CUSTOMER_UI_REFACTOR_PLAN.md) |
| marketing-ui | [MARKETING_UI_REFACTOR_PLAN](./MARKETING_UI_REFACTOR_PLAN.md) |

**Shared:** [CODING_GUIDELINES](./CODING_GUIDELINES.md) · [PR_CHECKLIST](./PR_CHECKLIST.md)

---

## Execution order (summary)

Aligns with [migration plan](../migration/OVERVIEW.md); default order:

1. **marketing-ui** — fewest transactional states  
2. **admin-ui** — highest reuse of Table/Form patterns  
3. **storefront-ui** → **customer-ui** — shared commerce tokens  
4. **driver-ui** — mobile patterns  
5. **pos-ui** → **kds-ui** — operational complexity last  

**Phase 0 (once):** `apps/shared-ui/tailwind.preset.cjs` + `packages/ui` export ODS primitives before parallel module work.
