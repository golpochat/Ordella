# App Lifecycle

Stages from draft OAuth app to published marketplace listing.

Partner and integrator apps move through defined states with gates for security review and tenant safety.

---

## States

<!-- Content section: state diagram placeholder -->

| State | Description |
|-------|-------------|
| **Draft** | Editable; not installable by tenants |
| **In review** | Submitted for Ordella certification |
| **Published** | Listed and installable per [Partner program](../docs/public/partners/partner-program.md) |
| **Suspended** | Installations blocked; existing tokens may be revoked |

---

## Transitions

- Draft → In review: [App publishing](../pages/app-publishing.md) submit
- In review → Published: approval (manual placeholder)
- Any → Suspended: policy or security action

---

## Related artifacts

- Listing metadata, screenshots, support URL
- Webhook endpoints for install/uninstall events (placeholder)

**Public docs:** [Partner onboarding](../docs/public/partners/partner-onboarding.md) · [Partner integration guide](../docs/public/guides/partner-integration.md)

---

## UI binding

- Pages: [Apps](../pages/apps.md) · [App create](../pages/app-create.md) · [App settings](../pages/app-settings.md) · [App publishing](../pages/app-publishing.md)
- Component: [App card](../components/app-card.md)
