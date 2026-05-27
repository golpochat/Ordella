# Animation Tokens

Motion durations, easing, and usage rules. Keep motion **subtle** on operational UIs; richer motion allowed on **marketing-ui** only.

**Related:** [STEP_2 — Components](../STEP_2_COMPONENTS.md) · `tailwindcss-animate` in `apps/shared-ui/tailwind.preset.cjs`

**Accessibility:** Respect `prefers-reduced-motion: reduce`—see rules below.

---

## Durations

| Token | ms | Use |
|-------|-----|-----|
| `duration-fast` | 100ms | Hover color, icon opacity, focus ring |
| `duration-normal` | 200ms | Dropdown open, tab indicator, button press |
| `duration-slow` | 300ms | Modal enter/exit, drawer slide, large layout shift |

**Rules**

- No UI transition longer than **`duration-slow`** except marketing hero (max 500ms with approval).  
- `kds-ui` ticket status changes: **`duration-fast`** or instant—kitchen needs immediacy.  
- `pos-ui` payment state: **`duration-normal`** max.

---

## Easing curves

| Token | CSS value | Use |
|-------|-----------|-----|
| `ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Most UI transitions |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements exiting (fade out) |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering (fade in, slide in) |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Drawers, modals |
| `ease-linear` | `linear` | Progress bars, indeterminate loaders only |

---

## Usage guidelines

### Hover

| Property | Token |
|----------|-------|
| Background / border color | `duration-fast` + `ease-default` |
| Scale transform | **Avoid** on admin-ui; never on pos-ui tiles |
| Link underline | `duration-fast` |

**Example (text):** admin-ui secondary button hover background `secondary-100` over `duration-fast`.

### Focus

| Property | Token |
|----------|-------|
| Ring appearance | `duration-fast` |
| Outline | Instant (0ms) acceptable for a11y |

**Rule:** Focus must be visible without relying on motion alone.

### Transitions (state change)

| Pattern | Duration | Easing |
|---------|----------|--------|
| Accordion expand | `duration-normal` | `ease-in-out` |
| Tab panel fade | `duration-normal` | `ease-out` |
| Toast enter | `duration-normal` | `ease-out` |
| Toast exit | `duration-fast` | `ease-in` |
| Skeleton shimmer | `duration-slow` loop | `ease-linear` |

### Modals / drawers

| Pattern | Duration | Easing |
|---------|----------|--------|
| Modal backdrop fade | `duration-normal` | `ease-out` |
| Modal scale/fade in | `duration-normal` | `ease-out` |
| Drawer slide | `duration-slow` | `ease-in-out` |
| pos-ui full-screen sheet | `duration-normal` | `ease-out` |

---

## Reduced motion

When `prefers-reduced-motion: reduce`:

| Rule | Behavior |
|------|----------|
| Transitions | Set to `0ms` or remove transform |
| Modals | Instant show/hide; keep focus trap |
| marketing-ui hero | Static; no parallax |
| kds-ui / pos-ui | No slide animations on tickets |

---

## Module rules

| Module | Motion level |
|--------|----------------|
| admin-ui | `fast` / `normal` only |
| pos-ui / kds-ui | Minimal; status = instant or `fast` |
| driver-ui | `normal` for sheet navigation |
| storefront-ui / customer-ui | `normal` for cart drawer |
| marketing-ui | `slow` allowed for hero; still honor reduced motion |

---

## Examples (text only)

| Do | Don’t |
|----|--------|
| Dropdown: opacity + translate 4px, `duration-normal`, `ease-out` | 600ms bounce on menu |
| Modal: fade `duration-normal` | Modal spin-in 1s |
| kds-ui ticket → “Ready”: instant border color | Slow pulse on every ticket |
| Hover link: color `duration-fast` | Scale 1.05 on table rows |

---

## Cross-reference: component motion

| Component | Enter | Exit |
|-----------|-------|------|
| Toast | `duration-normal` `ease-out` | `duration-fast` `ease-in` |
| Modal | `duration-normal` | `duration-normal` |
| Dropdown | `duration-normal` | `duration-fast` |
| Tooltip | `duration-fast` | `duration-fast` |

Implement via shared primitives in [STEP_2](../STEP_2_COMPONENTS.md)—not per-app keyframes.

Return to [STEP_1 — Foundations](../STEP_1_FOUNDATIONS.md) · [OVERVIEW](../OVERVIEW.md)
