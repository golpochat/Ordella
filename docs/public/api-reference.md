# API Reference

Central entry point for Ordella programmatic interfaces. Detailed endpoint documentation is published incrementally; this page defines the surface area and conventions.

Ordella is **API-first**: every product module exposes REST resources under a versioned base URL. Integrators authenticate with JWT sessions or API keys, scope requests to a tenant via `X-Tenant-Id`, and receive JSON responses in a consistent envelope.

Use this reference together with [Authentication](./developers/authentication.md), [API Overview](./developers/api-overview.md), and [Webhooks](./developers/webhooks.md).

## REST API

**Base URL:** `https://api.ordella.com/v1`

<!-- Expanded endpoint catalog planned -->

### Conventions

| Topic | Detail |
|-------|--------|
| Versioning | URL prefix `/v1`; breaking changes increment major version |
| Auth | `Authorization: Bearer <token>` or API key header |
| Tenant | `X-Tenant-Id: <uuid>` required for tenant-scoped routes |
| Response | `{ "success": true, "data": ... }` on success |

### Resource groups (placeholder)

- Auth, catalog, orders, inventory, payments, loyalty, promotions
- Event Bus, Data Lake, Orchestration, Retail Genome
- Compliance Suite, Cloud Platform, Partner Network

**Related:** [Rate Limits](./developers/rate-limits.md) · [Systems Overview](./systems/overview.md)

## GraphQL API

<!-- GraphQL API documentation planned -->

GraphQL support is on the roadmap for read-heavy catalog and analytics queries. When available, it will share the same authentication and tenant scoping as REST.

### Planned capabilities (placeholder)

- Federated catalog and customer queries
- Batched field resolution for mobile clients
- Persisted queries for production hardening

Until launch, use REST endpoints documented under [Developers](./developers/api-overview.md).

## SDKs

<!-- SDK reference documentation planned -->

Official client libraries will wrap authentication, pagination, and error handling for common languages.

| Language | Status | Package (placeholder) |
|----------|--------|------------------------|
| TypeScript / Node | Planned | `@ordella/sdk` |
| Python | Planned | `ordella-sdk` |
| Java | Planned | `com.ordella:sdk` |

See [SDK Overview](./developers/sdk-overview.md) for integration patterns using REST today.

## Webhooks

Ordella delivers asynchronous notifications via HTTPS callbacks. Configure subscriptions in the Developer Platform; payloads mirror Event Bus event types.

<!-- Webhook event catalog expansion planned -->

**Related:** [Webhooks](./developers/webhooks.md) · [Event Bus](./systems/event-bus.md) · [Event Flow](./architecture/event-flow.md)

---

## Related pages

- [Authentication](./developers/authentication.md)
- [POS Integration Guide](./guides/pos-integration.md)
- [Partner API](./partners/partner-api.md)

---

[← Back to Master Documentation Index](../MASTER_INDEX.md)
