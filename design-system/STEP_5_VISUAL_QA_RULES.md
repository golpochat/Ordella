# ODS Step 5 — Visual QA Rules

Checklists for reviewers and engineers before marking a screen **design-complete**. All checks assume [STEP_1](./STEP_1_FOUNDATIONS.md)–[STEP_4](./STEP_4_MODULE_LAYOUT_TEMPLATES.md) are the source of truth.

**Related:** [Visual QA specs](./visual-qa/OVERVIEW.md) · [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) · [Brand visual identity](../brand/VISUAL_IDENTITY.md)

> **Authoritative detail:** See `/design-system/visual-qa/*.md` for full global/module checklists, screen review template, and before/after examples.

---

## Global visual QA checklist

Run on every screen in every module.

| # | Check | Pass criteria |
|---|--------|----------------|
| 1 | **8px grid** | All spacing values are ODS tokens (`space-1`–`space-16`); no 5px, 10px, 13px, etc. |
| 2 | **Section spacing** | Between PageSections: `space-8`; inside sections: `space-4`–`space-6` |
| 3 | **Typography tokens** | Only `display-*`, `heading-*`, `body-*`, `caption`, `code-*`; no arbitrary `text-[14px]` |
| 4 | **Components only** | Buttons, inputs, tables, cards, modals match [STEP_2](./STEP_2_COMPONENTS.md); no one-off styled divs acting as buttons |
| 5 | **No inline styles** | No `style={{}}` except documented exceptions (e.g. third-party map embed) |
| 6 | **Color tokens** | No raw hex in components; semantic colors for status, not arbitrary reds/greens |
| 7 | **Primary count** | ≤1 primary button per header/modal footer |
| 8 | **Responsive** | Layout matches breakpoint rules in [STEP_3](./STEP_3_LAYOUT_SYSTEM.md) at `xs`, `md`, `lg` minimum |
| 9 | **Focus & errors** | Keyboard focus visible; form errors have text, not color alone |
| 10 | **Empty & loading** | Empty states have message + CTA; loading shows skeleton or spinner + label |

**Fail any item → not design-complete.**

---

## Per-module QA notes

### admin-ui (`apps/admin-ui`)

| Focus | Rule |
|-------|------|
| Shell | Sidebar + topbar present; content padding `space-6` |
| Tables | Sticky header on long lists; actions column icon-only |
| Forms | Settings pages ≤640px when single-column |
| Density | Prefer `body-sm` in tables; `body-md` in forms |
| Don’t | POS-sized buttons; marketing hero typography |

**Spot-check routes:** inventory, catalog, staff, franchise-hq dashboards.

---

### pos-ui (`apps/pos-ui`)

| Focus | Rule |
|-------|------|
| Touch | All tap targets ≥ 44px; payment actions `lg` |
| Layout | Product grid + cart split; no sidebar |
| Scroll | Only product grid scrolls; cart/actions fixed |
| Modals | Payment flows full-screen sheet |
| Don’t | Admin table density; small link-style CTAs for Pay |

---

### kds-ui (`apps/kds-ui`)

| Focus | Rule |
|-------|------|
| Contrast | Status readable at 3m; label + color |
| Grid | Ticket cards min 280px; gutter 16px |
| Motion | Status change visible; avoid subtle-only cues |
| Time | Overdue uses warning/error tokens per SLA doc |
| Don’t | Marketing shadows; narrow mobile-first columns |

---

### driver-ui (`apps/driver-app`)

| Focus | Rule |
|-------|------|
| Default | Design reviewed at 375×812 (`xs`) first |
| CTA | Primary action sticky bottom with safe-area |
| Cards | Full-width list cards `space-3` gap |
| Don’t | Desktop-only hover affordances; tiny text in maps overlay |

---

### storefront-ui (`apps/storefront`)

| Focus | Rule |
|-------|------|
| Width | Content max 1280px centered |
| Commerce | PDP grid collapses to single column on `xs` |
| Cart | Sticky checkout on mobile |
| Don’t | Admin sidebar; POS keypad sizing |

---

### customer-ui (`apps/customer-app`)

| Focus | Rule |
|-------|------|
| Parity | Tokens match storefront-ui (shared preset) |
| Account | Order list uses Card + badge pattern |
| Forms | Profile/settings max 640px |
| Don’t | Marketing-only display-xl in account settings |

---

### marketing-ui (`apps/marketing`)

| Focus | Rule |
|-------|------|
| Hero | display-lg/xl + one primary CTA |
| Sections | `space-12`+ between major sections |
| Prose | Max ~72ch for long copy blocks |
| Brand | Copy aligned with [brand voice](../brand/VOICE_AND_TONE.md) |
| Don’t | Admin data tables; POS touch sizing |

---

## How to review a screen (design-complete workflow)

1. **Identify module** → open matching template in [STEP_4](./STEP_4_MODULE_LAYOUT_TEMPLATES.md).  
2. **Screenshot at required breakpoints** (module minimum from STEP_3).  
3. **Run global checklist** (table above)—mark pass/fail per row.  
4. **Run module checklist**—mark pass/fail.  
5. **Compare to reference route** in repo if one exists (listed in STEP_4).  
6. **Log issues** with token/component name: e.g. “Replace custom `.btn-blue` with Button variant primary”.  
7. **Sign-off** when all global + module checks pass and PR uses shared components or approved local wrappers.

### Design-complete definition

A screen is **design-complete** when:

- It uses the correct module layout template.  
- All spacing and type are ODS tokens.  
- All interactive UI is ODS components (or tracked wrapper with parity ticket).  
- QA checklist is attached (comment in PR or screenshot grid).  
- No open “visual debt” items except filed follow-ups with ticket IDs.

Next: [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
