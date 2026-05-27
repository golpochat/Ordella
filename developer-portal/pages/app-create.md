# Create App

Register a new OAuth application or start a partner marketplace listing.

This wizard collects app metadata, redirect URIs, and requested scopes before issuing a client ID and client secret.

---

## Page sections

### Step 1 — Basics

<!-- UI placeholder: stepped form, progress indicator -->

- App name, description (short), app icon upload (placeholder)
- App type: Internal integration · Partner marketplace app

### Step 2 — OAuth configuration

<!-- UI placeholder: URI list with add/remove rows -->

- Redirect URIs (HTTPS required in production)
- Allowed grant types (authorization code, refresh token—checkboxes per policy)

### Step 3 — Scopes & capabilities

<!-- UI placeholder: grouped permission checkboxes -->

Link: [Partner onboarding](./partner-onboarding.md) for capability review if partner type.

### Step 4 — Review & create

<!-- UI placeholder: summary panel + “Create app” -->

On success: navigate to [App settings](./app-settings.md) with one-time client secret display.

---

## Related public documentation

- [Authentication](../docs/public/developers/authentication.md)
- [Partner onboarding (public)](../docs/public/partners/partner-onboarding.md)
- [Partner API](../docs/public/partners/partner-api.md)

---

## Section reference

- [App lifecycle](../sections/app-lifecycle.md) · [OAuth overview](../sections/oauth-overview.md)
