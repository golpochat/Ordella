# App Card Component

Summary card for an OAuth / marketplace application.

---

## Purpose

Used on [Apps](../pages/apps.md) grid and partner dashboards.

---

## Layout (placeholder)

<!-- UI placeholder: card -->

```
┌─────────────────────────────────────┐
│ [App icon]  App name         ⋮ menu │
│             Client ID: ord_app_…    │
│             Draft · 0 installs      │
└─────────────────────────────────────┘
```

---

## Props / data (placeholder)

| Field | Type |
|-------|------|
| `id` | string |
| `name` | string |
| `iconUrl` | string \| null |
| `clientId` | string |
| `status` | `draft` \| `in_review` \| `published` \| `suspended` |
| `installCount` | number |

---

## Actions

- Open settings → [App settings](../pages/app-settings.md)
- Publish → [App publishing](../pages/app-publishing.md) (if draft)

**Section reference:** [App lifecycle](../sections/app-lifecycle.md)
