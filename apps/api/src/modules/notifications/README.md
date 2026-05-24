# Notifications module

Notifications and messaging per **SRS §22 / §48** and **API Spec §10** (blueprint Notifications Service).

## Submodules

| Submodule | Routes | Table |
|-----------|--------|-------|
| `notifications` | `GET/POST /notifications`, `GET /notifications/:id` | `notifications` |
| `notification-templates` | `GET/POST /notification-templates`, `PATCH /:id` | `notification_templates` |
| `notification-channels` | CRUD `/notification-channels` | `notification_channels` |
| `notification-logs` | `GET /notifications/logs` | `notification_logs` |

## Lifecycle (SRS §48)

`pending` → `queued` → `sent` → `delivered`  
Terminal: `failed`, `cancelled`

## Migration

`1737650000008-CreateNotificationsSchema.ts`

## Not in this scaffold (future)

API Spec §10.3–§10.5: `POST /email/send`, `POST /sms/send`, `POST /push/send`.
