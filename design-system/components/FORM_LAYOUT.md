# Form Layout

Composition rules for grouping [INPUT](./INPUT.md), [SELECT](./SELECT.md), and actions—not a separate visual component.

**Tokens:** [SPACING_TOKENS](../tokens/SPACING_TOKENS.md) · [TYPOGRAPHY_TOKENS](../tokens/TYPOGRAPHY_TOKENS.md)

**Related:** [LAYOUT_PRIMITIVES](./LAYOUT_PRIMITIVES.md) · [CARD](./CARD.md) · [STEP_4 admin template](../STEP_4_MODULE_LAYOUT_TEMPLATES.md)

---

## Anatomy

```
Form (Stack)
├── FormSection (PageSection or fieldset)
│   ├── SectionTitle (heading-sm)
│   ├── FormRow (Flex or Grid)
│   │   ├── FormField (Stack: label, control, helper, error)
│   │   └── FormField …
│   └── …
├── FormActions (Flex, footer)
│   ├── Button secondary
│   └── Button primary
```

---

## Spacing rules

| Relationship | Token |
|--------------|-------|
| Between fields in section | `space-16` |
| Between sections | `space-32` |
| Label → control | `space-8` |
| Control → error | `space-4` |
| Section title → first field | `space-16` |
| FormActions top margin | `space-32` |
| Form inside Card | Card padding + same internal gaps |

---

## Label alignment

| Pattern | Rule | Modules |
|---------|------|---------|
| **Top-aligned** (default) | Label above control | admin-ui, customer-ui, storefront checkout |
| **Horizontal** | Label right-aligned fixed width 160px; control flexes | admin-ui dense settings only, desktop ≥769px |
| **Hidden label** | Only with `aria-label` on control | Search, POS quick entry |

**Rule:** Required fields: `*` on label + `legend` for groups; never color-only required indicator.

---

## Multi-column patterns

| Pattern | Grid | Use |
|---------|------|-----|
| **2-column** | `grid-cols-2`, gap `space-16` | First name / Last name |
| **3-column** | rare; admin wide only | Address city / state / zip |
| **Sidebar + form** | 240px help + 1fr | Long policy text |

Max form content width: **640px** for single-column admin settings ([STEP_3](../STEP_3_LAYOUT_SYSTEM.md)).

---

## Responsive collapse rules

| Breakpoint | Rule |
|------------|------|
| ≤480px | All multi-column → single column (`grid-cols-1`) |
| 481–768px | 2-col allowed for short pairs |
| ≥769px | 2-col as designed |

FormActions: stack full-width buttons on mobile (primary on top or bottom per module—driver-ui **primary bottom**).

---

## FormActions placement

| Context | Placement |
|---------|------|
| admin-ui settings | End-aligned row desktop; sticky footer optional on long forms |
| Modal | [MODAL](./MODAL.md) footer slot |
| pos-ui | Full-width `lg` buttons in sheet footer |
| storefront checkout | Sticky bottom bar mobile |

---

## Usage guidelines

- Group related fields under `heading-sm` section titles.  
- Put destructive actions in [MODAL](./MODAL.md), not inline in FormActions.  
- **admin-ui:** “General”, “Tax”, “Notifications” sections.  
- **customer-ui:** profile single column max 640px.

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| Section “Tax settings” with 4 fields | 40 fields no sections |
| 2-col given name / family name desktop | 2-col on 320px driver-ui |
| Primary “Save” only in FormActions | Save button after every field |
| Consistent `space-16` between fields | Mixed 12px and 20px gaps |

---

## Examples (text)

| Context | Spec |
|---------|------|
| admin-ui location create | Card > 3 sections > 2-col city/state on desktop |
| customer-ui address | single col mobile; 2-col zip/state tablet+ |
| pos-ui discount modal | single field + Apply in FormActions |
