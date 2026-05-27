# OAuth Overview

How Ordella OAuth apps authorize users and access tenant data on behalf of integrators and partners.

OAuth 2.0 authorization code flow is the standard for installable apps; API keys remain appropriate for purely server-side automation.

---

## Flow summary

<!-- Content section: numbered steps -->

1. User installs app or starts connect flow
2. Redirect to Ordella authorize URL with `client_id`, `redirect_uri`, `scope`, `state`
3. User consents; authorization code returned to redirect URI
4. Server exchanges code for access + refresh tokens
5. API calls include `Authorization: Bearer` and `X-Tenant-Id`

---

## Client credentials

<!-- Content section -->

| Field | Visibility |
|-------|------------|
| Client ID | Public |
| Client secret | Server-only; rotate from [App settings](../pages/app-settings.md) |

---

## Scopes & tenant installs

<!-- Content section: placeholder -->

- Scopes requested at authorize time must match app registration
- Per-tenant installation record (placeholder) gates access

**Public docs:** [Authentication](../docs/public/developers/authentication.md) · [Partner API](../docs/public/partners/partner-api.md)

---

## UI binding

- Pages: [App create](../pages/app-create.md) · [App settings](../pages/app-settings.md)
- Section: [App lifecycle](./app-lifecycle.md)
