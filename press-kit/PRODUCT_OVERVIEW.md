# Ordella — Product Overview (Press)

High-level platform overview for media, analysts, and partners. For technical depth, link to [docs.ordella.com](https://docs.ordella.com).

**Related:** [Launch Narrative §3–6](../launch/LAUNCH_NARRATIVE.md) · [Platform website copy](../website/copy/platform.md) · [Systems overview](../docs/public/systems/overview.md) · [Product highlights in video script](../launch/video/VIDEO_SCRIPT.md)

---

## Platform overview

Ordella is a **multi-tenant Retail Operating System** that unifies how retail runs: operations, commerce, data, and intelligence on one platform. Retailers operate inside a **tenant** boundary—locations, staff, catalog, inventory, and channels scoped consistently. Storefront, POS, admin, mobile, IoT, and partner apps call the same **versioned REST API**; material changes propagate through the **Event Bus** so subscribers react in real time instead of polling overnight exports.

The platform is modular by design: adopt core operations and commerce first, then layer intelligence, automation, and enterprise controls as maturity grows. That composability is the OS difference—promotions respect pricing rules, inventory feeds autonomy, and Genome features power the AI Assistant because modules share truth.

Ordella targets **single-location merchants through global enterprises**, with architecture and compliance documentation suitable for security review ([Security architecture](../docs/public/architecture/security-architecture.md), [Data residency](../docs/public/compliance/data-residency.md)).

---

## Key modules

| Module | Press summary | Documentation |
|--------|---------------|-----------------|
| **Operations** | Core store and back-office operations | [Operations](../docs/public/systems/operations.md) |
| **Inventory** | Stock positions, transfers, replenishment signals | [Inventory](../docs/public/systems/inventory.md) |
| **Pricing** | Channel-aligned price policies | [Pricing](../docs/public/systems/pricing.md) |
| **Promotions** | Campaigns coordinated across channels | [Promotions](../docs/public/systems/promotions.md) |
| **Loyalty & subscriptions** | Engagement and recurring commerce | [Loyalty](../docs/public/systems/loyalty.md) · [Subscriptions](../docs/public/systems/subscriptions.md) |
| **Marketing** | Automation connected to behavior | [Marketing](../docs/public/systems/marketing.md) |
| **Event Bus** | Real-time event propagation | [Event Bus](../docs/public/systems/event-bus.md) |
| **Cloud Platform** | Tenant isolation, regions, observability | [Cloud Platform](../docs/public/systems/cloud-platform.md) |
| **Orchestration** | Cross-system workflows | [Orchestration](../docs/public/systems/orchestration.md) |
| **Data Lake** | Analytics and feature pipelines | [Data Lake](../docs/public/systems/data-lake.md) |

Full map: [Systems overview](../docs/public/systems/overview.md). Website narrative: [homepage — Product overview](../website/copy/homepage.md#product-overview).

---

## AI + autonomy summary

**AI on Ordella** is embedded in operations—not bolted on as a disconnected dashboard. The **AI Assistant** provides tenant-scoped copilots for inventory questions, promotion planning, and anomaly explanations, governed by enterprise policies and audit logging. Intelligence consumes live operational data via the **Retail Genome** and **Data Lake** rather than stale exports.

**Autonomy on Ordella** is policy-bound automation. The **Autonomous Retail Engine** combines perception (including optional vision and IoT signals), policy evaluation, and **Orchestration** to act on replenishment, pricing, promotions, and compliance workflows—with human override, approval thresholds, and audit trails. Ordella describes autonomy as **delegation with guardrails**, not unattended “dark ops.”

Press-safe framing: *AI-native and autonomous where it counts, with accountability built in.*

**Related:** [AI page copy](../website/copy/ai.md) · [Autonomy page copy](../website/copy/autonomy.md) · [AI Assistant](../docs/public/systems/ai-assistant.md) · [Autonomous Engine](../docs/public/systems/autonomous-engine.md)

---

## Digital twins summary

**Digital Twins** are live software models of stores, assets, and state—synchronized from operations and edge deployments. Twins represent layout, devices, SKU positions, and environmental signals so planners and automation reason about the store as a structured entity, not a pile of tables.

Retailers use twins for **simulation** and **scenario planning**: planogram changes, staffing, fulfillment flows, and peak-week stress tests in a sandbox before live rollout. Twins pair with the Autonomous Engine and IoT integrations for closed-loop retail when customers enable those modules.

**Related:** [Digital Twins system](../docs/public/systems/digital-twins.md) · [Digital twins website copy](../website/copy/digital-twins.md) · [Edge architecture](../docs/public/architecture/edge-architecture.md)

---

## Retail Genome summary

The **Retail Genome Project** is Ordella’s retail intelligence graph: customers, products, locations, and events linked with resolved identities and curated behavioral features. It powers semantic search, AI Assistant context, smarter promotions, and partner applications that need a consistent view of the business.

Genome features respect **consent boundaries** and enterprise data policies—critical for GDPR-aligned programs and responsible AI narratives. Data teams integrate via Data Lake exports and documented APIs; operators see outcomes in plain language through copilots and workflows.

**Related:** [Retail Genome](../docs/public/systems/retail-genome.md) · [AI overview in launch narrative](../launch/LAUNCH_NARRATIVE.md)

---

## Integration and developer surfaces

Ordella is **API-first**: `https://api.ordella.com/v1` (per [branding](../docs/public/_config/branding.md)), with [authentication](../docs/public/developers/authentication.md), [webhooks](../docs/public/developers/webhooks.md), SDK overview, and channel guides for [POS](../docs/public/guides/pos-integration.md), [storefront](../docs/public/guides/storefront-integration.md), [mobile](../docs/public/guides/mobile-app-integration.md), and [IoT](../docs/public/guides/iot-device-integration.md).

**Developer narrative:** [developers website copy](../website/copy/developers.md) · **Partner narrative:** [partners website copy](../website/copy/partners.md)

---

## What Ordella is not

For accurate press coverage:

- Not a single-feature POS or ecommerce SKU alone—the **platform** story is essential.  
- Not “fully autonomous stores with no people” in baseline positioning—human judgment and policy remain central.  
- Not a generic horizontal AI tool—intelligence is **retail-specific** via Genome and operational graphs.
