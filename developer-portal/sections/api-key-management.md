# API Key Management

Deep reference for creating, scoping, rotating, and revoking Ordella API keys.

API keys are long-lived credentials for server-side integrations. They map to RBAC permissions for the developer organization’s tenant access.

---

## Lifecycle

<!-- Content section: diagram placeholder -->

1. **Create** — Name, environment, scopes; secret shown once
2. **Use** — `Authorization: Bearer` or documented API key header per [Authentication](../docs/public/developers/authentication.md)
3. **Rotate** — Issue new secret, overlap window, revoke old
4. **Revoke** — Immediate invalidation; audit log entry (placeholder)

---

## Scopes (placeholder catalog)

<!-- Content section: table to sync with role-permissions -->

| Scope group | Example permissions |
|-------------|---------------------|
| Catalog | Read products, write catalog |
| Orders | Read/write orders |
| Inventory | Adjust stock |
| Webhooks | Manage subscriptions |

---

## Security practices

- Never commit secrets to source control
- Use separate keys per environment
- Prefer narrow scopes

**Public docs:** [Authentication](../docs/public/developers/authentication.md) · [Rate limits](../docs/public/developers/rate-limits.md)

---

## UI binding

- Page: [API keys](../pages/api-keys.md)
- Component: [API key card](../components/api-key-card.md)
