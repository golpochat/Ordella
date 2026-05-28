# driver-ui Refactor Plan

**Repo:** `apps/driver-app` · **Template:** [DRIVER_UI_TEMPLATE](../module-templates/DRIVER_UI_TEMPLATE.md)

---

## Key views

| View | Routes / files |
|------|----------------|
| Job list | `app/(driver)/tasks/page.tsx`, `components/tasks-list.tsx`, `components/order-card.tsx` |
| Job detail | `app/(driver)/task/[taskId]/page.tsx`, `components/task-detail.tsx` |
| Navigation / status | `app/(driver)/navigation/page.tsx`, `components/navigation-view.tsx` |
| Orders board | `app/(driver)/orders/page.tsx`, `components/orders-board.tsx` |
| Profile | `app/(driver)/profile/page.tsx`, `components/profile-view.tsx` |
| Shell | `app/(driver)/layout.tsx`, `components/driver-header.tsx`, `driver-bottom-nav.tsx` |
| Proof of delivery | `components/proof-of-delivery-form.tsx` |

---

## Refactor order

| Order | View |
|-------|------|
| 1 | `(driver)/layout.tsx` — [MobileListLayout](../layout/LAYOUT_PRIMITIVES.md#mobilelistlayout-driver-ui) |
| 2 | Tasks list + order cards |
| 3 | Task detail + bottom CTA bar |
| 4 | Proof of delivery form |
| 5 | Navigation (map placeholder) |
| 6 | Profile + bottom nav alignment |

---

## Per view execution

| Step | Action |
|------|--------|
| 1 | Mobile-first: design QA at **375×812** |
| 2 | List: [Card](../components/CARD.md) Stack `space-12` |
| 3 | Detail: PageHeader with back; sections `space-32` |
| 4 | Bottom bar: sticky primary full width + safe-area |
| 5 | Status: [Badge](../components/BADGE.md) + text |
| 6 | Map slot: min 200px; ODS chrome only around embed |
| 7 | Offline [Alert](../components/ALERT.md) when applicable |
| 8 | Visual QA PASS — driver module |

---

## Done criteria (driver-ui)

- [ ] All primary actions in bottom bar on detail views  
- [ ] No admin [Table](../components/TABLE.md)—cards only  
- [ ] List + detail PASS at 375px width  
- [ ] Token parity with shared preset  
- [ ] tasks + task detail routes design-complete  

**Estimated effort:** 1–2 weeks.
