# Layout Primitives

Composable structure for every Ordella page. Pair with [components/LAYOUT_PRIMITIVES](../components/LAYOUT_PRIMITIVES.md) for component-level API; this doc defines **layout shells** and spacing contracts.

**Tokens:** [SPACING_TOKENS](../tokens/SPACING_TOKENS.md) · [BREAKPOINTS](./BREAKPOINTS.md)

---

## Stack (vertical spacing)

| Prop | Rule |
|------|------|
| `gap` | ODS space token only (`space-8`–`space-32`) |
| `align` | `stretch` default |

**Use:** Page body sections, form fields, driver-ui card list, modal body.

**Example (text):** customer-ui orders page = `Stack gap={space-24}` of order Cards.

---

## Inline (horizontal spacing)

| Prop | Rule |
|------|------|
| `gap` | `space-8`–`space-16` |
| `wrap` | true for tag rows |

**Use:** Breadcrumb + meta, badge groups, inline stats—not primary toolbars (prefer Flex).

**Example (text):** “SKU-1024 · Active” metadata on PDP.

---

## Flex (alignment + distribution)

| Prop | Values |
|------|--------|
| `justify` | `start` \| `end` \| `between` \| `center` |
| `align` | `start` \| `center` \| `end` \| `stretch` |
| `gap` | space token |
| `direction` | `row` \| `column` (column on mobile for PageHeader actions) |

**Use:** Filter bars, FormActions, pos-ui action footer.

**Example (text):** admin-ui inventory filters = `Flex justify="between"` with Select group left, Button group right.

---

## Grid (structured layouts)

See [GRID_SYSTEM](./GRID_SYSTEM.md): 4 / 6 / 12 columns by breakpoint.

**Use:** Dashboards, marketing features, storefront PLP (auto-fill variant).

---

## PageHeader (title + actions)

| Zone | Spec |
|------|------|
| Title | `font-size-2xl`, semibold |
| Description | `font-size-sm`, `neutral-600`, optional |
| Actions | [Button](../components/BUTTON.md) group; max 1 primary |
| Margin below | `space-32` |

**Responsive:** mobile stacks Actions below title (`Flex direction column`).

**Modules:** admin-ui, storefront account, customer-ui settings.

---

## PageSection (grouped content)

| Zone | Spec |
|------|------|
| Title | `font-size-xl` or `heading-sm` |
| Gap to content | `space-16`–`space-24` |
| Between sections | `space-32` on parent Stack |

**Use:** “Tax settings”, “Recent orders”, report blocks.

---

## SidebarLayout (admin-ui)

```
┌──────────┬─────────────────────────────┐
│ Sidebar  │ Topbar (56px)                │
│ 240px    ├─────────────────────────────┤
│          │ Main: PageHeader + content   │
└──────────┴─────────────────────────────┘
```

| Token | Value |
|-------|--------|
| Sidebar expanded | 240px |
| Sidebar collapsed | 64px |
| Topbar height | 56px |
| Content padding | `space-24` |
| Content bg | `neutral-50` |

**Responsive:** ≤480px sidebar → drawer overlay `z-drawer`; main full width.

**Repo:** `apps/admin-ui/app/(dashboard)/layout.tsx`

---

## SplitLayout (pos-ui)

```
┌────────────────────────────────────────┐
│ Topbar                                  │
├────────────────────┬───────────────────┤
│ Main (scroll)      │ Side (cart)       │
│ ~62%               │ ~38%, min 360px   │
├────────────────────┴───────────────────┤
│ Footer actions                          │
└────────────────────────────────────────┘
```

| Rule | Value |
|------|--------|
| Document scroll | Off on shell; main pane scrolls |
| Cart width | min 360px, max 420px at 1024px |
| Footer | Sticky; [Button](../components/BUTTON.md) `lg` |

**Viewports:** [BREAKPOINTS](./BREAKPOINTS.md) 1024×768, 1280×800.

---

## FullscreenLayout (kds-ui)

| Rule | Value |
|------|--------|
| Height | 100vh |
| Header | Station name + filters; `z-sticky` |
| Body | Ticket Grid auto-fill min 280px |
| Scroll | Vertical on ticket area only |

**Repo:** `apps/kds-ui`

---

## MobileListLayout (driver-ui)

```
┌──────────────────┐
│ App bar sticky    │
├──────────────────┤
│ Stack of cards    │  ← scroll
├──────────────────┤
│ Bottom CTA bar    │  ← sticky, safe-area
└──────────────────┘
```

| Rule | Value |
|------|--------|
| Default width | 100% mobile |
| List gap | `space-12` |
| Bottom bar padding | `space-16` + safe-area |
| Detail route | Push or full-screen; back in PageHeader |

**Repo:** `apps/driver-app/app/(driver)/layout.tsx`

---

## Usage rules (all primitives)

1. Only [SPACING_TOKENS](../tokens/SPACING_TOKENS.md) for gap/padding.  
2. No inline styles.  
3. One PageHeader per route view.  
4. Shell choice is fixed per module—see [MODULE_LAYOUT_RULES](./MODULE_LAYOUT_RULES.md).  
5. Compose [Card](../components/CARD.md), [Table](../components/TABLE.md) inside PageSection—not raw divs.

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| admin-ui SidebarLayout + PageHeader | Custom 220px sidebar per page |
| pos-ui SplitLayout | admin sidebar on register |
| driver-ui sticky bottom primary | Primary button only at top |
| kds-ui FullscreenLayout | marketing Container on kitchen screen |

Next: [MODULE_LAYOUT_RULES.md](./MODULE_LAYOUT_RULES.md)
