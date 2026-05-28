# Refactor PR Checklist

Copy into every ODS refactor pull request. Reviewer must verify all **required** items before merge.

**Related:** [visual QA global](../visual-qa/GLOBAL_VISUAL_QA_CHECKLIST.md) · [visual QA module](../visual-qa/MODULE_SPECIFIC_QA.md) · [CODING_GUIDELINES](./CODING_GUIDELINES.md)

---

## PR metadata

| Field | Value |
|-------|--------|
| Module | admin-ui / pos-ui / … |
| Screen(s) / flow | |
| Ticket | |
| Template | Link to [module-templates](../module-templates/) |

---

## Author checklist (required)

### ODS compliance

- [ ] **ODS components only** — no new one-off buttons/inputs/cards ([components/OVERVIEW](../components/OVERVIEW.md))
- [ ] **Tokens only** — spacing, color, type from [tokens](../tokens/); no magic numbers ([CODING_GUIDELINES](./CODING_GUIDELINES.md))
- [ ] **Module layout template** — correct shell ([module-templates](../module-templates/OVERVIEW.md))
- [ ] **Layout primitives** — Stack/Flex/Grid/PageHeader where applicable ([layout](../layout/OVERVIEW.md))
- [ ] **No inline styles** — except documented exceptions

### Behavior

- [ ] **Behavior unchanged** — same user flows unless ticket scopes logic change
- [ ] **No unrelated refactors** — diff limited to ODS migration for listed screens

### Visual QA

- [ ] **Global visual QA** — [GLOBAL_VISUAL_QA_CHECKLIST](../visual-qa/GLOBAL_VISUAL_QA_CHECKLIST.md) PASS
- [ ] **Module visual QA** — [MODULE_SPECIFIC_QA](../visual-qa/MODULE_SPECIFIC_QA.md) PASS for this UI
- [ ] **Screen review** — [SCREEN_REVIEW_TEMPLATE](../visual-qa/SCREEN_REVIEW_TEMPLATE.md) attached or linked

### Responsive / viewports

| Viewport | Tested |
|----------|--------|
| mobile ≤480px | ☐ / N/A |
| tablet 481–768px | ☐ / N/A |
| desktop 769+ | ☐ |
| POS 1024×768 | ☐ / N/A |
| POS 1280×800 | ☐ / N/A |
| KDS 1920×1080 | ☐ / N/A |
| driver 375×812 | ☐ / N/A |

- [ ] **Tables** — scroll or stack correctly on narrow widths
- [ ] **No unintended horizontal page scroll**

### Evidence

- [ ] Screenshots or short screen recording for each required viewport
- [ ] Progress tracker updated (per [migration/OVERVIEW](../migration/OVERVIEW.md))

---

## Reviewer guidelines

| Check | Action if fail |
|-------|----------------|
| Arbitrary `px` or hex in diff | Request token mapping |
| New `button` / `div` with Tailwind colors | Request `Button` component |
| Wrong module shell (e.g. sidebar on pos) | Request template fix per [refactor plan](./OVERVIEW.md) |
| Two primary buttons in header | Request secondary/ghost swap |
| Missing error text on forms | Request [INPUT](../components/INPUT.md) pattern |
| QA not attached | Block merge until SCREEN_REVIEW PASS |
| Scope creep | Ask author to split PR |

**Reviewer does not** need to re-run full app regression—focus on ODS compliance and listed routes.

### Reviewer sign-off

| | |
|-|-|
| Reviewer | |
| Date | |
| Result | Approve / Request changes |
| Visual QA verified | Yes / No |

---

## Merge criteria

| Result | Meaning |
|--------|---------|
| **Approve** | All required boxes checked; visual QA PASS |
| **Request changes** | Any required fail; re-review after fix |

**Do not merge** with “PASS WITH DEBT” for launch-blocking screens unless design lead documents waiver + ticket.

---

## Example PR title

```
refactor(admin-ui): inventory list — ODS Table + PageHeader
```

## Example PR note

```
Visual QA: GLOBAL PASS, MODULE admin PASS
Screenshots: mobile + desktop attached
Tracker: inventory → design-complete
```
