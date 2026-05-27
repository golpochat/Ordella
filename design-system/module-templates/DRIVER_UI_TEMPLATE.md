# driver-ui Module Template

Mobile-first delivery workflow. Default design width **375px**.

**Repo:** `apps/driver-app` · **Reference:** `app/(driver)/layout.tsx`

**Related:** [layout/MobileListLayout](../layout/LAYOUT_PRIMITIVES.md#mobilelistlayout-driver-ui) · [DRIVER_UI in layout rules](../layout/MODULE_LAYOUT_RULES.md#driver-ui)

---

## App shell (text diagram)

```
┌──────────────────────┐
│ APP BAR 56px sticky   │
├──────────────────────┤
│                      │
│  SCROLL CONTENT      │
│  (list or detail)    │
│                      │
├──────────────────────┤
│ BOTTOM BAR (sticky)   │  ← primary CTA, safe-area
└──────────────────────┘
```

**Container:** fluid 100%; `paddingX space-16` ([CONTAINERS](../layout/CONTAINERS.md)).

---

## Mobile-first layout

| Priority | Breakpoint |
|----------|------------|
| Primary QA | ≤480px mobile |
| Enhancement | ≥769px optional split (list + map) |

**Typography:** `font-size-md` body; titles `font-size-xl` on list, `font-size-2xl` on detail desktop.

---

## List → detail navigation

### List view

```
PageHeader or app title "Today's deliveries"
Stack gap space-12
  Card (interactive) × n
    - customer / address
  - [Badge](../components/BADGE.md) status
  - time window caption
```

| Card | Spec |
|------|------|
| Padding | `space-16` |
| Tap | Full card navigates to detail route |
| Gap between cards | `space-12` |

### Detail view

```
PageHeader with back
PageSection "Stop" — address, customer, notes
PageSection "Items" — Stack lines
[MAP PLACEHOLDER] — 200px height mobile, 40% width tablet+
PageSection "Proof" — photo / signature optional
BOTTOM BAR — primary action
```

**Navigation:** Back chevron in PageHeader; no admin sidebar.

---

## Map integration placeholder

```
┌──────────────────────┐
│ PageSection "Route"   │
│ ┌──────────────────┐ │
│ │  MAP SLOT         │ │  min-height 200px (mobile)
│ │  (third-party)    │ │  neutral-100 bg, border-default
│ └──────────────────┘ │
│  [Open in maps] ghost │
└──────────────────────┘
```

| Rule | Value |
|------|--------|
| Map height mobile | 200–240px |
| Map height tablet+ | flex 1 in split layout |
| External link | [Button](../components/BUTTON.md) ghost below map |

Third-party embed: isolate wrapper; ODS tokens on chrome only.

---

## Bottom action bar rules

| Property | Value |
|----------|--------|
| Position | `sticky` bottom; `z-sticky` |
| Background | `neutral-0`; top border `border-default` |
| Padding | `space-16` + `safe-area-inset-bottom` |
| Primary | [Button](../components/BUTTON.md) `primary` **full width** |
| Secondary | Above primary, full width `secondary` or `ghost` |

| State | CTA label example |
|-------|-------------------|
| En route | “Start delivery” |
| At stop | “Mark delivered” |
| Failed | “Report issue” (secondary) + “Retry” (primary) |

**Rule:** Max one primary in bottom bar.

---

## Delivery status update layout

```
PageSection
  Stack gap space-16
    Select or radio: Delivered | Failed | Returned
    Input notes (optional)
    photo upload slot
Alert info if offline queued
```

Submit triggers [Toast](../components/TOAST.md) success or error (persistent if offline fail).

---

## Offline behavior layout

```
┌──────────────────────┐
│ App bar + Badge "Offline" │
├──────────────────────┤
│ [Alert](../components/ALERT.md) warning — sync pending │
│ (list/detail unchanged) │
├──────────────────────┤
│ BOTTOM BAR — primary enabled if policy allows │
│ caption: "Will sync when online" │
└──────────────────────┘
```

| Rule | Detail |
|------|--------|
| Banner | `warning` [Alert](../components/ALERT.md) below app bar |
| Actions | Queue locally; [Toast](../components/TOAST.md) on reconnect |
| Map | Disabled or static last known; caption explains |

---

## Responsive rules

| Tier | Layout |
|------|--------|
| mobile | Single column; bottom CTA |
| tablet | Optional 40% list / 60% detail+map |
| desktop | Not primary; same as tablet max |

**Do not** use admin [Table](../components/TABLE.md)—Card list only.

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| Full-width “Mark delivered” bottom | Small primary top-right only |
| Status Badge + text on card | Color dot only |
| Back on detail PageHeader | New bottom tab per stop |
| Offline Alert + queue copy | Silent failed API |

---

## Components summary

[Card](../components/CARD.md) · [Button](../components/BUTTON.md) · [Badge](../components/BADGE.md) · [Input](../components/INPUT.md) · [Select](../components/SELECT.md) · [Alert](../components/ALERT.md) · [Toast](../components/TOAST.md)
