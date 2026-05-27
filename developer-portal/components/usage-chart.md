# Usage Chart Component

Time-series and breakdown charts for [Usage](../pages/usage.md) page.

---

## Purpose

Visualize API call volume, errors, and webhook deliveries over a selected date range.

---

## Variants (placeholder)

<!-- UI placeholder: chart container -->

| Variant | Chart type | Data |
|---------|------------|------|
| `api-calls-over-time` | Line | Calls per hour/day |
| `errors-over-time` | Line (stacked) | 4xx vs 5xx |
| `calls-by-resource` | Bar | Top route prefixes |
| `webhook-deliveries` | Area | Success vs failed |

---

## Props (placeholder)

| Prop | Description |
|------|-------------|
| `range` | `{ start, end }` |
| `granularity` | `hour` \| `day` |
| `series` | Array of `{ label, points[] }` |
| `loading` | boolean |
| `empty` | boolean — show “No data for range” |

---

## Accessibility

- Provide table alternative (toggle “View as table” placeholder)
- Color-blind safe palette (teal / amber / neutral)

**Section reference:** [Usage metrics](../sections/usage-metrics.md)
