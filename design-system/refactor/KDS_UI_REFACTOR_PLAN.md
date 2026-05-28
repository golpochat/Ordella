# kds-ui Refactor Plan

**Repo:** `apps/kds-ui` · **Template:** [KDS_UI_TEMPLATE](../module-templates/KDS_UI_TEMPLATE.md)

---

## Key views

| View | Files |
|------|-------|
| Order grid (board) | `app/(kds)/board/page.tsx`, `components/fds-board.tsx` |
| Order card | `components/fds-order-card.tsx` (or `kds` equivalent) |
| Header / filters | `components/fds-header.tsx`, `components/kds-header.tsx`, `fds-settings-modal.tsx` |
| Shell | `app/(kds)/layout.tsx`, `app/page.tsx` |

---

## Refactor order

| Order | View |
|-------|------|
| 1 | `(kds)/layout.tsx` + [FullscreenLayout](../layout/LAYOUT_PRIMITIVES.md#fullscreenlayout-kds-ui) |
| 2 | Header + station filters |
| 3 | Order card component (status, timer, actions) |
| 4 | Board grid (auto-fill min 280px) |
| 5 | Settings modal |

---

## Per view execution

| Step | Action |
|------|--------|
| 1 | Full-screen grid; vertical scroll ticket area only |
| 2 | Card min **280×180px**; gutter `space-16` |
| 3 | Status: label + [COLOR_TOKENS](../tokens/COLOR_TOKENS.md) semantic bg |
| 4 | Timers: [Badge](../components/BADGE.md) `warning` / `error` with text (“8m”, “OVERDUE”) |
| 5 | Bump/Complete [Button](../components/BUTTON.md) `lg` |
| 6 | `shadow-none` on cards |
| 7 | QA at **1920×1080** landscape |
| 8 | [MODULE_SPECIFIC_QA](../visual-qa/MODULE_SPECIFIC_QA.md) kds PASS |

---

## Done criteria (kds-ui)

- [ ] 4–6 columns at 1080p; readable at 3m distance  
- [ ] Every ticket has text status label  
- [ ] Landscape-only; no portrait mobile layout  
- [ ] No marketing shadows  
- [ ] Module refactor complete on board + card + header  

**Estimated effort:** 1–2 weeks (smaller surface than pos).
