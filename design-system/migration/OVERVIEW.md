# ODS Migration Plan — Overview

The **ODS Migration Plan** is the execution roadmap for moving every Ordella screen from legacy/ad-hoc UI to the Ordella Design System. It connects documentation layers into a repeatable per-screen workflow ending in **design-complete**.

**Related:** [ODS overview](../OVERVIEW.md) · [IMPLEMENTATION_GUIDE](../IMPLEMENTATION_GUIDE.md) · [visual QA](../visual-qa/OVERVIEW.md)

---

## Purpose

| Without migration plan | With migration plan |
|------------------------|---------------------|
| Teams refactor inconsistently | Same 10-step screen checklist everywhere |
| “Mostly done” modules ship with outliers | **No screen left behind** tracked in [PROGRESS_TRACKER](./PROGRESS_TRACKER.md) |
| Visual debt accumulates | Every screen passes [visual QA](../visual-qa/GLOBAL_VISUAL_QA_CHECKLIST.md) before sign-off |

Migration is **documentation and process**—implementation remains in `packages/ui`, `apps/shared-ui`, and per-app routes.

---

## How migration connects ODS layers

```
Phase 0 (once): map apps/shared-ui preset → tokens
        ↓
Per screen:
  module template → layout primitives → components (all use tokens)
        ↓
  visual QA → design-complete
        ↓
  logged in PROGRESS_TRACKER
```

| Layer | Folder | Migration use |
|-------|--------|----------------|
| [Tokens](../tokens/) | Values for spacing, type, color, radius, shadow | Replace hex and arbitrary px |
| [Components](../components/OVERVIEW.md) | Button, Input, Table, … | Replace one-off markup |
| [Layout](../layout/OVERVIEW.md) | Grid, containers, breakpoints | Replace ad-hoc page structure |
| [Module templates](../module-templates/OVERVIEW.md) | Per-app shells and page patterns | Pick correct template first |
| [Visual QA](../visual-qa/OVERVIEW.md) | Global + module checklists | Gate before design-complete |

**Rule:** Migrate **top-down** (template → layout → tokens on page → components), not “buttons only” while layout stays legacy.

---

## Definition of “migration complete”

### Screen level — **design-complete**

A screen is migration-complete when:

1. Correct [module template](../module-templates/OVERVIEW.md) applied.  
2. All spacing, typography, and colors use [tokens](../tokens/).  
3. All interactive UI uses [ODS components](../components/OVERVIEW.md) (or approved wrappers).  
4. [SCREEN_MIGRATION_CHECKLIST](./SCREEN_MIGRATION_CHECKLIST.md) — all steps **PASS**.  
5. [Visual QA](../visual-qa/SCREEN_REVIEW_TEMPLATE.md) — global + module **PASS**.  
6. Row in [PROGRESS_TRACKER](./PROGRESS_TRACKER.md) = `design-complete`.

### Module level — **module migration complete**

A module (**admin-ui**, **pos-ui**, etc.) is complete when:

- App shell matches module template (sidebar, split, fullscreen, …).  
- **100%** of in-scope routes are `design-complete` in PROGRESS_TRACKER.  
- No new PRs introduce non-token spacing or custom one-off components.  
- Module row in tracker marked **complete** with sign-off date.

### Program level — **ODS migration complete**

All seven modules complete + shared preset is single source of truth + design lead sign-off.

---

## Migration principles

| Principle | Rule |
|-----------|------|
| **No screen left behind** | Every route in scope appears in [PROGRESS_TRACKER](./PROGRESS_TRACKER.md); no implicit “done” |
| **No custom components** | Use [components](../components/OVERVIEW.md); propose ODS addition instead of forking |
| **No ad-hoc spacing or typography** | Only [SPACING_TOKENS](../tokens/SPACING_TOKENS.md) and [TYPOGRAPHY_TOKENS](../tokens/TYPOGRAPHY_TOKENS.md) |
| **Every screen must pass visual QA** | [GLOBAL](../visual-qa/GLOBAL_VISUAL_QA_CHECKLIST.md) + [MODULE_SPECIFIC](../visual-qa/MODULE_SPECIFIC_QA.md) before design-complete |
| **One screen per PR when possible** | Vertical slices; easier QA and rollback |
| **Shell before leaves** | Migrate `layout.tsx` before leaf pages in each module |
| **No inline styles** | Except documented third-party embeds |

---

## Document map

| File | Purpose |
|------|---------|
| [MIGRATION_ORDER.md](./MIGRATION_ORDER.md) | Sequence, rationale, estimates, dependencies |
| [SCREEN_MIGRATION_CHECKLIST.md](./SCREEN_MIGRATION_CHECKLIST.md) | 10-step per-screen workflow |
| [MODULE_MIGRATION_GUIDES.md](./MODULE_MIGRATION_GUIDES.md) | Area-by-area guides per UI |
| [BEFORE_AFTER_EXAMPLES.md](./BEFORE_AFTER_EXAMPLES.md) | Migration examples per module |
| [PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md) | Status table and update instructions |

---

## Phase 0 (before module sequence)

Complete once before [MIGRATION_ORDER](./MIGRATION_ORDER.md) step 1:

| Task | Reference |
|------|-----------|
| Align `apps/shared-ui/tailwind.preset.cjs` to token names | [tokens](../tokens/) |
| Export or stub core components in `packages/ui` | [components](../components/OVERVIEW.md) |
| Document app → token mapping in PR template | [STEP_1](../STEP_1_FOUNDATIONS.md) |

Parallel module work **after** Phase 0 merges.

---

## Quick start

1. Read [MIGRATION_ORDER.md](./MIGRATION_ORDER.md) — know your module’s turn.  
2. Add screens to [PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md).  
3. Per screen: [SCREEN_MIGRATION_CHECKLIST.md](./SCREEN_MIGRATION_CHECKLIST.md).  
4. Module-specific tasks: [MODULE_MIGRATION_GUIDES.md](./MODULE_MIGRATION_GUIDES.md).  
5. Sign off with [visual QA](../visual-qa/SCREEN_REVIEW_TEMPLATE.md).
