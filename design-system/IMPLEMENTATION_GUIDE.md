# ODS Implementation Guide

How engineering teams migrate existing Ordella UIs to the Ordella Design System (ODS). Documentation only—implementation lives in `packages/ui`, `apps/shared-ui`, and per-app refactors.

**Start here after:** [OVERVIEW](./OVERVIEW.md) · [STEP_1](./STEP_1_FOUNDATIONS.md)–[STEP_5](./STEP_5_VISUAL_QA_RULES.md)

**Brand alignment:** [VISUAL_IDENTITY](../brand/VISUAL_IDENTITY.md) · [COMPONENT_STYLES](../brand/COMPONENT_STYLES.md)

---

## Migration principles

1. **Tokens before components** — Map `tailwind.preset.cjs` / CSS variables to STEP_1 names; remove hard-coded hex in app CSS.  
2. **Components before pages** — Replace ad-hoc buttons, inputs, tables, cards with shared or spec-matched wrappers.  
3. **Layout shell before inner pages** — Apply STEP_4 template per app (sidebar, POS split, kds grid) once per module.  
4. **One screen at a time** — Ship vertical slices; avoid repo-wide style-only PRs without behavior parity.  
5. **No inline styles** — Use Tailwind utilities bound to tokens; extract repeated patterns to components.

---

## Step-by-step migration

### 1. Replace ad-hoc UI with ODS components

| Legacy pattern | ODS replacement |
|----------------|-----------------|
| `<button className="bg-blue-600 …">` | `Button` variant `primary` |
| Custom `<input>` borders | `Input` + form field wrapper |
| Div-based tables | `Table` / DataTable pattern ([STEP_2](./STEP_2_COMPONENTS.md)) |
| Bordered div stacks | `Card` + `Stack` |
| Custom modal div | `Dialog` / `Sheet` per size tokens |
| `alert()` / random banners | `Alert` / toast system |

**admin-ui example:** Inventory export toolbar—replace three different button classes with `secondary` + `primary` pair.

**pos-ui example:** Payment footer—four equal `Button` `lg` variants instead of mixed heights.

### 2. Normalize spacing and typography

- Audit margins/padding: convert to `space-*` scale ([STEP_1](./STEP_1_FOUNDATIONS.md)).  
- Replace `text-sm` / `text-lg` with semantic classes (`body-sm`, `heading-md`) tied to preset.  
- Align PageHeader / PageSection gaps to STEP_3 (`space-8` below header).

### 3. Apply layout template per module

| App | Template doc section |
|-----|----------------------|
| admin-ui | [STEP_4 — admin-ui](./STEP_4_MODULE_LAYOUT_TEMPLATES.md#admin-ui-layout-template) |
| pos-ui | [STEP_4 — pos-ui](./STEP_4_MODULE_LAYOUT_TEMPLATES.md#pos-ui-layout-template) |
| kds-ui | [STEP_4 — kds-ui](./STEP_4_MODULE_LAYOUT_TEMPLATES.md#kds-ui-layout-template) |
| driver-ui | [STEP_4 — driver-ui](./STEP_4_MODULE_LAYOUT_TEMPLATES.md#driver-ui-layout-template) |
| storefront-ui, customer-ui | [STEP_4 — storefront/customer](./STEP_4_MODULE_LAYOUT_TEMPLATES.md#storefront-ui--customer-ui-templates) |
| marketing-ui | [STEP_4 — marketing](./STEP_4_MODULE_LAYOUT_TEMPLATES.md#marketing-ui-template) |

Refactor route layouts (`layout.tsx`) before leaf pages when possible.

---

## Recommended refactor order

| Order | UI | Why first |
|-------|-----|-----------|
| 1 | **shared-ui + packages/ui** | Single token + component source for all apps |
| 2 | **admin-ui** | Highest page count; establishes Table, Form, PageHeader patterns |
| 3 | **storefront-ui + customer-ui** | Shared commerce tokens; customer-app follows storefront |
| 4 | **marketing-ui** | Align public site with tokens; fewer transactional states |
| 5 | **pos-ui** | Revenue-critical; depends on stable Button/Input `lg` specs |
| 6 | **kds-ui** | Reuses POS operational tokens; smaller surface |
| 7 | **driver-ui** | Mobile patterns last; benefits from Card, badge, bottom CTA primitives |

Parallel work is allowed **after** step 1 merges—do not fork token names per app.

---

## Screen compliance checklist

Copy into PR description when claiming ODS compliance:

```
[ ] Correct module layout template (STEP_4)
[ ] Spacing uses only ODS space tokens
[ ] Typography uses only ODS type tokens
[ ] Buttons/inputs/tables/cards/modals match STEP_2 variants
[ ] ≤1 primary action per header/modal footer
[ ] Semantic colors for status (no random hex)
[ ] No inline styles
[ ] Responsive check at module breakpoints (STEP_3)
[ ] Global QA checklist passed (STEP_5)
[ ] Module-specific QA checklist passed (STEP_5)
```

**Optional evidence:** Before/after screenshots at `xs` + `lg` (or POS 1024×768 for pos-ui / kds-ui).

---

## Shared implementation map (repo)

| Asset | Path |
|-------|------|
| Tailwind preset | `apps/shared-ui/tailwind.preset.cjs` |
| UI package | `packages/ui` (target home for ODS components) |
| Marketing globals | `apps/marketing/app/globals.css` (migrate tokens to preset) |
| Admin shell | `apps/admin-ui/app/(dashboard)/layout.tsx` |
| Driver shell | `apps/driver-app/app/(driver)/layout.tsx` |

When preset and STEP_1 diverge, **update preset in the same PR** as doc change or file a blocking issue—do not document values that production cannot use.

---

## Handling exceptions

| Exception | Process |
|-----------|---------|
| Third-party widget (maps, payments) | Isolate wrapper; document in PR; no ODS tokens inside vendor iframe |
| Chart libraries | Use neutral axis/label tokens; file ticket to wrap in ODS chart skin |
| Legacy page not yet migrated | Banner in code comment `// ODS-TODO: screen-name` + linked issue |

---

## Definition of done (module level)

A module (**admin-ui**, **pos-ui**, etc.) is **ODS-compliant** when:

- Layout shell matches STEP_4.  
- ≥90% of interactive screens pass STEP_5 global checklist (tracked in launch or eng board).  
- No new PRs introduce non-token spacing or one-off button styles.  
- `tailwind.preset.cjs` is the only source of color/type/radius for that app.

Return to [OVERVIEW](./OVERVIEW.md) for scope and goals.
