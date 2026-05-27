# API Key Card Component

Compact summary of a single API key for list and grid views.

---

## Purpose

Used on [API keys](../pages/api-keys.md) page and optionally on [Dashboard](../pages/dashboard.md) “recent keys” (placeholder).

---

## Layout (placeholder)

<!-- UI placeholder: card -->

```
┌─────────────────────────────────────┐
│ [Icon]  Key name              ⋮ menu │
│         ord_live_abc1…••••            │
│         Scopes: catalog:read, …       │
│         Last used: 2h ago   [Active]  │
└─────────────────────────────────────┘
```

---

## Props / data (placeholder)

| Field | Type |
|-------|------|
| `id` | string |
| `name` | string |
| `prefix` | string |
| `scopes` | string[] |
| `lastUsedAt` | datetime \| null |
| `status` | `active` \| `revoked` |

---

## Actions (overflow menu)

- Copy prefix
- Rotate secret
- Revoke (confirm modal)

**Section reference:** [API key management](../sections/api-key-management.md)
