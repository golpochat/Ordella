# Ordella Beta — Onboarding Flow

Step-by-step onboarding for developers, partners, and retailers. All technical setup flows through the **Developer Portal** unless noted; contracts and behavior are defined on **docs.ordella.com**.

**Related:** [Sandbox overview](../developer-portal/sections/sandbox-overview.md) · [API key management](../developer-portal/sections/api-key-management.md) · [Webhook management](../developer-portal/sections/webhook-management.md) · [Authentication](../docs/public/developers/authentication.md)

---

## Shared prerequisites (all tracks)

Before track-specific steps, every participant completes:

1. **Accept beta terms** via link in acceptance email (placeholder URL).  
2. **Create or link Ordella account** — ties to organization record.  
3. **Enable MFA** (recommended; required for partners and enterprise retailers).  
4. **Join beta community channel** — guidelines in [COMMUNICATION_PLAN.md](./COMMUNICATION_PLAN.md).  
5. **Bookmark docs:** [Documentation home](../docs/public/index.md) · [API overview](../docs/public/developers/api-overview.md) · [Changelog](../docs/public/changelog.md).

**Portal entry:** [Dashboard](../developer-portal/pages/dashboard.md)

---

## Developers

### Step 1 — Account and organization

Create organization profile in [Account settings](../developer-portal/pages/account-settings.md). Assign at least one **Owner** and one **Developer** role (placeholder RBAC).

### Step 2 — Sandbox creation

Provision **sandbox tenant** from [Sandbox page](../developer-portal/pages/sandbox.md). Review isolation rules in [sandbox-overview](../developer-portal/sections/sandbox-overview.md): separate tenant ID, test payments, tagged webhook deliveries.

Reset or reseed sample catalog/orders when provided (placeholder controls in portal).

### Step 3 — API key issuance

Navigate to [API keys](../developer-portal/pages/api-keys.md). Create key with **least-privilege scopes** for your integration ([api-key-management](../developer-portal/sections/api-key-management.md)). Store server-side only; rotate if exposed.

Include `Authorization` and `X-Tenant-Id` on requests per [Authentication](../docs/public/developers/authentication.md). Base URL: `https://api.ordella.com/v1` (sandbox endpoint documented in portal—placeholder if distinct host).

### Step 4 — Webhook setup

Register HTTPS endpoint on [Webhooks](../developer-portal/pages/webhooks.md). Implement **HMAC signature verification** before processing bodies ([Webhooks doc](../docs/public/developers/webhooks.md)). Subscribe to minimal event types for first milestone (e.g., `inventory.adjusted`, `order.created`).

Verify delivery in [Logs](../developer-portal/pages/logs.md); fix 4xx/5xx before expanding subscriptions.

### Step 5 — First integration tasks

| Task | Success signal | Doc |
|------|----------------|-----|
| List catalog or inventory | 200 response, paginated JSON | [API reference](../docs/public/api-reference.md) |
| Create test order (sandbox) | Order ID + event emitted | [API overview](../docs/public/developers/api-overview.md) |
| Receive webhook | Signature valid, handler idempotent | [Webhooks](../docs/public/developers/webhooks.md) |
| Monitor usage | Non-zero calls in [Usage](../developer-portal/pages/usage.md) | [Rate limits](../docs/public/developers/rate-limits.md) |

**Channel guides (optional next):** [POS](../docs/public/guides/pos-integration.md) · [Storefront](../docs/public/guides/storefront-integration.md) · [Mobile](../docs/public/guides/mobile-app-integration.md)

### Step 6 — Feedback and graduation

Submit **Week 2 integration survey** ([FEEDBACK_LOOP.md](./FEEDBACK_LOOP.md)). Request production promotion when checklist complete (portal placeholder workflow).

---

## Partners

### Steps 1–4

Same as developers (account, sandbox, API keys, webhooks) plus:

- Complete [Partner onboarding page](../developer-portal/pages/partner-onboarding.md) application fields.  
- Review [Partner tools](../developer-portal/sections/partner-tools.md) and [Partner API](../docs/public/partners/partner-api.md).  
- Register **OAuth app** if marketplace install required ([oauth-overview](../developer-portal/sections/oauth-overview.md)).

