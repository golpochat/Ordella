# Ordella — Press & Launch FAQ

Frequently asked questions for media, developers, partners, and enterprise audiences. Answers align with [Launch Narrative](../launch/LAUNCH_NARRATIVE.md), [brand voice](../brand/VOICE_AND_TONE.md), and public documentation.

**Related:** [Fact sheet](./FACT_SHEET.md) · [Product overview](./PRODUCT_OVERVIEW.md) · [Website homepage copy](../website/copy/homepage.md)

---

## General / company

### What is Ordella?

Ordella is **the Retail Operating System**—a multi-tenant platform that unifies store operations, commerce, data, and intelligence. One tenant model, one API, and one real-time event stream connect POS, storefront, admin, mobile, IoT, and partner apps so retailers run on a single source of truth instead of reconciling disconnected tools.

*See [Introduction](../docs/public/getting-started/introduction.md) · [Launch Narrative §3](../launch/LAUNCH_NARRATIVE.md)*

### What problem does Ordella solve?

Retail fractured across vendors: inventory, pricing, promotions, and customer data live in silos. Teams reconcile manually; decisions arrive late; customers feel inconsistency across channels. Ordella addresses **fragmentation**—not a lack of software—by providing one coherent platform.

*See [Launch Narrative §1](../launch/LAUNCH_NARRATIVE.md) · [Homepage problem copy](../website/copy/homepage.md#problem-statement)*

### How is Ordella different from a POS or ecommerce platform?

POS and ecommerce are **channels**. Ordella is the **operating system beneath them**: shared catalog, orders, inventory, pricing, events, and governance. Retailers may keep familiar channel experiences while replacing the patchwork behind them.

*See [Launch Narrative §5](../launch/LAUNCH_NARRATIVE.md) · [Platform copy](../website/copy/platform.md)*

### Who is Ordella for?

**Retail operators** (single location to global chains), **developers** building integrations and apps, **technology partners** in the partner program, and **enterprise** teams that need security, residency, and architecture documentation for procurement.

*See [Messaging Pillars — audience emphasis](../brand/MESSAGING_PILLARS.md)*

### Is Ordella available today?

Ordella is positioned as a **live platform** opening as an ecosystem—see [Launch Narrative §9](../launch/LAUNCH_NARRATIVE.md). Specific modules may be **preview** or **beta**; refer to [changelog](../docs/public/changelog.md) and docs for current API surface. Do not imply GA for undocumented capabilities.

---

## Product & technology

### What does “real-time” mean on Ordella?

Business events propagate through the **Event Bus** so integrations and automation react when state changes—not after overnight batch jobs. Orders, inventory, and pricing stay aligned across channels.

*See [Event Bus](../docs/public/systems/event-bus.md) · [Event flow](../docs/public/architecture/event-flow.md)*

### What is the Autonomous Retail Engine?

It combines perception (including optional vision/IoT), **policy engines**, and **Orchestration** to automate workflows such as replenishment signals, pricing adjustments, and promotion execution—within approval thresholds and audit logs.

*See [Autonomous Engine](../docs/public/systems/autonomous-engine.md) · [Autonomy website copy](../website/copy/autonomy.md)*

### What are digital twins in Ordella?

**Digital twins** are live models of stores, assets, and state synced from operations and edge data. Retailers simulate planograms, staffing, and scenarios before deploying to live locations.

*See [Digital Twins](../docs/public/systems/digital-twins.md) · [Digital twins website copy](../website/copy/digital-twins.md)*

### What is the Retail Genome?

The **Retail Genome** links customers, products, locations, and events into an intelligence graph for segmentation, AI Assistant context, and partner apps—with consent boundaries and enterprise policies.

*See [Retail Genome](../docs/public/systems/retail-genome.md) · [AI website copy](../website/copy/ai.md)*

### Does Ordella replace all existing retail software on day one?

No single “big bang” is required. Ordella is modular: retailers adopt core operations and commerce, integrate channels via API, and layer intelligence and automation as they mature. The value is **unified truth**, not rip-and-replace theater.

*See [Systems overview](../docs/public/systems/overview.md)*

---

## Developer-focused

### Is Ordella really API-first?

Yes. Product modules expose **versioned REST** resources; integrators use API keys or JWT with tenant scoping. Webhooks deliver signed callbacks aligned with Event Bus types. Public docs cover [API overview](../docs/public/developers/api-overview.md), [authentication](../docs/public/developers/authentication.md), and [rate limits](../docs/public/developers/rate-limits.md).

*See [Developers website copy](../website/copy/developers.md) · [API reference](../docs/public/api-reference.md)*

### What is the base API URL?

`https://api.ordella.com/v1` (per [public docs branding](../docs/public/_config/branding.md)).

### Are SDKs available?

SDK overview and language clients are documented in [SDK overview](../docs/public/developers/sdk-overview.md). Check changelog for supported versions.

### How do webhooks work?

Tenants configure HTTPS endpoints; Ordella sends event payloads with **HMAC signature** verification. Integrators should implement idempotent handlers and respect retry semantics—see [Webhooks](../docs/public/developers/webhooks.md).

### Where do developers manage keys and usage?

The **Developer Portal** (repo: `developer-portal/`) is the operational workspace for API keys, webhooks, and billing views; public how-to content lives on **docs.ordella.com**.

---

## Partner-focused

### How do I become an Ordella partner?

Apply through the partner program, complete onboarding and certification, and integrate via partner APIs and guides. Start with [Partner program](../docs/public/partners/partner-program.md) and [Partner onboarding](../docs/public/partners/partner-onboarding.md).

*See [Partners website copy](../website/copy/partners.md) · [CONTACT.md](./CONTACT.md)*

### Is there a marketplace?

Ordella describes a **partner marketplace** and co-sell motions for certified solutions. Listing requirements and tiers are in partner documentation; specific marketplace URLs may be announced at launch.

### How does partner revenue share work?

Revenue share applies to qualifying marketplace and subscription attach per partner agreement. Public structure is in [Revenue share](../docs/public/partners/revenue-share.md); **rates are provided during contracting**, not in general press materials.

---

## Enterprise-focused

### Can Ordella support global retailers?

The platform is built **multi-tenant** and **multi-region** with documented deployment, security, and **data residency** options. Confirm specific regions with sales—see [FACT_SHEET — Supported regions](./FACT_SHEET.md#supported-regions).

*See [Cloud Platform](../docs/public/systems/cloud-platform.md) · [Deployment architecture](../docs/public/architecture/deployment-architecture.md)*

### What compliance documentation exists?

Public overviews include [GDPR](../docs/public/compliance/gdpr.md), [SOC 2](../docs/public/compliance/soc2-overview.md), [PCI DSS](../docs/public/compliance/pci-dss-overview.md), and [ISO 27001](../docs/public/compliance/iso27001-overview.md), plus [Security architecture](../docs/public/architecture/security-architecture.md). These summarize program structure—scope details belong in enterprise sales cycles.

### How does Ordella handle AI governance?

Enterprise tenants configure model policies, retention, and audit logging. Autonomous workflows support approval thresholds and human override. Ordella positions AI as **grounded and governable**, not uncontrolled automation.

*See [AI Assistant](../docs/public/systems/ai-assistant.md) · [Autonomy safety themes](../website/copy/autonomy.md#safety-controls)*

### Can we review architecture before procurement?

Yes. Share [High-level architecture](../docs/public/architecture/high-level-architecture.md), [Data flow](../docs/public/architecture/data-flow.md), and compliance pack links with your security team. Request demos via [CONTACT.md](./CONTACT.md).

---

## Press-specific

### What tagline should we use?

Primary: **The Retail Operating System.** Launch video may also reference **Autonomous Retail Operating System**—confirm with communications if both appear in one article.

*See [Brand Overview](../brand/BRAND_OVERVIEW.md) · [VIDEO_SCRIPT](../launch/video/VIDEO_SCRIPT.md)*

### Where can we get logos and screenshots?

[LOGO_ASSETS.md](./LOGO_ASSETS.md) and [SCREENSHOTS.md](./SCREENSHOTS.md)—assets distributed when cleared for press; do not recreate the wordmark in other typefaces.

### Who do we contact for interviews?

See [CONTACT.md](./CONTACT.md) for press inquiries and executive interview requests.

---

## Still have questions?

- **Technical:** [docs.ordella.com](https://docs.ordella.com) · [Documentation index](../docs/public/index.md)  
- **Sales / enterprise:** [CONTACT.md](./CONTACT.md)  
- **Partners:** [Partner program](../docs/public/partners/partner-program.md)
