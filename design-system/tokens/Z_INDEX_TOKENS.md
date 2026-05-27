# Z-Index Tokens

Layering system for stacking contexts across Ordella UIs. Use **only** these values—no arbitrary `z-index: 9999`.

**Related:** [STEP_2 — Components](../STEP_2_COMPONENTS.md) · [SHADOW_TOKENS](./SHADOW_TOKENS.md) · [ANIMATION_TOKENS](./ANIMATION_TOKENS.md)

---

## Layering scale

| Token | Value | Layer | Usage |
|-------|-------|-------|--------|
| `z-base` | 0 | Base content | Default document flow |
| `z-raised` | 10 | Raised content | Cards with sticky internal headers (rare) |
| `z-sticky` | 100 | Sticky headers | admin-ui table header, pos-ui cart header, marketing nav |
| `z-dropdown` | 200 | Dropdowns | Select menus, popovers, autocomplete, tooltips |
| `z-drawer` | 300 | Drawers | admin-ui filter drawer, mobile nav drawer |
| `z-modal` | 400 | Modals | Dialog panels, confirm destructive |
| `z-overlay` | 350 | Overlays | Scrim behind modal (below panel, above page) |
| `z-toast` | 500 | Toasts | Global notifications (above modals) |
| `z-max` | 600 | Emergency | Full-screen blocking loader only—requires comment in PR |

**Note:** `z-overlay` (350) sits **below** `z-modal` (400) so modal content stacks above scrim. Drawer and modal should not be open simultaneously—if required, modal wins.

---

## Usage by UI pattern

### Base content

- Default stacking; new stacking context only when needed (transform/filters).  
- **admin-ui** dashboard cards: `z-base`.

### Sticky headers

| Surface | Token |
|---------|-------|
| admin-ui data table thead | `z-sticky` |
| pos-ui top bar + cart column header | `z-sticky` |
| marketing-ui navbar (sticky) | `z-sticky` |
| driver-ui app bar | `z-sticky` |

**Rule:** Sticky element must have opaque background (`background-elevated`) to avoid content bleed-through.

### Dropdowns

| Surface | Token |
|---------|-------|
| Select list | `z-dropdown` |
| Date picker popover | `z-dropdown` |
| User menu in topbar | `z-dropdown` |

**Rule:** Parent with `overflow: hidden` breaks dropdowns—fix layout, do not raise z-index ad hoc.

### Modals

| Element | Token |
|---------|-------|
| Scrim | `z-overlay` |
| Panel | `z-modal` |
| Nested confirm inside modal | Same `z-modal` layer; swap content, don’t stack modals |

**pos-ui:** Full-screen payment sheet uses `z-modal` for panel; scrim optional on secondary steps.

### Toasts

| Surface | Token |
|---------|-------|
| Global toast stack | `z-toast` |
| Inline alert in form | `z-base` (no z-index) |

**driver-ui:** Toasts bottom-center mobile; still `z-toast`.

### Overlays

| Surface | Token |
|---------|-------|
| Modal backdrop | `z-overlay` |
| kds-ui “connection lost” banner | `z-sticky` or `z-toast`—not `z-max` unless blocking |

---

## Module notes

| Module | Typical max token |
|--------|-------------------|
| admin-ui | `z-modal`, `z-toast` |
| pos-ui | `z-modal` for payment; avoid dropdowns over modal |
| kds-ui | `z-sticky` header; minimal overlays |
| driver-ui | `z-sticky` app bar + `z-toast` |
| marketing-ui | `z-sticky` nav + `z-modal` for demo request |

---

## Examples (text only)

| Do | Don’t |
|----|--------|
| Toast after save: `z-toast` | `z-index: 99999` on toast |
| Modal scrim `z-overlay`, panel `z-modal` | Scrim above panel |
| Table sticky header `z-sticky` + solid bg | Transparent sticky header |
| Close dropdown before opening modal | Dropdown `z-dropdown` visible under modal |

Next: [ANIMATION_TOKENS.md](./ANIMATION_TOKENS.md)
