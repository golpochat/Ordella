# Webhook Card Component

Summary card for a webhook endpoint and its health.

---

## Purpose

Used on [Webhooks](../pages/webhooks.md) list; may surface on [Dashboard](../pages/dashboard.md) if deliveries failing.

---

## Layout (placeholder)

<!-- UI placeholder: card -->

```
┌─────────────────────────────────────┐
│ [Icon]  Production orders    ⋮ menu │
│         https://api.example.com/hooks│
│         12 events · 99.2% success    │
│         [Active]  [Test]             │
└─────────────────────────────────────┘
```

---

## Props / data (placeholder)

| Field | Type |
|-------|------|
| `id` | string |
| `label` | string |
| `url` | string (truncated) |
| `eventCount` | number |
| `successRate` | number |
| `status` | `active` \| `paused` \| `failing` |

---

## Actions

- Edit · Pause · Send test · View deliveries → [Logs](../pages/logs.md)

**Section reference:** [Webhook management](../sections/webhook-management.md)
