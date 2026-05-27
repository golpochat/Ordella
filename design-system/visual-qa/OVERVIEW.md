# ODS Visual QA — Overview

**Visual QA** is the gate every Ordella screen passes before it is marked **design-complete**. It verifies that implementation matches [tokens](../tokens/), [components](../components/OVERVIEW.md), [layout](../layout/OVERVIEW.md), and [module templates](../module-templates/OVERVIEW.md)—not merely that features work.

**Related:** [STEP_5 summary](../STEP_5_VISUAL_QA_RULES.md) · [IMPLEMENTATION_GUIDE](../IMPLEMENTATION_GUIDE.md) · [Brand visual identity](../../brand/VISUAL_IDENTITY.md)

---

## Purpose

| Goal | Visual QA ensures |
|------|-------------------|
| **Consistency** | The same spacing, type, and components across admin-ui and storefront-ui |
| **Quality** | No drift (random px, one-off buttons, broken grids) ships to production |
| **Speed** | Reviewers use checklists instead of subjective “looks fine” |
| **Launch readiness** | Module templates are actually followed on real routes |

Visual QA is run by **designers and engineers** at PR review and before marking tickets done.

---

## Connection to ODS layers

```
Tokens (values)
    ↓ verified in GLOBAL checklist — colors, type, space
Layout + module templates (structure)
    ↓ verified in GLOBAL + MODULE_SPECIFIC
Components (UI blocks)
    ↓ verified in GLOBAL component rules + SCREEN_REVIEW
```

| Layer | QA doc section |
|-------|----------------|
| [Tokens](../tokens/) | Typography, color, spacing sections in [GLOBAL_VISUAL_QA_CHECKLIST](./GLOBAL_VISUAL_QA_CHECKLIST.md) |
| [Layout](../layout/OVERVIEW.md) | Alignment, responsiveness, containers |
| [Components](../components/OVERVIEW.md) | Variants, states, no one-offs |
| [Module templates](../module-templates/OVERVIEW.md) | [MODULE_SPECIFIC_QA](./MODULE_SPECIFIC_QA.md) |

---

## Why every screen must pass before “design-complete”

A screen marked **design-complete** tells product and launch teams that:

1. The correct **module template** is applied (e.g. pos-ui SplitLayout, not admin sidebar).  
2. **ODS tokens** are used—no visual debt filed as “fix later.”  
3. **Responsive** and **fixed POS/KDS** viewports are verified.  
4. **Accessibility basics** (focus, touch, contrast) are met for that surface.

**Rule:** Functional completion ≠ design-complete. A working API with ad-hoc CSS **fails** visual QA.

**Evidence:** PR comment, screenshot grid, or completed [SCREEN_REVIEW_TEMPLATE](./SCREEN_REVIEW_TEMPLATE.md) attached to the ticket.

---

## Visual defects vs functional defects

| Type | Definition | Examples | Blocks design-complete? |
|------|------------|----------|-------------------------|
| **Visual defect** | UI does not match ODS tokens, components, layout, or template | 13px margin; custom blue button; missing PageHeader; table not scrolling on mobile | **Yes** |
| **Functional defect** | Behavior broken; ODS may be correct | Submit fails; wrong data in row; crash on click | **No** (but blocks release) |
| **Hybrid** | Wrong component choice causes both | Div styled as button doesn’t fire keyboard | Fix as visual + a11y |

| Visual (fix ODS) | Functional (fix logic) |
|------------------|------------------------|
| Two primary buttons on header | Save button doesn’t persist |
| `space-13` gap between cards | Sort returns wrong order |
| Red border only on invalid field | Validation regex incorrect |
| pos-ui 32px Pay button | Payment API timeout |
| kds-ui status color without label | Bump sends wrong station id |

**QA focus:** This folder covers **visual** defects only. Log functional issues separately; do not waive visual failures because “it works.”

---

## Document map

| File | Use when |
|------|----------|
| [GLOBAL_VISUAL_QA_CHECKLIST.md](./GLOBAL_VISUAL_QA_CHECKLIST.md) | Every screen, every module |
| [MODULE_SPECIFIC_QA.md](./MODULE_SPECIFIC_QA.md) | After global pass, for the target UI |
| [SCREEN_REVIEW_TEMPLATE.md](./SCREEN_REVIEW_TEMPLATE.md) | Per-screen sign-off record |
| [BEFORE_AFTER_EXAMPLES.md](./BEFORE_AFTER_EXAMPLES.md) | Training and PR comments |

---

## Design-complete definition (authoritative)

A screen is **design-complete** when:

- [GLOBAL_VISUAL_QA_CHECKLIST](./GLOBAL_VISUAL_QA_CHECKLIST.md) — all items **pass**.  
- [MODULE_SPECIFIC_QA](./MODULE_SPECIFIC_QA.md) — all items for that UI **pass**.  
- [SCREEN_REVIEW_TEMPLATE](./SCREEN_REVIEW_TEMPLATE.md) — completed with **PASS** and reviewer name.  
- Correct [module template](../module-templates/OVERVIEW.md) identified and matched.  
- No open visual defects; follow-ups have ticket IDs and are not launch-blocking only if explicitly waived by design lead.

Next: [GLOBAL_VISUAL_QA_CHECKLIST.md](./GLOBAL_VISUAL_QA_CHECKLIST.md)
