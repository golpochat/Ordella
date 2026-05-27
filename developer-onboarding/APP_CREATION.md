# Developer Onboarding — App Creation

Create an OAuth application in the Developer Portal for **multi-tenant** installs (marketplace or custom). Optional for server-only API key integrations.

**Related:** [App create](../developer-portal/pages/app-create.md) · [App settings](../developer-portal/pages/app-settings.md) · [OAuth overview](../developer-portal/sections/oauth-overview.md) · [app-lifecycle](../developer-portal/sections/app-lifecycle.md)

---

## Creating an app in the developer portal

1. Complete [core onboarding](./OVERVIEW.md) (account, sandbox, first API call).  
2. Navigate to [Apps](../developer-portal/pages/apps.md) → **Create app**.  
3. Enter **app name** (customer-facing) and **internal slug** (unique, lowercase).  
4. Choose **distribution**: private (single tenant) or **marketplace** (partner path—[APP_PUBLISHING.md](./APP_PUBLISHING.md)).  
5. Save; note **Client ID** (publishable) generated automatically.

Apps represent OAuth clients—not the same as raw API keys ([API_KEYS.md](./API_KEYS.md)).

---

## OAuth setup (placeholder)

Ordella OAuth 2.0 flow (authorization code with PKCE recommended for public clients—confirm in [Authentication](../docs/public/developers/authentication.md)):

| Setting | Value (placeholder) |
|---------|---------------------|
| **Authorize URL** | `https://auth.ordella.com/oauth/authorize` |
| **Token URL** | `https://auth.ordella.com/oauth/token` |
| **Redirect URIs** | `https://yourapp.com/oauth/callback` (exact match) |
| **Grant types** | `authorization_code`, `refresh_token` |

### Authorize request (example)

```http
GET /oauth/authorize?response_type=code
  &client_id=app_xxxxxxxx
  &redirect_uri=https%3A%2F%2Fyourapp.com%2Foauth%2Fcallback
  &scope=catalog:read%20inventory:read
  &state=random_csrf_token
  &code_challenge=...&code_challenge_method=S256
```

Exchange `code` for tokens server-side; store **refresh token** encrypted. Never expose client secret in mobile binaries.

Test install against [sandbox](./SANDBOX_SETUP.md) tenant before production.

---

## Permissions + scopes

Request **least privilege** scopes at authorize time:

| Scope (placeholder) | Access |
|---------------------|--------|
| `catalog:read` | Read products |
| `inventory:write` | Adjust stock |
| `orders:read` | Read orders |
| `offline_access` | Refresh token (if supported) |

Scopes must match app registration allowlist on [App settings](../developer-portal/pages/app-settings.md). Retailers reviewing install screen see human-readable descriptions—write clearly per [brand voice](../brand/VOICE_AND_TONE.md).

Partner apps may require additional **partner API** scopes—[Partner API](../docs/public/partners/partner-api.md).

---

## App metadata

Complete on [App settings](../developer-portal/pages/app-settings.md):

| Field | Guidance |
|-------|----------|
| **Logo** | SVG/PNG per [logo guidelines](../brand/LOGO_GUIDELINES.md) |
| **Short description** | One sentence value prop |
| **Support URL** | HTTPS help desk or email page |
| **Privacy policy** | Required for marketplace |
| **Terms URL** | If billing through app |
| **Webhook URL** | App-level install/uninstall events (optional) |

Metadata is reviewed during [APP_PUBLISHING.md](./APP_PUBLISHING.md) for marketplace listings.

---

## Next steps

- [APP_PUBLISHING.md](./APP_PUBLISHING.md) for partners  
- [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) for app event endpoints  
- [Partner onboarding](../partner-program/ONBOARDING.md)
