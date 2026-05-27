# customer-ui Module Template

Logged-in shopper account—minimal chrome, aligned with storefront tokens.

**Repo:** `apps/customer-app`

**Related:** [STOREFRONT_UI_TEMPLATE](./STOREFRONT_UI_TEMPLATE.md) · [layout/CONTAINERS](../layout/CONTAINERS.md)

---

## Design principles

| Principle | Rule |
|-----------|------|
| Minimal | No admin sidebar; no marketing hero |
| Familiar | Same tokens as **storefront-ui** |
| Focused | One primary task per screen |
| Width | `container-lg` 1280px; forms `container-sm` 640px |

---

## App shell (text diagram)

```
┌─────────────────────────────────────────────┐
│ HEADER — logo, Account nav, cart (optional)  │
├─────────────────────────────────────────────┤
│ CONTAINER-LG                                 │
│   PageHeader + content                       │
├─────────────────────────────────────────────┤
│ FOOTER (compact)                             │
└─────────────────────────────────────────────┘
```

**Nav:** Horizontal links or tab bar—Account, Orders, Addresses, Preferences (max 5 items).

---

## Profile

```
PageHeader "Profile"
container-sm
  FormLayout Stack
    Input: name, email, phone
  FormActions: primary Save, secondary Cancel
```

| Spacing | `space-16` fields; `space-32` below header |
| Components | [Input](../components/INPUT.md), [Button](../components/BUTTON.md) |

---

## Orders

### List

```
PageHeader "Orders"
Stack gap space-16
  Card interactive × n
    order #, date, total tabular, [Badge](../components/BADGE.md) status
```

### Detail (simple list + detail)

```
PageHeader back + "Order #1234"
PageSection — status Badge + timeline Stack
PageSection — items (name, qty, price)
PageSection — totals Card
ghost "Reorder" optional
```

**Alignment:** Left labels; amounts right tabular-nums.

---

## Addresses

```
PageHeader "Addresses" + primary "Add address"
Stack of Cards OR Table simplified to cards on mobile
  each: label, lines, ghost Edit | destructive Remove (confirm Modal)
```

Add/Edit: [Modal](../components/MODAL.md) `md` with [FORM_LAYOUT](../components/FORM_LAYOUT.md).

---

## Preferences

```
PageHeader "Preferences"
PageSections:
  Notifications — toggles Stack
  Marketing opt-in — checkbox + caption
FormActions Save
```

**Spacing:** Sections `space-32` apart.

---

## Responsive rules

| Tier | Behavior |
|------|----------|
| mobile ≤480 | Single column; full-width Cards; nav hamburger if needed |
| tablet | Same; optional 2-col address list |
| desktop | `container-sm` centered forms; list Cards max readable width |

**Typography:** `font-size-2xl` page titles desktop; `font-size-xl` mobile.

**Do not** use [Table](../components/TABLE.md) on mobile—Card rows only.

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| Order status Badge + label | Color stripe only |
| Profile form 640px centered | Full-bleed 12-col form |
| Match storefront header height | admin-ui sidebar |
| Confirm before delete address | Instant delete |

---

## Components summary

[PageHeader](../components/LAYOUT_PRIMITIVES.md) · [Card](../components/CARD.md) · [Badge](../components/BADGE.md) · [Button](../components/BUTTON.md) · [Input](../components/INPUT.md) · [Modal](../components/MODAL.md) · [Toast](../components/TOAST.md) save feedback
