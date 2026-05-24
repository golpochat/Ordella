# Integrations module

External partner integrations per **SRS §59** and **API Spec §13** (blueprint Integrations Service).

## Submodules

| Submodule | Routes | Table |
|-----------|--------|-------|
| `integrations-apps` | `/integrations/apps`, partner webhooks | `integrations` |
| `integration-providers` | `/integration-providers` | `integration_providers` |
| `integration-events` | `/integration-events` | `integration_events` |
| `integration-logs` | `/integration-logs` | `integration_logs` |

## API Spec §13 routes

- `GET/POST /integrations/apps` — list / connect third-party apps
- `POST /integrations/delivery/webhook`
- `POST /integrations/payments/webhook`
- `POST /integrations/pos/webhook`

## Provider categories

`payment`, `delivery`, `pos`, `loyalty`, `messaging`, `other`

## Migration

`1737650000009-CreateIntegrationsSchema.ts`

## Not in this scaffold (future)

API Spec §13.5: `/api-keys` (handled by Auth module `api-keys` submodule).
