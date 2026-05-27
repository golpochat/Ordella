# Developers Page Copy — ordella.com/developers

Maps to [developers.md](../pages/developers.md) and [developer-platform section](../sections/developer-platform.md).

**Brand alignment:** Pillar 3 (Built for developers and partners)

---

## Page hero

### Headline options

1. **Build on the Retail Operating System**
2. **API-first by design—not by press release**
3. **Developers welcome at the core**

### Subheadline options

1. **Versioned REST APIs, webhooks, SDKs, and an app platform—documented for production.**
2. **One tenant model, one event stream, consistent JSON everywhere.**
3. **From first API key to marketplace listing.**

### Copy (paragraphs)

Ordella was built **API-first**: every product module exposes REST resources under a versioned base URL. Integrators authenticate with JWT sessions or API keys, scope requests with `X-Tenant-Id`, and receive predictable JSON envelopes. Events publish to the Event Bus and mirror to **webhooks** for your automations.

Whether you extend POS, storefront, mobile, IoT, or partner apps, you integrate once against stable contracts—not per-customer glue code. Public documentation, rate limits, and changelog discipline support long-running production deployments.

**Developer Portal:** keys, usage, billing overview, and workspace tools live in the [Developer Portal](../../developer-portal/) (sections under `developer-portal/sections/`).

**Related docs:** [API Overview](../../docs/public/developers/api-overview.md) · [API Reference](../../docs/public/api-reference.md) · [Authentication](../../docs/public/developers/authentication.md)

### CTA options

| Label | Destination |
|-------|-------------|
| Open documentation | `https://docs.ordella.com` |
| Open Developer Portal | `../../developer-portal/` (internal) · production URL TBD |
| View API reference | `https://docs.ordella.com/api-reference` |
| Become a partner | `/partners` · [partners.md](./partners.md) |

---

## Developer-first philosophy

### Section headline options

1. **Retail platforms should be programmable**
2. **Developers are first-class citizens**
3. **Contracts, events, and clarity**

### Subheadline options

1. **If it ships in the product, it ships in the API.**
2. **Semantic versioning, advance notice for breaking changes.**
3. **Guides for every major channel—not only REST reference pages.**

### Copy (paragraphs)

A **developer-first** platform treats APIs as products: versioned, authenticated, rate-limited, monitored, and documented with the same care as user interfaces. Ordella publishes overview guides, integration playbooks, architecture context, and a growing endpoint reference. Breaking changes require major version bumps and changelog notice.

Events are first-class too. The Event Bus is the nervous system; webhooks are how your systems listen without polling. SDKs reduce boilerplate for common languages while staying honest about what is generated versus hand-maintained.

We mark **preview** and **beta** surfaces clearly in docs—production integrators should not discover stability surprises in production.

**Related docs:** [Changelog](../../docs/public/changelog.md) · [Rate Limits](../../docs/public/developers/rate-limits.md)

---

## API overview

### Section headline options

1. **One API surface for the whole platform**
2. **REST, JSON, tenant-scoped**
3. **`https://api.ordella.com/v1`**

### Subheadline options

1. **Resources for catalog, orders, inventory, pricing, events, and more.**
2. **Consistent envelopes, errors, and pagination patterns.**
3. **Explore the API reference for the full surface area.**

### Copy (paragraphs)

Ordella’s **REST API** organizes resources by domain module: operations, commerce, intelligence, and platform services. Requests include tenant context and appropriate auth headers; responses follow a consistent envelope so client code stays boring—in a good way.

HTTP methods are standard: `GET` for reads, `POST` for creates and actions, `PUT`/`PATCH` for updates, `DELETE` for removals. Errors return machine-readable codes and human-readable messages suitable for logs and UI.

Start with [API Overview](../../docs/public/developers/api-overview.md) for conventions, then [API Reference](../../docs/public/api-reference.md) for resource listings. Architecture readers should review [High-Level Architecture](../../docs/public/architecture/high-level-architecture.md) for how services connect.

**Integration guides:** [POS](../../docs/public/guides/pos-integration.md) · [Storefront](../../docs/public/guides/storefront-integration.md) · [Mobile](../../docs/public/guides/mobile-app-integration.md) · [Partner](../../docs/public/guides/partner-integration.md)

---

## SDK overview

