# Global Visual QA Checklist

Run on **every screen** in **every module** before design-complete. Fail any **required** row → screen fails QA.

**Related:** [tokens](../tokens/) · [components](../components/OVERVIEW.md) · [layout/BREAKPOINTS](../layout/BREAKPOINTS.md) · [MODULE_SPECIFIC_QA](./MODULE_SPECIFIC_QA.md)

---

## How to use

1. Open the screen at required viewports (see [Responsiveness](#responsiveness-rules)).  
2. Mark each item **PASS** / **FAIL** / **N/A**.  
3. Log FAIL with token/component name and link to [BEFORE_AFTER_EXAMPLES](./BEFORE_AFTER_EXAMPLES.md).  
4. Run [MODULE_SPECIFIC_QA](./MODULE_SPECIFIC_QA.md) next.

---

## Alignment rules

| # | Check | Pass criteria | Fail examples |
|---|--------|---------------|---------------|
| A1 | **8px grid** | All spacing uses ODS tokens from [SPACING_TOKENS](../tokens/SPACING_TOKENS.md) (multiples of 4px; vertical rhythm prefers 8px steps: `space-8`, `space-16`, `space-24`, `space-32`) | `margin: 13px`, `gap: 10px`, `p-[15px]` |
| A2 | **Horizontal padding** | Page/content `paddingX` matches module: admin `space-24`, storefront mobile `space-16` / desktop `space-24` ([CONTAINERS](../layout/CONTAINERS.md)) | Inconsistent 20px on one page, 24px on next |
| A3 | **Left alignment** | Body text and section titles left-aligned (LTR); numeric columns right-aligned in tables | Random center body in admin lists |
| A4 | **Section alignment** | PageHeader, filters, and main content share same left edge within content area | Filters indent 8px more than table |
| A5 | **Action alignment** | PageHeader actions right-aligned desktop; modal footer primary right (secondary left) | Primary left, cancel right in modal |

---

## Spacing rules

| # | Check | Pass criteria | Fail examples |
|---|--------|---------------|---------------|
| S1 | **Vertical rhythm** | PageHeader → content `space-32`; PageSection → PageSection `space-32`; form fields `space-16` | 30px between sections |
| S2 | **Card padding** | `space-16` dense or `space-24` default ([CARD](../components/CARD.md)) | Uneven 12/20/18 padding |
| S3 | **Table padding** | Cell padding consistent; row min-height 40px admin | Cramped 28px rows |
| S4 | **Modal padding** | Body/footer `space-24` ([MODAL](../components/MODAL.md)) | 16px body, 32px footer |
| S5 | **Stack/Flex gaps** | Only token `gap` values—no margin chains between siblings | Mixed margins instead of `gap` |

---

## Typography rules

| # | Check | Pass criteria | Fail examples |
|---|--------|---------------|---------------|
| T1 | **Approved tokens only** | [TYPOGRAPHY_TOKENS](../tokens/TYPOGRAPHY_TOKENS.md): `font-size-xs`–`display`, semantic aliases | `text-[13px]`, `font-size: 15px` |
| T2 | **No inline font overrides** | No `style={{ fontSize }}` or arbitrary Tailwind `text-lg` unless mapped to token | One-off `text-xl` on label |
| T3 | **Heading hierarchy** | One `heading-lg`/`font-size-2xl` page title; sections `heading-sm`/`font-size-xl`; no skipped levels | `heading-lg` then `heading-sm` for next section title |
| T4 | **Table/type density** | admin tables `font-size-sm`; forms `font-size-md` | Mixed sizes in same column |
| T5 | **Tabular nums** | Money, qty, IDs use tabular figures in pos, admin, kds | Jumping widths on prices |

---

## Color rules

| # | Check | Pass criteria | Fail examples |
|---|--------|---------------|---------------|
| C1 | **Token colors only** | [COLOR_TOKENS](../tokens/COLOR_TOKENS.md); CSS vars via preset | `#3366ff` in component class |
| C2 | **Semantic success** | `success-*` for positive / in-stock / saved | Random green `#00ff00` |
| C3 | **Semantic warning** | `warning-*` for pending / low stock / SLA warn | Yellow text only |
| C4 | **Semantic error** | `error-*` for errors, destructive, overdue | Red border without error text |
| C5 | **Primary actions** | `primary-600` (or approved marketing interim) on one primary per cluster | Multiple competing blues |
| C6 | **Status not color-only** | Icon or text label with semantic color (kds, driver, badges) | Red row, no “OVERDUE” label |

---

## Component rules

| # | Check | Pass criteria | Fail examples |
|---|--------|---------------|---------------|
| P1 | **ODS components only** | [components/OVERVIEW](../components/OVERVIEW.md)—no one-off div buttons/cards | `<div className="btn-primary">` |
| P2 | **Correct variants** | Button primary/secondary/ghost/destructive per [BUTTON](../components/BUTTON.md) | Destructive for Cancel |
| P3 | **Correct sizes** | admin `md`; pos/driver actions `lg` where required | pos Pay `sm` |
| P4 | **States** | hover, focus, disabled, loading implemented | No focus ring; loading blank |
| P5 | **≤1 primary** | Per PageHeader and modal footer | Two primaries “Save” + “Submit” |
| P6 | **Forms** | Label, helper, error text patterns ([INPUT](../components/INPUT.md)) | Placeholder as only label |
| P7 | **Empty states** | Message + CTA in tables/lists | Empty table, no action |

---

## Responsiveness rules

| # | Check | Pass criteria | Fail examples |
|---|--------|---------------|---------------|
| R1 | **mobile ≤480px** | Layout per [layout/BREAKPOINTS](../layout/BREAKPOINTS.md); PageHeader actions stack | Overflowing horizontal page |
| R2 | **tablet 481–768px** | Grids collapse per [GRID_SYSTEM](../layout/GRID_SYSTEM.md) | 12-col squeezed |
| R3 | **desktop 769–1440px** | Container max-widths respected (storefront 1280, admin fluid in shell) | Unbounded text on ultrawide |
| R4 | **POS 1024×768** | [POS template](../module-templates/POS_UI_TEMPLATE.md)—split layout stable | Single column pos |
| R5 | **POS 1280×800** | Grid columns scale; cart min 360px | Cart crushed < 320px |
| R6 | **KDS 1920×1080** | Ticket grid min 280px cards; landscape | Portrait mobile layout |
| R7 | **Tables** | Horizontal scroll wrapper or column hide on narrow admin | Columns clipped with no scroll |
| R8 | **No inline styles** | Except documented third-party embeds | `style={{ marginTop: 12 }}` |

---

## Accessibility basics

| # | Check | Pass criteria | Fail examples |
|---|--------|---------------|---------------|
| X1 | **Focus visible** | `border-focus` or ring on keyboard tab through interactive elements | `outline: none` globally |
| X2 | **Touch targets** | ≥ **44×44px** operational UIs (pos, kds, driver CTAs) | 32px Pay |
| X3 | **Contrast** | Body text on background ≥ **4.5:1** AA; buttons verified | `neutral-400` on `neutral-50` for body |
| X4 | **Error text** | Visible message with error color—not border alone | Red outline only |
| X5 | **Icon-only buttons** | `aria-label` present | Gear icon no label |
| X6 | **Modal focus** | Focus trapped; returns to trigger on close ([MODAL](../components/MODAL.md)) | Background still tabbable |

---

## Sign-off

| Field | Value |
|-------|--------|
| Screen / route | |
| Module | admin-ui / pos-ui / … |
| Reviewer | |
| Date | |
| Global result | PASS / FAIL |
| FAIL count | |

**All required rows PASS** → proceed to [MODULE_SPECIFIC_QA](./MODULE_SPECIFIC_QA.md).
