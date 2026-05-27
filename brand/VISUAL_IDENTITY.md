# Ordella Visual Identity

Documentation for color, type, layout, iconography, illustration, and motion. **No asset files live in this folder**—see `packages/ui/assets/` for logo SVGs and app themes for implementation.

**Related:** [Logo Guidelines](./LOGO_GUIDELINES.md) · [Component Styles](./COMPONENT_STYLES.md) · [Public docs branding](../docs/public/_config/branding.md) · `apps/marketing/app/globals.css`

---

## Design principles

<!-- Placeholder: Visual expression of brand personality. -->

1. **Clarity** — Hierarchy readable at a glance; dense data still scannable.  
2. **Calm confidence** — Strong contrast without visual noise.  
3. **Operational trust** — UI feels tool-grade, not consumer-flashy.  
4. **Consistency** — Same tokens across marketing, docs, and product (convergence in progress).

> **Note:** Marketing (`apps/marketing`) and public docs (`docs/public/_config/branding.md`) may use different placeholder tokens until design tokens are unified in `packages/ui`. Treat this document as the target system; mark deltas in implementation PRs.

---

## Color palette

### Primary

<!-- Placeholder hex values — confirm with design before production lock. -->

| Token | Hex (placeholder) | Usage |
|-------|---------------------|--------|
| `primary-600` | `#0F766E` | Primary actions, links (docs canonical) |
| `primary-700` | `#0D9488` | Hover, emphasis |
| `primary-50` | `#F0FDFA` | Subtle backgrounds, highlights |

**Marketing alternate (current implementation):** `#3A6DFF` — `apps/marketing` `--color-primary`. Document migration path when consolidating.

### Secondary / accent

| Token | Hex (placeholder) | Usage |
|-------|---------------------|--------|
| `accent-500` | `#F59E0B` | Highlights, badges, charts accent series |
| `accent-600` | `#D97706` | Hover on accent elements |

### Neutrals

| Token | Hex (placeholder) | Usage |
|-------|---------------------|--------|
| `neutral-900` | `#0F1A2A` | Primary text (marketing navy) |
| `neutral-600` | `#6B7280` | Secondary text |
| `neutral-200` | `#E5E7EB` | Borders, dividers |
| `neutral-50` | `#F4F6F8` | Page backgrounds |
| `white` | `#FFFFFF` | Cards, surfaces |

### Semantic

| Token | Hex (placeholder) | Usage |
|-------|---------------------|--------|
| `success` | `#2ECC71` | Positive states |
| `warning` | `#FFB020` | Caution, pending |
| `danger` | `#FF6B6B` | Errors, destructive |

### Accessibility

- Body text on white: minimum **4.5:1** contrast (WCAG AA).  
- Large headings and UI chrome: **3:1** minimum for non-text UI components.  
- Do not rely on color alone for status; pair with icon + label.

---

## Typography system

### Font families (placeholder)

| Role | Family | Fallback stack |
|------|--------|----------------|
| Headings | Inter | `system-ui, sans-serif` |
| Body | Inter | `system-ui, sans-serif` |
| UI / dense tables | Inter | `system-ui, sans-serif` |
| Code | JetBrains Mono, Fira Code | `ui-monospace, monospace` |

### Type scale (example)

| Token | Size / line | Use |
|-------|-------------|-----|
| `display-lg` | 48px / 1.1 | Marketing hero |
| `heading-xl` | 36px / 1.2 | Page titles |
| `heading-lg` | 24px / 1.3 | Section titles |
| `heading-md` | 20px / 1.4 | Card titles |
| `body-md` | 16px / 1.5 | Body copy |
| `body-sm` | 14px / 1.5 | UI labels, tables |
| `caption` | 12px / 1.4 | Meta, timestamps |

### Rules

- Sentence case for UI labels and doc headings unless brand lockup.  
- Max line length ~72ch for marketing prose; full width for data tables.  
- Tabular figures for numeric columns in dashboards.

---

## Spacing and grid

### Base unit

**4px** grid; spacing tokens are multiples of 4.

| Token | Value | Example use |
|-------|-------|-------------|
| `space-1` | 4px | Tight icon padding |
| `space-2` | 8px | Inline gaps |
| `space-4` | 16px | Card padding |
| `space-6` | 24px | Section gaps |
| `space-8` | 32px | Block spacing |
| `space-12` | 48px | Marketing section rhythm |

### Layout grids

| Surface | Columns | Max width |
|---------|---------|-----------|
| Marketing | 12 col | 1280px content, 1440px outer |
| Docs | 12 col sidebar + content | ~960px article |
| Product app | 12 col fluid | Full viewport with sidebar |

### Radius and elevation (placeholder)

| Token | Value | Use |
|-------|-------|-----|
| `radius-sm` | 6px | Inputs, chips |
| `radius-md` | 12px | Cards |
| `radius-lg` | 16px | Modals, screenshots |
| `shadow-brand` | See `globals.css` | Marketing cards, frames |

---

## Iconography style

<!-- Placeholder: No icon font specified in repo yet. -->

- **Style:** Outlined, 1.5–2px stroke, rounded caps; filled variants only for active/selected states.  
- **Grid:** 24×24px default; 20×20 in dense tables; 16×16 inline with body-sm.  
- **Color:** Inherit `currentColor`; semantic colors only for status icons.  
- **Metaphor:** Prefer universal retail/ops symbols (location, cart, package, chart)—avoid playful or cartoon icons in admin UI.

**Example labels (accessibility):**  
`aria-label="Inventory"` not `aria-label="icon"`.

---

## Illustration style

<!-- Placeholder: For marketing and empty states. -->

- **Approach:** Abstract system diagrams and isometric retail flows—not character mascots.  
- **Palette:** Primary + neutrals + one accent; no rainbow gradients.  
- **Line weight:** Consistent with icon stroke (~2px).  
- **Use cases:** Hero supporting art, empty states (“No webhooks yet”), architecture explainer panels on **ordella.com**.  
- **Docs:** Prefer Mermaid/architecture diagrams per [branding.md](../docs/public/_config/branding.md).

---

## Motion and animation

### Principles

- **Purposeful** — Motion explains state change (open panel, success), not decoration.  
- **Fast** — Default 150–250ms for UI; 300–400ms for large surfaces.  
- **Respectful** — Honor `prefers-reduced-motion`; provide instant fallbacks.

### Tokens (placeholder)

| Token | Duration | Easing |
|-------|----------|--------|
| `motion-fast` | 150ms | `ease-out` |
| `motion-base` | 200ms | `ease-in-out` |
| `motion-slow` | 300ms | `ease-in-out` |

### Allowed

- Fade/slide for drawers and modals.  
- Skeleton loaders for tables and cards.  
- Subtle scale on marketing CTA hover (≤ 1.02).

### Avoid

- Parallax-heavy marketing without reduced-motion variant.  
- Infinite distracting loops in product UI.  
- Bouncy elastic easing in admin workflows.

---

## Implementation references

| System | Location |
|--------|----------|
| Marketing CSS variables | `apps/marketing/app/globals.css` |
| Shared logo components | `packages/ui/src/components/logo.tsx` |
| Docs branding summary | `docs/public/_config/branding.md` |
| UI package (future tokens) | `packages/ui/src/themes/` |

---

## Token convergence checklist

- [ ] Single source of truth for `--color-primary` across marketing and apps  
- [ ] Dark mode tokens documented (placeholder: TBD)  
- [ ] Figma ↔ CSS token export pipeline (TBD)  
