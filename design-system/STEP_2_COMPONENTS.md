# ODS Step 2 — Components

Core component specifications for Ordella UIs. Implement via `packages/ui` and `apps/shared-ui`; until exported, apps mirror these specs in local components that **must** match token names from [STEP_1](./STEP_1_FOUNDATIONS.md).

**Related:** [Component library specs](./components/OVERVIEW.md) · [Brand component styles](../brand/COMPONENT_STYLES.md) · [OVERVIEW](./OVERVIEW.md)

> **Authoritative detail:** See `/design-system/components/*.md` for full anatomy, props, a11y, and examples per component.

**Rule:** No inline styles. Use Tailwind utilities mapped to ODS tokens or component variants only.

---

## Buttons

### Variants

| Variant | Background | Text | Border | Use |
|---------|------------|------|--------|-----|
| **primary** | `primary-600` | white | none | One primary action per view |
| **secondary** | `neutral-50` | `neutral-900` | `border-default` | Cancel adjacent to primary, filters |
| **ghost** | transparent | `primary-600` | none | Tertiary, toolbar icon+text |
| **destructive** | `error-500` | white | none | Delete, irreversible |

### Sizes

| Size | Height | Padding x | Font | Min touch (POS) |
|------|--------|-----------|------|-----------------|
| `sm` | 32px | 12px | `body-sm` | — |
| `md` | 40px | 16px | `body-sm` | 44px effective touch target |
| `lg` | 48px | 20px | `body-md` | **pos-ui default** |

### Rules

- **One** primary button per modal footer and page header action cluster.  
- Loading: show spinner + disable; label becomes “Saving…” not blank.  
- Icon-only buttons require `aria-label`.

**Do:** “Create location” (primary) + “Cancel” (secondary).  
**Don’t:** Two primaries; “Submit” with no context; destructive for “Back”.

---

## Inputs

### Types

| Type | Height | Padding | Font | Notes |
|------|--------|---------|------|-------|
| text, email, password | 40px | `space-3` `space-4` | `body-md` | Full width in forms |
| number | 40px | same | tabular-nums | POS qty uses `lg` 48px |
| select | 40px | same | `body-md` | Chevron icon trailing |
| textarea | min 96px | `space-4` | `body-md` | Resize vertical only |

### States

- **Default:** `border-default`, bg `neutral-0`  
- **Focus:** `border-focus` ring  
- **Error:** `error-500` border + error text `caption` below  
- **Disabled:** `neutral-100` bg, `neutral-400` text, no pointer

---

## Form patterns

| Element | Rule |
|---------|------|
| **Label** | `body-sm` font-medium; above field; `space-2` gap |
| **Required** | “(required)” or `*` with legend for accessibility |
| **Help text** | `caption` `neutral-600`; `space-1` below label or above input per pattern |
| **Error** | `caption` `error-500`; never color-only |
| **Field group gap** | `space-4` between fields; `space-6` between sections |

**admin-ui example:** Settings → “Tax ID” label, help “Shown on invoices”, input, optional error.  
**pos-ui example:** Discount code — single field + large “Apply” secondary beside it.

---

## Cards

| Property | Value |
|----------|--------|
| Padding | `space-4` (dense admin) or `space-6` |
| Radius | `radius-md` |
| Border | `border-default` OR `shadow-sm` — not both heavy |
| Title | `heading-md` |
| Description | `body-sm` `neutral-600` |

**Use:** Group related fields, dashboard KPIs, storefront-ui product tiles (with image slot).

---

## Tables

| Property | Rule |
|----------|------|
| Header | `body-sm` font-medium `neutral-600`; sticky on scroll >20 rows |
| Cell | `body-sm`; numeric columns right-align tabular-nums |
| Row height | 40px min (admin); 48px touch-friendly optional |
| Zebra | optional `neutral-50` on even rows |
| Actions | Icon buttons ghost; avoid wide “Actions” text columns |

**admin-ui:** `app/(dashboard)/inventory` style lists.  
**Don’t:** Custom grid pretending to be table without header semantics.

---

## Modals / drawers

| Type | Width | Use |
|------|-------|-----|
| **modal-sm** | 400px | Confirmations |
| **modal-md** | 560px | Forms |
| **modal-lg** | 720px | Complex editors |
| **drawer** | 480px right | Filters, detail peek admin-ui |

**Anatomy:** title `heading-md` → body → footer with secondary left, primary right.  
**POS:** prefer full-screen sheets over small modals for cart edits.

---

## Tabs

- Underline or pill style—**one style per app**, not mixed.  
- Active tab: `primary-600` indicator; inactive `neutral-600`.  
- Panel padding top: `space-6`.  
- **admin-ui:** catalog sections, report periods.

---

## Badges / chips

| Type | Style |
|------|--------|
| **badge-neutral** | `neutral-100` bg, `caption` |
| **badge-success/warning/error** | semantic-50 bg + semantic-500 text |
| **chip** | `radius-full`, `space-2` `space-3` padding, removable × optional |

**kds-ui:** order age badges (e.g. “12m”) use warning/error semantic rules + text.

---

## Alerts / toasts

| Type | Placement | Duration |
|------|-----------|----------|
| **Alert (inline)** | Top of form/section | persistent until fixed |
| **Toast** | top-right desktop; bottom mobile driver-ui | 5s; errors persist |

**Content:** `body-sm` message + optional action link; destructive toasts only for failures.

---

## Usage guidelines (global)

1. Import shared components before copying markup.  
2. Compose with layout primitives ([STEP_3](./STEP_3_LAYOUT_SYSTEM.md))—not raw div stacks with magic margins.  
3. Domain-specific widgets (e.g. POS numpad) **wrap** ODS buttons/inputs internally.  
4. Dark mode: use shared `darkMode: class` tokens when enabled—no separate hex sets per app.

---

## Do / don’t examples (text)

| Do | Don’t |
|----|-------|
| Primary “Save changes” + secondary “Cancel” | “OK” + “Submit” |
| Table empty state: message + primary “Add item” | Empty table, no CTA |
| Error: “Enter a valid email address.” | Red border only |
| POS keypad keys `size lg` 48px | 32px keys for cashiers |
| kds-ui status: color + “OVERDUE” label | Red row only |

Next: [STEP_3_LAYOUT_SYSTEM.md](./STEP_3_LAYOUT_SYSTEM.md)
