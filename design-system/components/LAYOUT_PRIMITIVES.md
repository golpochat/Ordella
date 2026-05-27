# Layout Primitives

Structural components for page composition. No business logic—spacing and alignment only.

**Tokens:** [SPACING_TOKENS](../tokens/SPACING_TOKENS.md) · [BREAKPOINT_TOKENS](../tokens/BREAKPOINT_TOKENS.md)

**Related:** [STEP_3 — Layout system](../STEP_3_LAYOUT_SYSTEM.md) · [STEP_4 — Module templates](../STEP_4_MODULE_LAYOUT_TEMPLATES.md)

---

## Stack

Vertical flex column.

| Prop | Values | Default |
|------|--------|---------|
| `gap` | ODS space token | `space-16` |
| `align` | `start` \| `center` \| `stretch` | `stretch` |
| `as` | `div` \| `section` \| `form` | `div` |

**Rules:** Use for forms, card lists, modal body sections. Only `gap` from [SPACING_TOKENS](../tokens/SPACING_TOKENS.md)—no margin hacks between children.

**Example (text):** driver-ui task list = `Stack gap={space-12}` of Cards.

---

## Flex

Horizontal flex row.

| Prop | Values | Default |
|------|--------|---------|
| `gap` | space token | `space-16` |
| `align` | `start` \| `center` \| `end` \| `stretch` | `center` |
| `justify` | `start` \| `end` \| `between` \| `center` | `start` |
| `wrap` | boolean | false |

**Rules:** PageHeader actions row; filter toolbars; FormActions. On mobile `wrap` or switch to Stack.

**Example (text):** admin-ui filters = `Flex justify="between" gap={space-16}` with Select + Button group.

---

## Grid

CSS grid layout.

| Prop | Values | Default |
|------|--------|---------|
| `cols` | 1–12 or responsive object | 12 |
| `gap` | space token | `space-24` (gutter) |
| `minChildWidth` | px (auto-fill) | — for product grids |

**Rules:** Dashboard KPI = 4 cols desktop; storefront products = `minChildWidth` 200px auto-fill. Gutters match [STEP_3](../STEP_3_LAYOUT_SYSTEM.md).

**Example (text):** storefront-ui PLP = `Grid minChildWidth={200} gap={space-16}`.

---

## PageHeader

Page title region.

### Anatomy

```
Flex (justify between, align start, wrap)
├── Stack gap space-8
│   ├── Title — font-size-2xl, semibold
│   ├── Description — font-size-sm, neutral-600 (optional)
│   └── Breadcrumbs slot (optional)
└── Actions Flex gap space-8
    └── Buttons…
```

| Rule | Token |
|------|-------|
| Margin below header | `space-32` |
| Max one primary in Actions | [BUTTON](./BUTTON.md) |
| Mobile | Actions stack below title full width |

**Example (text):** admin-ui “Inventory” + description “Manage SKUs across locations” + Export ghost + Add primary.

---

## PageSection

Titled content block.

### Anatomy

```
Stack gap space-24
├── SectionTitle — font-size-xl or heading-sm
├── optional description — body-sm
└── children (table, form, grid)
```

| Rule | Value |
|------|-------|
| Between PageSections on page | `space-32` margin or parent Stack `gap space-32` |
| Section internal gap | `space-16`–`space-24` |

**Example (text):** admin-ui report page = PageHeader + PageSection “Summary” (cards) + PageSection “Details” (table).

---

## Container

Horizontal page constraint.

| Prop | Values | Use |
|------|--------|-----|
| `maxWidth` | `sm` 640 \| `md` 960 \| `lg` 1280 \| `full` | Content cap |
| `paddingX` | `space-16` mobile, `space-24` desktop | Page gutters |

| Module | maxWidth |
|--------|----------|
| admin-ui (in shell) | `full` with shell padding |
| storefront-ui / customer-ui | `lg` (1280px) |
| marketing-ui | `lg` or outer `xl` 1440 for hero |
| driver-ui | `full` `paddingX space-16` |

**Rule:** Container does not replace app shell sidebars—only constrains main column.

---

## Spacing + alignment summary

| Primitive | Primary axis | Default gap |
|-----------|--------------|-------------|
| Stack | vertical | `space-16` |
| Flex | horizontal | `space-16` |
| Grid | two-dimensional | `space-24` |
| PageHeader → content | — | `space-32` below |
| PageSection internal | — | `space-24` |

Text alignment: LTR left for body; numeric columns right in tables ([TABLE](./TABLE.md)). Center only for marketing empty states.

---

## Responsive behavior

| Primitive | mobile | desktop |
|-----------|--------|---------|
| PageHeader | Actions below title | Actions right |
| Flex filters | `direction column` or wrap | row |
| Grid | 1–2 cols | 3–12 cols |
| Container | `paddingX space-16` | `paddingX space-24` |

See [BREAKPOINT_TOKENS](../tokens/BREAKPOINT_TOKENS.md).

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| PageHeader + 2 PageSections Stack | Random h1 margins per page |
| Flex `gap space-16` for toolbar | `margin-left: 10px` on each button |
| Container `lg` on storefront | 1600px unbounded text lines |
| Grid for KPI dashboard | Float-based columns |

---

## Module references

| Module | Primitives |
|--------|------------|
| admin-ui | PageHeader, PageSection, Stack, Table in Section |
| pos-ui | Flex split grid+cart; minimal PageHeader |
| kds-ui | Grid tickets; Stack in card |
| driver-ui | Stack list; PageHeader detail |
| marketing-ui | Container, Stack sections, Grid features |

Return to [components OVERVIEW](./OVERVIEW.md)