### Section headline options

1. **SDKs that respect your stack**
2. **Less boilerplate, same contracts**
3. **Official clients and examples**

### Subheadline options

1. **Language SDKs for auth, pagination, and webhooks—aligned with API versions.**
2. **Copy-paste quickstarts in public documentation.**
3. **Check changelog when upgrading.**

### Copy (paragraphs)

**SDKs** wrap Ordella’s HTTP contracts with idiomatic clients: authentication helpers, retries with backoff, pagination iterators, and webhook signature verification. SDK overview and package links are maintained in [SDK Overview](../../docs/public/developers/sdk-overview.md).

We recommend SDKs for application developers and direct HTTP for partners with existing gateway infrastructure. Either way, **tenant scoping** and **credential rotation** remain your responsibility—documented in authentication guides.

When SDK major versions track API major versions, upgrade paths are described in the changelog.

**Related docs:** [SDK Overview](../../docs/public/developers/sdk-overview.md)

---

## Webhooks overview

### Section headline options

1. **React to retail events in real time**
2. **Signed webhooks from the Event Bus**
3. **No more polling overnight exports**

### Subheadline options

1. **HTTPS callbacks with HMAC verification and retry semantics.**
2. **Subscribe to the event types your integration needs.**
3. **Configure subscriptions in the Developer Platform.**

### Copy (paragraphs)

**Webhooks** deliver event payloads to your HTTPS endpoints when things happen in a tenant: orders created, inventory adjusted, promotions applied, and more. Payloads align with Event Bus types so your automations stay consistent with internal modules.

Verify **signatures** before processing bodies. Respect **idempotency** and **retry** headers; respond quickly and process asynchronously when work is heavy. Configure endpoints and secrets through the developer workspace; rotate secrets on schedule.

Full security and delivery semantics are in [Webhooks](../../docs/public/developers/webhooks.md).

**Related docs:** [Event Bus](../../docs/public/systems/event-bus.md) · [Partner API](../../docs/public/partners/partner-api.md)

---

## App platform overview

### Section headline options

1. **Build apps tenants can install**
2. **The Ordella app platform**
3. **From integration to marketplace**

### Subheadline options

1. **OAuth, scopes, and tenant install flows for ISVs.**
2. **List on the marketplace when you are certified.**
3. **Partner program for co-sell and revenue share.**

### Copy (paragraphs)

The **app platform** lets partners build tenant-installable applications with defined OAuth scopes, webhooks, and UI surfaces where supported. Apps extend Ordella without forking the core—retailers enable capabilities per tenant with admin approval.

Marketplace listing, certification, and commercial terms flow through the [Partner Program](../../docs/public/partners/partner-program.md). Technical onboarding is covered in [Partner Onboarding](../../docs/public/partners/partner-onboarding.md) and the [Partner Integration Guide](../../docs/public/guides/partner-integration.md).

Internal teams use the same APIs and patterns as external ISVs—dogfooding keeps contracts honest.

**Related docs:** [Partner API](../../docs/public/partners/partner-api.md)

---

## Link to developer portal

### Section headline options

1. **Your keys, webhooks, and usage—in one place**
2. **Developer Portal**
3. **Operate your integration in production**

### Subheadline options

1. **Manage API keys, webhook endpoints, and billing overview.**
2. **Workspace tools for teams building on Ordella.**
3. **Pair the portal with public docs for end-to-end clarity.**

### Copy (paragraphs)

The **Ordella Developer Portal** is the operational home for integrators: create and rotate API keys, register webhook URLs, review delivery logs, and monitor usage against plan limits. Section copy for billing and onboarding lives in `developer-portal/sections/` (for example [billing-overview.md](../../developer-portal/sections/billing-overview.md)).

Public **docs.ordella.com** explains *how* to integrate; the portal helps you *run* integrations day to day. Start with documentation, then provision credentials in the portal when you are ready for sandbox or production tenants.

**Related:** [Developer Portal](../../developer-portal/) · [Documentation index](../../docs/public/index.md)

### CTA options

| Label | Destination |
|-------|-------------|
| Read the docs | `https://docs.ordella.com` |
| Open Developer Portal | Developer Portal (see repo `developer-portal/`) |
| Join partner program | `/partners` |
| Contact developer support | `/contact` |
