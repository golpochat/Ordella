# ODS Step 3 — Layout System

Page widths, grid, layout primitives, breakpoints, and alignment. Applies to all modules in [OVERVIEW](./OVERVIEW.md).

**Related:** [Layout system specs](./layout/OVERVIEW.md) · [STEP_1_FOUNDATIONS.md](./STEP_1_FOUNDATIONS.md) · [STEP_4 templates](./STEP_4_MODULE_LAYOUT_TEMPLATES.md)

> **Authoritative detail:** See `/design-system/layout/*.md` for breakpoints, grid, containers, primitives, module rules, and responsive behavior.

---

## Page container widths

| Context | Max width | Horizontal padding |
|---------|-----------|-------------------|
| **admin-ui content** | fluid (fills shell) | `space-6` (24px) |
| **admin-ui narrow forms** | 640px centered in content | same |
| **customer-ui / storefront-ui** | 1280px | `space-4` mobile, `space-6` desktop |
| **marketing-ui** | 1280px content / 1440px outer | `space-6` mobile, `space-8` desktop |
| **driver-ui** | 100% mobile | `space-4` |
| **pos-ui / kds-ui** | 100% viewport | `space-3`–`space-4` safe areas |

**Rule:** Do not exceed 1280px for readable commerce content; admin data tables may use full width.

---

## Grid system

### Desktop (admin-ui, marketing-ui, storefront)

| Property | Value |
|----------|--------|
| Columns | 12 |
| Gutter | 24px (`space-6`) |
| Margin (page) | 24px minimum |

**Example:** Dashboard KPI row = 4× `col-span-3` cards; catalog filters `col-span-12`, table `col-span-12`.

### Commerce product grid (storefront-ui, pos-ui)

| Breakpoint | Columns | Gutter |
|------------|---------|--------|
| mobile | 2 | 12px |
| tablet | 3–4 | 16px |
| desktop / POS | 4–6 | 16–24px |

### kds-ui

| Property | Value |
|----------|--------|
| Columns | fluid card grid (min 280px card) |
| Gutter | 16px |
| Full viewport height | 100vh minus header |

---

## Layout primitives

Use named patterns in code (implement as shared layout components):

| Primitive | Purpose | Rules |
|-----------|---------|--------|
| **Stack** | Vertical flex column | `gap` = ODS space tokens only |
| **Flex** | Horizontal row | `align-items` explicit; `gap` tokenized |
| **Grid** | Responsive columns | 12-col or auto-fill per above |
| **PageHeader** | Title + description + actions | `space-8` below before content |
| **PageSection** | Titled block | `heading-sm` + `space-6` inner stack |

### PageHeader anatomy (text)

```
[heading-lg Title                    ] [ghost] [secondary] [primary]
[body-sm neutral-600 Description     ]
──────────────────────────────────────  (optional border-b border-default)
```

**admin-ui reference:** `app/(dashboard)/layout.tsx` content area—mirror with ODS spacing.

### PageSection anatomy

```
heading-sm Section title
Stack gap space-4
  … fields or table …
```

---

## Responsive breakpoints

| Token | Min width | Primary consumers |
|-------|-----------|-------------------|
| `xs` | 0 | driver-ui default |
| `sm` | 640px | customer-ui large phone |
| `md` | 768px | tablet storefront, collapsed admin sidebar optional |
| `lg` | 1024px | admin-ui sidebar fixed; POS landscape min |
| `xl` | 1280px | marketing, storefront max-width |
| `2xl` | 1536px | marketing hero optional |

### POS / KDS fixed resolutions (design targets)

| Device | Resolution | Notes |
|--------|------------|--------|
| POS landscape | 1024×768 | `pos-ui` primary QA |
| POS portrait | 768×1024 | support but optimize landscape |
| KDS display | 1920×1080 or 1280×720 | `kds-ui` full-screen grid |
| KDS tablet | 1024×768 | min 3 columns tickets |

**Rule:** Touch targets ≥ 44×44px at `md` and below for operational UIs ([STEP_2](./STEP_2_COMPONENTS.md) button `lg` on POS).

---

## Alignment rules

| Rule | Specification |
|------|----------------|
| **Text** | LTR: left-align body; right-align numeric table columns |
| **Actions** | PageHeader actions right-aligned in LTR; stack below title on `xs` |
| **Vertical rhythm** | Section gaps `space-8`; within section `space-4`–`space-6` |
| **Center** | marketing-ui heroes and empty states only—not admin tables |
| **Sticky** | admin-ui table headers; pos-ui cart footer; kds-ui column headers |

**Example (admin-ui):** Inventory list—filters left-aligned in Flex row; “Export” secondary right; table full bleed inside PageSection.

**Example (driver-ui):** Task list—cards full width Stack `space-3`; primary CTA fixed bottom bar `space-4` padding safe-area.

Next: [STEP_4_MODULE_LAYOUT_TEMPLATES.md](./STEP_4_MODULE_LAYOUT_TEMPLATES.md)
