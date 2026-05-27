# Select

Single- and multi-value picker with listbox dropdown.

**Tokens:** [COLOR_TOKENS](../tokens/COLOR_TOKENS.md) · [Z_INDEX_TOKENS](../tokens/Z_INDEX_TOKENS.md) · [SHADOW_TOKENS](../tokens/SHADOW_TOKENS.md) · [ANIMATION_TOKENS](../tokens/ANIMATION_TOKENS.md)

**Related:** [INPUT](./INPUT.md) · [FORM_LAYOUT](./FORM_LAYOUT.md)

---

## Anatomy

```
Label
Helper text (optional)
┌─────────────────────────────────────┐
│ Selected label              ▼        │  ← trigger (matches Input height)
└─────────────────────────────────────┘
        ┌──────────────────────┐
        │ Option 1             │  ← listbox, shadow-md, z-dropdown
        │ Option 2  ✓          │
        └──────────────────────┘
Error text (optional)
```

---

## Props / variants

| Prop | Values | Description |
|------|--------|-------------|
| `mode` | `single` \| `multi` | Selection model |
| `size` | `md` \| `lg` | Same heights as [INPUT](./INPUT.md) |
| `disabled` | boolean | Trigger + list disabled |
| `error` | boolean | Border + error slot |
| `placeholder` | string | “Select a category…” when empty |
| `options` | `{ value, label, disabled? }[]` | Data source |
| `value` | string \| string[] | Controlled value |

### Multi-select

| Behavior | Rule |
|----------|------|
| Trigger display | “3 selected” or chip list max 2 + “+1” |
| Selection | Checkbox per row; `space-8` gap |
| Clear | “Clear all” ghost action in panel footer |

---

## Dropdown behavior

| Rule | Value |
|------|--------|
| Max height | 280px scroll |
| Width | Min = trigger width; max 400px |
| Shadow | `shadow-md` |
| Z-index | `z-dropdown` |
| Position | Flip above trigger if insufficient viewport space |
| Click outside | Closes; returns focus to trigger |

---

## Keyboard navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus trigger; open with `Space` / `Enter` |
| `↓` / `↑` | Move highlight in list |
| `Enter` | Select highlighted (single); toggle (multi) |
| `Escape` | Close, focus trigger |
| `Home` / `End` | First / last option |
| Type-ahead | Jump to matching option label (single) |

**A11y:** `role="combobox"`, `aria-expanded`, `aria-controls` on listbox id.

---

## States

Same as Input: default, hover, focus, disabled, error. Selected option: `primary-50` bg or check icon.

---

## Responsive behavior

| Breakpoint | Rule |
|------------|------|
| mobile | Full-width trigger; list full width |
| admin-ui filters | `md` in horizontal Flex with `space-16` gap |

On very narrow driver-ui, prefer native `<select>` styled with ODS tokens only if custom listbox cannot fit—document in PR.

---

## Usage guidelines

- Use Select for **≤ 50** options; above that use searchable combobox (extends Select spec).  
- **admin-ui:** status filters, location picker.  
- **storefront-ui:** sort order, variant size.  
- Do not use Select for binary yes/no—use toggle or radio group.

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| Label “Region” + placeholder “Select region” | Unlabeled dropdown |
| Multi “Categories” with chips in trigger | Multi shown as comma-separated only |
| Error: “Choose a valid tax zone.” | Red border only |
| Close on selection (single) | Keep open after single select |

---

## Examples (text)

| Context | Spec |
|---------|------|
| admin-ui inventory filter | single `md`, options All / In stock / Low |
| admin-ui tags on product | multi with chips |
| storefront sort | single, trigger in toolbar Flex |
| pos-ui (rare) | `lg` only for high-visibility register mode switch |
