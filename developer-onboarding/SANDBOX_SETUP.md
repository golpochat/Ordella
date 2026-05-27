# Developer Onboarding — Sandbox Setup

Create an isolated sandbox tenant, seed sample data, smoke-test endpoints, and reset when needed. Part of the [10–15 minute overview](./OVERVIEW.md) (~5 minutes).

**Related:** [Sandbox overview](../developer-portal/sections/sandbox-overview.md) · [Sandbox page](../developer-portal/pages/sandbox.md) · [API overview](../docs/public/developers/api-overview.md)

---

## Creating a sandbox environment

1. Sign in to the [Developer Portal](../developer-portal/README.md).  
2. Open [Sandbox](../developer-portal/pages/sandbox.md).  
3. Click **Create sandbox** (or accept auto-provisioned sandbox on first login—placeholder behavior).  
4. Note the **sandbox tenant ID**—required on every API call as `X-Tenant-Id`.  
5. Confirm environment badge reads **Sandbox** in portal header.

Sandbox provides **production-parity API behavior** without affecting live customers, payments capture, or real inventory ([sandbox-overview](../developer-portal/sections/sandbox-overview.md)).

One primary sandbox per organization is standard; partners may request additional sandboxes for CI via support ([partner program](../partner-program/ONBOARDING.md)).

---

## Seeding sample data

Sandbox tenants ship with **sample catalog, locations, and orders** (placeholder seed). Options:

| Method | When to use |
|--------|-------------|
| **Default seed** | First login; instant smoke tests |
| **Reset seed** | Portal **Reset sample data** button—restores baseline |
| **API import** | Bulk create via catalog/inventory endpoints when documented |
| **Manual** | Admin-style flows in portal if exposed |

Use fictional SKUs and customer names—**Northwind Market** style demo data per [imagery guidelines](../brand/IMAGERY_GUIDELINES.md). Do not import real PII into sandbox.

After seeding, verify a product and location exist before [FIRST_API_CALL.md](./FIRST_API_CALL.md).

---

## Testing endpoints

With [API key](./API_KEYS.md) and tenant ID:

1. `GET /v1/...` health or lightweight resource (see [FIRST_API_CALL.md](./FIRST_API_CALL.md)).  
2. `GET` catalog or inventory list—confirm pagination envelope.  
3. Optional `POST` write (sandbox order or inventory adjustment) if scopes allow.  
4. Check [Usage](../developer-portal/pages/usage.md) for call counts and [Logs](../developer-portal/pages/logs.md) for request IDs.

Compare responses to [API reference](../docs/public/api-reference.md); report doc gaps via [beta feedback](../beta-program/FEEDBACK_LOOP.md) if in beta.

Respect [rate limits](../docs/public/developers/rate-limits.md)—sandbox may use lower thresholds.

---

## Resetting the sandbox

**Soft reset (sample data):** Portal control reloads default seed; preserves API keys and webhooks.

**Hard reset (placeholder):** Destroys tenant data and regenerates tenant ID—requires re-binding keys and webhook tests. Confirm dialog warns about data loss.

**When to reset:**

- Corrupted test state after experiments  
- Shared demo before external workshop  
- Before certification screen recording  

Production tenants are **never** reset via this flow—use operational tools under retailer agreements only.

---

## Next steps

- [API_KEYS.md](./API_KEYS.md) if not yet created  
- [FIRST_API_CALL.md](./FIRST_API_CALL.md)  
- [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md)  
- Channel guides: [POS](../docs/public/guides/pos-integration.md) · [Storefront](../docs/public/guides/storefront-integration.md)
