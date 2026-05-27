# Developer Onboarding — First API Call

Your **“Hello Ordella”** request: authenticate, scope to sandbox tenant, and read a resource. Target time: **2–3 minutes** after keys exist.

**Related:** [API overview](../docs/public/developers/api-overview.md) · [Authentication](../docs/public/developers/authentication.md) · [QUICKSTART_GUIDES.md](./QUICKSTART_GUIDES.md)

---

## Prerequisites

- [Account](./ACCOUNT_CREATION.md) verified  
- [Sandbox tenant ID](./SANDBOX_SETUP.md)  
- [Sandbox API key](./API_KEYS.md) with at least `catalog:read` or `inventory:read` (placeholder scope names)  
- Tool: cURL, or language SDK from [QUICKSTART_GUIDES.md](./QUICKSTART_GUIDES.md)

**Base URL:** `https://api.ordella.com/v1`

---

## “Hello Ordella” API call

List products (or inventory) as a minimal read proving auth + tenancy.

### Sample request (cURL)

```http
GET /v1/products?limit=5 HTTP/1.1
Host: api.ordella.com
Authorization: Bearer ord_sandbox_xxxxxxxxxxxxxxxx
X-Tenant-Id: ten_sandbox_xxxxxxxx
Accept: application/json
```

```bash
curl -sS "https://api.ordella.com/v1/products?limit=5" \
  -H "Authorization: Bearer ord_sandbox_xxxxxxxxxxxxxxxx" \
  -H "X-Tenant-Id: ten_sandbox_xxxxxxxx" \
  -H "Accept: application/json"
```

Replace placeholders with values from [API keys](../developer-portal/pages/api-keys.md) and [Sandbox](../developer-portal/pages/sandbox.md).

### Sample response (text)

```json
{
  "data": [
    {
      "id": "prod_demo_001",
      "sku": "DEMO-SKU-001",
      "name": "Sample Product A",
      "status": "active"
    },
    {
      "id": "prod_demo_002",
      "sku": "DEMO-SKU-002",
      "name": "Sample Product B",
      "status": "active"
    }
  ],
  "meta": {
    "limit": 5,
    "hasMore": false,
    "requestId": "req_01HXXXXXXXX"
  }
}
```

Exact field names follow [API reference](../docs/public/api-reference.md); envelope shape (`data` + `meta`) is consistent across list endpoints per [API overview](../docs/public/developers/api-overview.md).

**Success criteria:** HTTP `200`, non-empty `data` (after seed), `requestId` present for support tickets.

---

## Alternative first calls

| Goal | Method | Path (placeholder) |
|------|--------|-------------------|
| Health / ping | `GET` | `/v1/health` or documented status route |
| Locations | `GET` | `/v1/locations` |
| Current tenant | `GET` | `/v1/tenant` or me endpoint |

Pick one read endpoint documented for GA; avoid undocumented routes.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `401 Unauthorized` | Wrong or revoked key | Regenerate key; check `Bearer` prefix |
| `403 Forbidden` | Missing scope | Add `catalog:read` (or equivalent) on key |
| `400` / `404` on tenant | Wrong `X-Tenant-Id` | Copy from sandbox page |
| `429 Too Many Requests` | Rate limit | Back off; see [rate limits](../docs/public/developers/rate-limits.md) |
| Empty `data` | No seed | [Reset sandbox seed](./SANDBOX_SETUP.md#seeding-sample-data) |
| TLS / connection errors | Corporate proxy | Allow `api.ordella.com`; test `curl -v` |
| HTML error page | Wrong host/path | Use `/v1/` prefix and JSON `Accept` |

Copy **`requestId`** from error JSON when contacting support—see [LOGS_AND_USAGE.md](./LOGS_AND_USAGE.md).

---

## Next steps

- [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md)  
- [APP_CREATION.md](./APP_CREATION.md) for OAuth multi-tenant apps  
- [POS](../docs/public/guides/pos-integration.md) / [storefront](../docs/public/guides/storefront-integration.md) guides for channel-specific flows
