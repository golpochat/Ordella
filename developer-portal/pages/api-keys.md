# API Keys

Create, scope, and rotate machine-to-machine credentials for calling the Ordella API.

API keys authenticate server-side integrations. Each key belongs to a tenant and carries explicit permissions—never expose keys in browsers or mobile clients.

---

## Page sections

### Key list

<!-- UI placeholder: searchable table of keys -->

| Column | Description |
|--------|-------------|
| Name | Human-readable label |
| Prefix | Masked key prefix (e.g. `ord_live_abc…`) |
| Scopes | Permission summary |
| Last used | Timestamp or “Never” |
| Status | Active · Revoked |

**Actions:** Create key · Revoke · Copy prefix (never full secret after creation)

### Create key flow

<!-- UI placeholder: modal or drawer -->

- Name, environment (sandbox / production), scope multi-select
- One-time display of full secret with copy button and warning

### Empty state

<!-- UI placeholder: illustration + CTA “Create your first API key” -->

---

## Related public documentation

- [Authentication](../docs/public/developers/authentication.md)
- [API overview](../docs/public/developers/api-overview.md)
- [Rate limits](../docs/public/developers/rate-limits.md)

---

## Section & component references

- [API key management](../sections/api-key-management.md)
- [API key card](../components/api-key-card.md)
