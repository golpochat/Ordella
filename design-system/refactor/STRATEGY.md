# Refactor Strategy

Execution rules for all ODS refactors across modules.

**Related:** [OVERVIEW](./OVERVIEW.md) · [PR_CHECKLIST](./PR_CHECKLIST.md) · [migration](../migration/OVERVIEW.md)

---

## Refactor principles

| Principle | Rule | Example |
|-----------|------|---------|
| **Incremental** | One screen or one shell per PR preferred; max one logical feature area | “Inventory list” PR, not “all admin-ui” |
| **No big-bang** | No freeze-week full rewrite | Phased route-by-route |
| **Behavior parity** | Refactor PRs do not change API contracts or business logic unless ticket says so | Same submit payload after Button swap |
| **Structure + visuals** | Goal is ODS compliance, not redesign | Keep field order; fix spacing/components |
| **ODS only** | Tokens + components + layout + template | See [CODING_GUIDELINES](./CODING_GUIDELINES.md) |
| **QA gate** | No merge without visual QA PASS | [PR_CHECKLIST](./PR_CHECKLIST.md) |

---

## Risk management

### Feature flags (where applicable)

| Use | When |
|-----|------|
| `ods_layout_v2` (example) | New shell behind flag for admin-ui staging |
| Per-route flag | High-traffic pos payment screen |

**Rules**

- Default **off** in production until QA PASS on staging.  
- Flag removes **layout/component** only—not feature behavior.  
- Remove flag within 2 sprints after 100% rollout.

### Staging vs production rollout

| Step | Action |
|------|--------|
| 1 | Merge to `main`; deploy **staging** |
| 2 | Run visual QA at required viewports on staging URL |
| 3 | Product/ops sign-off for operational UIs (pos, kds) |
| 4 | Promote to **production** during low-traffic window for pos/kds |
| 5 | Monitor errors; rollback via revert PR—not hotfix CSS |

### Regression scope per PR

| Must test | Optional |
|-----------|----------|
| Touched routes | Full app smoke |
| Primary user path of screen | Every edge case |
| One viewport up/down from target | — |

---

## Branch strategy

### Recommended: per-screen or per-shell branches

| Pattern | Branch name | Use |
|---------|-------------|-----|
| Screen | `refactor/admin-inventory-list` | Single route + components |
| Shell | `refactor/admin-dashboard-layout` | `app/(dashboard)/layout.tsx` only |
| Module epic | `refactor/pos-sale-flow` | home + cart + payment (related flow) |

**Avoid:** `refactor/ods-everything` on `main` direct commits.

### PR size targets

| Metric | Target |
|--------|--------|
| Files | ≤ 15 per PR |
| Lines | ≤ 400 LOC changed (excluding snapshots) |
| Screens | 1–2 routes |

Split large tables into: (1) shell + PageHeader, (2) table component swap.

### Merge order

1. `shared-ui` / `packages/ui` token or component additions  
2. App shell layout for module  
3. High-traffic screens  
4. Long tail settings pages  

---

## Dependencies between modules

```
shared-ui + packages/ui (Phase 0)
        ↓
marketing-ui (validates tokens on public site)
        ↓
admin-ui (Table, Form, PageHeader patterns in code)
        ↓
storefront-ui ──→ customer-ui (shared commerce)
        ↓
driver-ui
        ↓
pos-ui ──→ kds-ui (operational tokens, touch sizes)
```

**Rule:** Do not fork token names per app—extend preset once.

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| PR: “refactor(admin): inventory list ODS” | PR: “misc style fixes” |
| Staging QA screenshots in PR | Merge on “looks ok locally” |
| Revert component API misuse in same PR | Leave TODO buttons for later |
| Track screen in team progress sheet | Mark module done with 40% routes left |

Next: module plans · [PR_CHECKLIST](./PR_CHECKLIST.md)
