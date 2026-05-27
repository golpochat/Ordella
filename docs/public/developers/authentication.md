# Authentication

Authenticate API requests to Ordella using JWT sessions, API keys, and tenant headers.

All tenant-scoped API routes require proof of identity and an explicit tenant context. Ordella supports interactive login for staff users and machine-to-machine access for integrations.

Enterprise tenants may enable SSO (SAML/OAuth) and MFA through security policies documented under Compliance. Partner and auditor portals use separate scoped token types.

Never embed long-lived secrets in client-side code; use server-side token exchange and rotate API keys periodically.

## JWT and sessions

<!-- Expanded content planned -->

## API keys

<!-- Expanded content planned -->

## Tenant headers

<!-- Expanded content planned -->

## SSO and MFA

<!-- Expanded content planned -->

## Error responses

<!-- Expanded content planned -->

## Related pages

- [API Overview](./api-overview.md)
- [Rate Limits](./rate-limits.md)
- [Security Architecture](../architecture/security-architecture.md)
- [API Reference](../api-reference.md)

---

[← Back to Master Documentation Index](../../MASTER_INDEX.md)
