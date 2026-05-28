# ODS Refactor Coding Guidelines

Rules for implementing refactors in React/Next.js apps. Documentation only—patterns target `packages/ui` and `apps/shared-ui`.

**Related:** [tokens](../tokens/) · [components](../components/OVERVIEW.md) · [layout](../layout/OVERVIEW.md) · [PR_CHECKLIST](./PR_CHECKLIST.md)

---

## Importing and using ODS components

| Rule | Detail |
|------|--------|
| Source | Import from `@ordella/ui` or `apps/shared-ui` export path—one canonical import per app (document in app README) |
| No duplicates | Do not copy `Button.tsx` into `apps/admin-ui/components/` |
| Variants | Use `variant` / `size` props per [BUTTON](../components/BUTTON.md)—not new class strings |
| Composition | Domain widgets wrap ODS children; they do not re-style with raw hex |

**Example import (text):**

```
import { Button, Input, Card, PageHeader } from '@ordella/ui';
```

Until package exports exist, use app-level wrappers that **only** forward props to shared implementation.

---

## Using tokens (no hard-coded spacing/colors/fonts)

| Category | Use | Do not use |
|----------|-----|------------|
| Space | `gap-4`, `p-6`, `space-24` mapped to [SPACING_TOKENS](../tokens/SPACING_TOKENS.md) | `p-[13px]`, `margin: 10px` |
| Color | `bg-primary`, `text-neutral-600`, semantic utilities from preset | `#3A6DFF`, `rgb(15 118 110)` in JSX |
| Type | `text-sm` / semantic `body-sm` tied to preset | `text-[15px]` |
| Radius | `rounded-md` → `radius-md` | `rounded-[10px]` |
| Shadow | `shadow-sm` token | Custom `box-shadow` strings |

**CSS variables:** Set in `globals.css` / preset—components consume `hsl(var(--primary))`.

---

## Layout primitives

| Primitive | When |
|-----------|------|
| **Stack** | Vertical sections, form fields, lists |
| **Flex** | Toolbars, PageHeader actions, filter rows |
| **Grid** | Dashboard KPIs, PLP, marketing features |
| **Container** | storefront/customer/marketing max-width |
| **PageHeader** | Every admin/storefront account route title row |
| **PageSection** | Grouped blocks with `heading-sm` title |

Spec: [layout/LAYOUT_PRIMITIVES](../layout/LAYOUT_PRIMITIVES.md) · [components/LAYOUT_PRIMITIVES](../components/LAYOUT_PRIMITIVES.md)

**Rule:** Prefer `gap` on Stack/Flex/Grid over child margins.

---

## Old vs new structure (text only)

### Button

**Before (fail):**

```tsx
<button className="bg-blue-600 text-white px-4 py-2 rounded">
  Save
</button>
```

**After (pass):**

```tsx
<Button variant="primary" size="md">
  Save changes
</Button>
```

### Page section

**Before (fail):**

```tsx
<div style={{ marginTop: 30 }}>
  <h2 className="text-xl font-bold">Settings</h2>
  <div className="mt-3">...</div>
</div>
```

**After (pass):**

```tsx
<PageSection title="Settings">
  <Stack gap="space-16">...</Stack>
</PageSection>
```

### List page

**Before (fail):**

```tsx
<div>
  <h1>Inventory</h1>
  <div className="flex gap-2">...</div>
  <table className="w-full">...</table>
</div>
```

**After (pass):**

```tsx
<PageHeader title="Inventory" actions={...} />
<Flex justify="between" gap="space-16">...</Flex>
<Card>
  <Table ... />
</Card>
```

---

## Naming conventions

| Item | Convention |
|------|------------|
| Route components | `InventoryPage`, `ProductDetailPage` |
| Shared UI wrappers | `OdsButton` only if thin re-export—prefer direct import |
| Layout components | `DashboardLayout`, `PosShellLayout` |
| CSS modules | Avoid for new work—Tailwind + tokens |
| Feature components | `inventory-table.tsx`, `pos-cart-sidebar.tsx` |
| Props | `variant`, `size`, `isLoading`—match ODS component APIs |

---

## Inline styles

**Forbidden** except:

- Third-party map/embed containers (document in PR)  
- Canvas/chart libraries requiring explicit dimensions (wrap in Card; tokenize outer spacing)

---

## File touch order (per screen)

1. `layout.tsx` (if shell wrong)  
2. `page.tsx` structure → PageHeader / PageSection  
3. Feature components → swap to ODS  
4. `globals.css` / tailwind config only if token mapping missing  

Next: [PR_CHECKLIST](./PR_CHECKLIST.md)