### Step 5 — App lifecycle

1. [Create app](../developer-portal/pages/app-create.md) — name, scopes, redirect URIs.  
2. [App settings](../developer-portal/pages/app-settings.md) — branding per [brand guidelines](../brand/LOGO_GUIDELINES.md).  
3. Test install against sandbox tenant.  
4. [App publishing](../developer-portal/pages/app-publishing.md) — submit for beta certification review.

Follow [Partner integration guide](../docs/public/guides/partner-integration.md) and public [Partner onboarding](../docs/public/partners/partner-onboarding.md).

### Step 6 — Certification and co-sell (beta)

- Security questionnaire + demo session (scheduled via beta PM).  
- Provide test credentials and webhook endpoint for Ordella validation.  
- Optional: nominate reference retailer for pilot cohort ([retailer track](#retailers)).

---

## Retailers

### Step 1 — Executive kickoff

60-minute call: pilot scope, modules, locations, success metrics ([SUCCESS_METRICS.md](./SUCCESS_METRICS.md)). Assign **platform owner** and **IT contact**.

### Step 2 — Pilot tenant provisioning

Ordella provisions **pilot tenant** (may differ from developer sandbox—production-parity config with beta flags). Portal access for owners: dashboard, usage, support escalation.

### Step 3 — Channel alignment

Map existing POS, ecommerce, and admin tools to integration plan. Prefer certified partner or internal dev using developer track for custom connectors.

| Channel | Guide |
|---------|--------|
| POS | [POS integration](../docs/public/guides/pos-integration.md) |
| Storefront | [Storefront integration](../docs/public/guides/storefront-integration.md) |
| Mobile | [Mobile integration](../docs/public/guides/mobile-app-integration.md) |

### Step 4 — Data and operations baseline

Import or seed catalog, locations, initial inventory (process placeholder). Validate pricing and promotion rules in [Pricing](../docs/public/systems/pricing.md) / [Promotions](../docs/public/systems/promotions.md) docs.

### Step 5 — Pilot go-live

Phased location rollout per [ROLL_OUT_STRATEGY.md](./ROLL_OUT_STRATEGY.md). Enable monitoring: [Usage](../developer-portal/pages/usage.md), operational dashboards (admin UI—external to this doc).

### Step 6 — Weekly operational feedback

Retail-specific check-in during beta; escalate blockers via [FEEDBACK_LOOP.md](./FEEDBACK_LOOP.md).

---

## Sandbox creation (reference)

Detailed rules: [developer-portal/sections/sandbox-overview.md](../developer-portal/sections/sandbox-overview.md).

- One primary sandbox per organization (partners may request additional for CI—approval required).  
- Webhooks must use HTTPS with valid TLS.  
- Do not point sandbox webhooks at production downstream systems without event filtering.

---

## API key issuance (reference)

- Separate keys for **sandbox** and **production** (production locked until promotion).  
- Naming convention: `ordella-beta-{app}-{env}` (recommended).  
- Rotation: 90-day reminder during beta (placeholder).

---

## Webhook setup (reference)

- Retry-aware handlers; respond 2xx quickly.  
- Log `X-Ordella-Event-Id` (placeholder header name—confirm in API reference) for deduplication.  
- Use [webhook-management](../developer-portal/sections/webhook-management.md) for secret rotation.

---

## Offboarding (all tracks)

1. Export required data per agreement.  
2. Revoke API keys and webhook endpoints.  
3. Archive beta feedback tickets.  
4. Transition to GA pricing/support or exit survey.

---

## Support during onboarding

| Issue type | Channel |
|------------|---------|
| API / webhook errors | Portal logs + beta support email (placeholder) |
| Documentation gap | `docs` feedback label — [FEEDBACK_LOOP.md](./FEEDBACK_LOOP.md) |
| Partner certification | Partner PM |
| Retailer pilot | Customer success (beta) |
