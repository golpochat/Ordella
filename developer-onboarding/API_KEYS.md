# Developer Onboarding — API Keys

Generate, scope, and rotate Ordella API keys for server-side integrations. Complete after [sandbox setup](./SANDBOX_SETUP.md) (~2 minutes in portal).

**Related:** [API key management](../developer-portal/sections/api-key-management.md) · [API keys page](../developer-portal/pages/api-keys.md) · [Authentication](../docs/public/developers/authentication.md)

---

## How to generate API keys

1. Open [API keys](../developer-portal/pages/api-keys.md) in the Developer Portal.  
2. Click **Create key** (label may vary).  
3. Enter a **descriptive name** (e.g., `sandbox-pos-connector`).  
4. Select **environment**: `sandbox` or `production` (production locked until promotion checklist—placeholder).  
5. Choose **scopes**—start minimal ([scope table below](#key-types-public-secret)).  
6. Copy the **secret** when shown once; store in a secrets manager.  
7. Confirm key appears in list with prefix only (e.g., `ord_••••••••`).

Every request must include tenant context per [Authentication](../docs/public/developers/authentication.md)—typically `X-Tenant-Id` plus authorization header.

---

## Key types (public, secret)

Ordella uses two conceptual credential types:

| Type | Used for | Exposure |
|------|----------|----------|
| **Secret API key** | Server-to-server REST calls, batch jobs, webhook management APIs | **Never** in browsers or mobile apps |
| **Publishable / client ID** | OAuth apps—identifies app in authorize URL, not alone sufficient for API access | May appear in client; paired with secret server-side |

There is no “public API key” that grants data access without the secret. **Publishable** values are **OAuth client IDs** and install tokens managed under [APP_CREATION.md](./APP_CREATION.md)—not substitutes for secret keys.

Secret keys map to **RBAC scopes** for your developer organization’s allowed tenants ([api-key-management](../developer-portal/sections/api-key-management.md)).

**Example scope groups (placeholder):**

| Scope group | Example |
|-------------|---------|
| `catalog:read` | List products |
| `inventory:read` | Read stock |
| `inventory:write` | Adjust stock |
| `orders:read` | Read orders |
| `webhooks:manage` | CRUD webhook subscriptions |

---

## Environment separation (sandbox vs production)

| Rule | Sandbox | Production |
|------|---------|------------|
| **Tenant ID** | Sandbox tenant only | Live retailer tenant(s) |
| **Key** | Separate key record | Separate key record |
| **Data** | Sample / test; no real cards | Real operations |
| **Webhooks** | Tagged sandbox deliveries | Live events |
| **Rate limits** | May be lower ([rate limits](../docs/public/developers/rate-limits.md)) | Contract tier |

**Never** use production keys in CI against sandbox URLs or vice versa. CI should inject secrets from environment variables per branch.

Base URL: `https://api.ordella.com/v1` ([API overview](../docs/public/developers/api-overview.md)); sandbox host if documented separately in portal.

---

## Rotation rules

1. **Create** new key with same scopes in target environment.  
2. **Deploy** new secret to servers; run dual-key window (overlap **7–14 days** recommended).  
3. **Monitor** [usage](../developer-portal/pages/usage.md) for traffic on old key.  
4. **Revoke** old key in portal—immediate invalidation.  
5. **Audit** — rotation logged (placeholder in portal).

Rotate immediately if:

- Key committed to git or pasted in ticket  
- Employee with access leaves organization  
- Suspected compromise  

Scheduled rotation: **every 90 days** recommended for production (placeholder policy). Beta participants: see [beta onboarding](../beta-program/ONBOARDING_FLOW.md).

---

## Next steps

- [FIRST_API_CALL.md](./FIRST_API_CALL.md)  
- [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md)  
- [LOGS_AND_USAGE.md](./LOGS_AND_USAGE.md)
