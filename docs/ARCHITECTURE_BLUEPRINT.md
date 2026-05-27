# Ordella Architecture Blueprint

Authoritative high-level architecture for the Ordella Retail OS platform: layered services, cross-cutting flows, deployment topology, and security boundaries. Use with [MASTER_INDEX.md](./MASTER_INDEX.md) for per-system detail and [api-spec-v1.0.md](./api-spec-v1.0.md) for REST contracts.

> **Note:** An earlier summary lives in [architecture-blueprint.md](./architecture-blueprint.md). This document is the expanded Ordella blueprint.

---

## How to Read This Blueprint

1. **Start with [Architecture style](#architecture-style)** — principles that apply everywhere.
2. **Read [Layered architecture](#layered-architecture)** — eight layers, each with purpose, components, interactions, dependencies, and data flow.
3. **Study [System-of-Systems Diagram](#system-of-systems-diagram)** — textual spec for a full-platform diagram (nodes and edges).
4. **Follow [Data Flow Architecture](#data-flow-architecture)** — five canonical pipelines (events, ETL, AI, autonomy, edge).
5. **Trace [Request Lifecycle](#request-lifecycle)** — how storefront, POS, admin, and IoT traffic reaches domain logic.
6. **Review [Deployment Architecture](#deployment-architecture)** — regions, cloud, edge, failover, residency (Ordella Cloud Platform).
7. **Apply [Security Architecture](#security-architecture)** — auth, RBAC, encryption, compliance boundaries.

**Audience:** engineers, architects, security reviewers, and technical partners.  
**Scope:** logical architecture of the monorepo API (`apps/api`) and satellite UIs; physical sizing and vendor-specific runbooks are out of scope here.

---

## Architecture Style

| Principle | Implementation |
|-----------|----------------|
| **Modular monolith (v1)** | NestJS modules under `apps/api/src/modules/` with clear boundaries; optional service extraction later. |
| **Event-driven** | `event-bus` durable store; domain modules publish/consume via topics. |
| **Multi-tenant** | `tenant_id` on all tenant data; `TenantGuard` + `X-Tenant-Id` on API requests. |
| **API-first** | Versioned REST at `/api/v1/*`; developer platform for keys and webhooks. |
| **Cloud-native** | Stateless API workers, PostgreSQL system of record, Redis/cache, object storage, message broker. |
| **Edge-aware** | Offline sync, POS edge clusters, IoT gateways (Cloud Platform + Hardware modules). |
| **Privacy-by-design** | Tenant isolation; federated/anonymized patterns in Retail Genome; Compliance Suite policies. |

---

## Layered Architecture

### Core Services

**Purpose**  
Execute day-to-day retail operations: catalog, orders, payments, locations, and customer-facing transaction paths (storefront, POS).

**Key components**

| Component | Module / API | Role |
|-----------|--------------|------|
| Operations Core | `orders`, `catalog`, `products`, `locations`, `pos`, `payments` | Order lifecycle, catalog, checkout |
| Catalog & bundles | `catalog`, `bundles`, `variants`, `modifiers` | Sellable assortment |
| Tenants & stores | `tenants`, `stores`, `onboarding` | Tenant provisioning and store graph |
| Customer accounts | `customer-accounts`, `crm` | Profiles and CRM context |

**Interactions**

- **→ Operational Services:** hands off fulfillment (warehouse, KDS, delivery) after order acceptance.
- **→ Commerce Services:** applies price, promotions, loyalty, tax at cart/checkout.
- **→ Infrastructure:** auth on every request; audit logs on mutations.
- **→ Data & Analytics:** emits `order.*`, `payment.*` events to Event Bus.

**Dependencies**  
PostgreSQL, Auth/RBAC, Notifications (async), Payments providers (Stripe, etc.).

**Data flow summary**  
Client → API Gateway → Auth/Tenant → Domain service → PostgreSQL → optional Event Bus publish → response.

---

### Commerce Services

**Purpose**  
Monetization and customer engagement: pricing, discounts, loyalty, subscriptions, and marketing campaigns.

**Key components**

| Component | Module / API | Role |
|-----------|--------------|------|
| Pricing Engine | `tax`, catalog price fields, `promotions` | Resolved sell price |
| Promotions Engine 2.0 | `promotions`, `promotion-rules`, `promotion-conditions` | Rules and coupons |
| Loyalty Engine | `loyalty` | Points, tiers, rewards |
| Subscriptions Engine | `subscriptions` | Plans and recurring billing |
| Marketing Automation | `campaigns`, `segments` | Outbound campaigns |
| Gift cards / billing | `giftcards`, `billing` | Stored value and platform billing |

**Interactions**

- **← Core Services:** cart and order lines trigger promotion/loyalty evaluation.
- **→ Intelligence & AI:** segments and recommendations inform campaigns.
- **→ Orchestration:** workflows trigger campaigns on events.
- **→ Global Systems:** currency and tax via Globalization.

**Dependencies**  
Core (orders/customers), Notifications, Payments, Event Bus (campaign triggers).

**Data flow summary**  
Order/cart context → pricing + rules engine → adjusted totals → persist order → loyalty accrual → optional marketing event.

---

### Operational Services

**Purpose**  
Physical and workforce execution: inventory truth, replenishment, fulfillment, scheduling, support, and edge operations.

**Key components**

| Component | Module / API | Role |
|-----------|--------------|------|
| Inventory Engine | `inventory`, `stock-*` | Stock levels and movements |
| Fulfillment Engine | `warehouse`, `kds`, `deliveries` | Pick, pack, kitchen, last mile |
| Replenishment Engine | `replenishment` | Stock-up proposals |
| Staff Scheduling | `staff-scheduling`, `staff` | Shifts and coverage |
| Customer Support Suite | `support` | Tickets and inbox |
| Procurement | `purchase-orders`, `suppliers` | Inbound supply |
| Offline & Edge Sync | `offline-sync`, `pos/offline` | Offline-first clients |
| Hardware & IoT | `hardware/devices` | Devices and telemetry |

**Interactions**

- **← Core:** orders drive picks and deliveries.
- **→ Data & Analytics:** inventory and movement events to lake/genome.
- **→ Autonomous:** replenishment and fulfillment signals to Autonomous Retail.
- **→ Infrastructure:** edge routing via Cloud Platform policies.

**Dependencies**  
Core orders, Inventory, Notifications, Event Bus, optional Hardware gateways.

**Data flow summary**  
Order accepted → inventory reservation → warehouse/KDS tasks → delivery assignment → status events → customer notifications.

---

### Intelligence & AI Services

**Purpose**  
Forecasting, semantic understanding, knowledge-graph reasoning, recommendations, and manager-facing AI assistance.

**Key components**

| Component | Module / API | Role |
|-----------|--------------|------|
| Forecasting Engine | `forecast` | Demand signals |
| AI Assistant | `ai-assistant` | NL insights and actions |
| Retail Genome | `retail-genome` | Knowledge graph, embeddings, reasoning |
| Recommendations | `recommendations` | Product/customer suggestions |
| Analytics Insights | `analytics-insights` | Curated metrics narratives |
| Search | `search` | Index-backed query |

**Interactions**

- **← Data & Analytics:** features and graph from Data Lake and Event Bus ingest.
- **→ Autonomous Systems:** decision inputs to Autonomous Retail.
- **→ Commerce:** segments and promotions targeting.
- **→ Operational:** replenishment and inventory risk reasoning.

**Dependencies**  
Data Lake, Event Bus, Retail Genome (for graph-backed features), PostgreSQL feature stores.

**Data flow summary**  
Events/batch features → models/graph updates → API inference → Admin UI or orchestrated actions (human-in-the-loop where required).

---

### Data & Analytics Layer

**Purpose**  
Durable analytics storage, ETL, orchestrated workflows, simulation twins, and governed export.

**Key components**

| Component | Module / API | Role |
|-----------|--------------|------|
| Real-Time Event Bus | `event-bus` | Append-only event store, pub/sub, replay |
| Enterprise Data Lake & ETL | `data-lake` | Zones, pipelines, stream/batch ingest |
| Orchestration Engine | `orchestration` | Cross-system workflows and triggers |
| Digital Twins | `digital-twins` | Simulation entities and scenarios |
| Reports | `reports`, `report-jobs` | Scheduled reporting |

**Interactions**

- **← All layers:** producers publish domain events.
- **→ Intelligence:** feeds Genome, forecast, AI Assistant.
- **→ Autonomous:** triggers and simulation inputs.
- **→ Ecosystem:** webhook and integration side-effects via Orchestration.

**Dependencies**  
PostgreSQL (event store + lake metadata), object storage for large artifacts, message broker optional for scale-out.

**Data flow summary**  
Real-time: domain action → event record → subscribers (lake stream, orchestration). Batch: scheduled pipeline → raw → curated → feature/analytics zones.

---

### Infrastructure Layer

**Purpose**  
Platform plumbing: identity, developer surfaces, integrations, audit, routing, and cloud topology configuration.

**Key components**

| Component | Module / API | Role |
|-----------|--------------|------|
| Auth & RBAC | `auth`, `roles`, `permissions`, `sessions`, `sso`, `api-keys` | Identity and access |
| Developer Platform | `developer`, `webhooks` | Partner/tenant extensibility |
| Integrations Hub | `integrations`, `integration-providers` | Third-party connections |
| Audit Logs | `audit/logs` | Immutable admin/action trail |
| Ordella Cloud Platform | `cloud-platform` | Regions, failover, edge, CDN config |
| Compliance Suite | `compliance-suite` | SOC2/ISO/PCI/GDPR controls metadata |
| Routing (internal) | `routing` | Internal route metadata |

**Interactions**

- **Wraps every layer:** guards and policies on ingress.
- **→ Deployment:** region assignments and residency enforcement config.
- **→ Security:** compliance boundaries and cross-region access logs.

**Dependencies**  
PostgreSQL, JWT/session store, external IdPs (SAML/OAuth via SSO config), KMS per region (Cloud Platform).

**Data flow summary**  
Request → TenantGuard → JwtAuthGuard → RbacGuard → handler; mutations → audit record; policy changes → compliance/cloud modules only (no hot-path auth rewrite).

---

### Ecosystem Layer

**Purpose**  
Extend Ordella through apps, partners, and public APIs without forking core code.

**Key components**

| Component | Module / API | Role |
|-----------|--------------|------|
| App Store 2.0 | `app-store` | Tenant apps and installs |
| Global Partner Network | `partner-network`, `partner-network/portal` | Partner onboarding and marketplace |
| Integration public API | `api` (integration module) | External REST surface |
| Webhooks | `webhooks`, `integration-events` | Outbound event delivery |

**Interactions**

- **← Infrastructure:** API keys and OAuth for partners.
- **→ Core/Commerce:** apps call domain APIs within granted scopes.
- **→ Event Bus:** apps subscribe via webhooks fed from events.

**Dependencies**  
Developer Platform, Auth, Compliance (partner due diligence artifacts).

**Data flow summary**  
Partner/app registration → scoped credentials → API calls or webhook subscriptions → integration logs and audit.

---

### Autonomous Systems Layer

**Purpose**  
Policy-bound automated decisions (pricing adjustments, replenishment triggers, promotional experiments) with safety constraints and explainability.

**Key components**

| Component | Module / API | Role |
|-----------|--------------|------|
| Autonomous Retail Engine | `autonomous-retail` | Policies, decisions, safety constraints |
| Digital Twins (consumer) | `digital-twins` | What-if before execution |
| Orchestration (consumer) | `orchestration` | Executes approved action graphs |
| Retail Genome (consumer) | `retail-genome` | Reasoning and substitute detection |

**Interactions**

- **← Intelligence:** forecasts and graph reasoning.
- **→ Operational/Commerce:** proposed or auto-executed actions (tenant-configured).
- **→ Infrastructure:** audit and compliance review of autonomous actions.

**Dependencies**  
Event Bus, Data Lake features, explicit safety policies in DB, human approval paths where configured.

**Data flow summary**  
Signal → policy evaluation → decision record → (optional) orchestration run → domain API mutation → audit + event.

---

## System-of-Systems Diagram

This section describes the **target diagram** to generate (e.g. in Mermaid, Lucidchart, or Cursor canvas). It lists **all major nodes** and **edge semantics** so a diagram can be drawn without guessing relationships.

### Diagram legend

| Edge style | Meaning |
|------------|---------|
| **Solid →** | Synchronous API / request-response |
| **Dashed →** | Asynchronous event or webhook |
| **Dotted →** | Batch / scheduled ETL |
| **Bold →** | Hard dependency (cannot function without) |

### Nodes (major systems)

**Experience tier**

- Storefront UI (`apps/storefront`)
- POS UI (`apps/pos-ui`)
- Admin UI (`apps/admin-ui`)
- Driver app, Customer app, KDS UI, Supplier UI, Marketing site

**Core**

- Operations Core
- Fulfillment Engine
- Inventory Engine

**Commerce**

- Pricing Engine
- Promotions Engine 2.0
- Loyalty Engine
- Subscriptions Engine
- Marketing Automation

**Operational**

- Replenishment Engine
- Staff Scheduling
- Customer Support Suite
- Offline Mode & Edge Sync
- Hardware & IoT Layer

**Intelligence & AI**

- Forecasting Engine
- AI Assistant
- Retail Genome Project
- Recommendations / Search

**Data & analytics**

- Real-Time Event Bus
- Enterprise Data Lake & ETL
- Orchestration Engine
- Digital Twins

**Infrastructure**

- Auth & RBAC
- Developer Platform
- Integrations Hub
- Audit Logs
- Ordella Cloud Platform
- Compliance Suite

**Ecosystem**

- App Store 2.0
- Global Partner Network

**Autonomous**

- Autonomous Retail Engine

**Global**

- Globalization & Multi-Currency Engine

**External**

- Payment providers (Stripe)
- Email/SMS providers
- Partner systems (via webhooks)

### Textual diagram (reference layout)

```text
                    [ Storefront ] [ POS ] [ Admin ] [ Driver ] [ KDS ] [ IoT ]
                              \         |         /
                               \        |        /
                                v       v       v
                         +---------------------------+
                         |   API (NestJS /api/v1)    |
                         |  Auth + Tenant + RBAC     |
                         +---------------------------+
            +------+------+------+------+------+------+------+
            |      |      |      |      |      |      |      |
            v      v      v      v      v      v      v      v
         [Core][Commerce][Ops ][Intel][Data ][Infra][Eco  ][Auto]
            |      |      |      |      |      |      |      |
            +------+------+------+------+------+------+------+
                              |
                    dashed: Event Bus
                              v
                    [ Data Lake ] ----> [ Retail Genome ]
                              |                    |
                              dotted ETL           v
                              v              [ AI Assistant ]
                    [ Orchestration ] <---- [ Autonomous Retail ]
                              |
                    dashed webhooks
                              v
                    [ Integrations / Partners / App Store ]
```

### Required arrows (for diagram generation)

| From | To | Type | Payload / notes |
|------|-----|------|-----------------|
| Storefront / POS / Admin | API Gateway | sync | HTTPS JSON, JWT, `X-Tenant-Id` |
| API | Core / Commerce / Ops modules | sync | Internal service calls |
| Core (orders) | Event Bus | dashed | `order.*`, `payment.*` |
| Event Bus | Data Lake | dashed | Stream ingest pipeline |
| Event Bus | Orchestration | dashed | Workflow triggers |
| Data Lake | Retail Genome | dotted | Batch entity/relationship build |
| Retail Genome | AI Assistant | sync | Semantic search & reasoning APIs |
| Forecasting | Replenishment | sync | Forecast quantities |
| Replenishment | Inventory / Procurement | sync | Transfer PO proposals |
| Autonomous Retail | Orchestration | dashed | Approved actions |
| Orchestration | Commerce / Ops | sync | Side-effect commands |
| Developer / App Store | API | sync | Scoped API keys |
| API | Webhooks | dashed | Integration events to partners |
| IoT / POS Edge | API / Edge gateway | sync | Telemetry, offline sync batches |
| Cloud Platform | Routing config | sync | Region, failover, CDN metadata (policy) |
| Compliance Suite | Audit | sync | Compliance status, export bundles |
| Globalization | Pricing / Tax | sync | Locale, currency, rules |
| All mutating modules | Audit Logs | dashed | Admin and system actions |

---

## Data Flow Architecture

### Real-time event flow

1. Domain service completes a business mutation (e.g. order placed).
2. Service writes to PostgreSQL (source of truth).
3. Service appends record to **Event Bus** (`event_store_records`) with topic, partition key, payload.
4. Subscribers react:
   - **Data Lake** streaming ingest (incremental zones).
   - **Orchestration** matching workflow triggers.
   - **Webhooks** (via Integrations) for external partners.
   - **Retail Genome** realtime ingest (entity upsert, relationship inference).
5. Failures are retried or dead-lettered per pipeline configuration; replay API supports backfill.

### Batch ETL flow

1. Scheduler or Admin action starts **Data Lake** pipeline (`batch` or `stream-event-bus` catch-up).
2. Extract from operational DB snapshots and/or event store windows.
3. Transform in pipeline stages (dedupe, conform, PII mask flags).
4. Load into lake zones (raw → curated → analytics).
5. Downstream: **Forecast** feature computation, **Reports**, **Genome** batch ingest.
6. Lineage recorded in lake run metadata and Genome lineage events.

### AI training flow

1. **Data Lake** exports governed datasets (`piiMasked` options).
2. Feature rows materialized per entity (customer, product, inventory).
3. **Retail Genome** refreshes embeddings and infers relationships (tenant-scoped).
4. Optional **federated round**: gradient hash + DP noise → **global patterns** (no raw tenant export).
5. **AI Assistant** / **Autonomous Retail** consume latest features/graph at inference time (no blocking training on request path).

### Autonomous decision flow

1. Signal arrives (forecast threshold, inventory rule, orchestration trigger).
2. **Autonomous Retail** loads policies + safety constraints.
3. Engine evaluates decision model → `autonomous-decision` record.
4. If auto-approve: **Orchestration** executes action graph (e.g. create replenishment, adjust promotion).
5. Else: Admin UI approval queue (future) or audit-only recommendation.
6. Outcome events published to Event Bus; **Audit Logs** capture actor `system` vs `admin`.

### Edge sync flow

1. POS or store edge node operates **offline** (local queue).
2. On connectivity, **offline-sync** / `pos/offline` batches deltas to API.
3. **TenantGuard** + idempotent keys prevent duplicate orders/stock movements.
4. Server merges into PostgreSQL; conflicts resolved per sync policy (server-wins / LWW).
5. Successful merge publishes sync events to Event Bus.
6. **Cloud Platform** edge node registry tracks uptime and gateway URIs.

---

## Request Lifecycle

### Storefront request path

1. Browser loads Next.js storefront (`apps/storefront`).
2. Public catalog: `GET /api/v1/public/*`, `catalog` (tenant resolved via domain or header).
3. Cart/checkout: customer session or guest; `orders`, `payments` with Stripe checkout webhooks.
4. **Globalization** resolves currency/tax where configured.
5. **Promotions** + **Loyalty** applied on order create.
6. Response JSON; order confirmation triggers **Notifications** and Event Bus `order.created`.

### POS request path

1. POS UI (`apps/pos-ui`) with device token / staff login.
2. `POST /api/v1/auth/login` → JWT; `X-Tenant-Id` + location context.
3. High-frequency: `pos/*`, `orders`, `inventory` lookups; local **offline** queue when disconnected.
4. Payments: terminal or cash paths via `payments/terminal`.
5. KDS/fulfillment hooks via same order IDs to `kds` / `warehouse` when enabled.
6. Hardware events (scanner, drawer) optional via `hardware/devices`.

### Admin request path

1. Admin UI (`apps/admin-ui`) server components call API with session cookie / bearer.
2. Every request: **TenantGuard** → **JwtAuthGuard** → **RbacGuard** (`RequirePermissions`).
3. Dashboard modules map 1:1 to API prefixes (see [MASTER_INDEX.md](./MASTER_INDEX.md) Admin UI table).
4. Mutations write PostgreSQL + **Audit Logs**; sensitive modules (compliance, cloud) use elevated permissions.
5. Long operations (lake pipeline, genome ingest) return job records; UI polls or refreshes lists.

### IoT device event path

1. Device or gateway authenticates (API key or device credential scoped to tenant/location).
2. `POST /api/v1/hardware/devices/*` telemetry or command ack.
3. Normalized event → optional Event Bus topic `iot.*`.
4. **Orchestration** may trigger alerts; **Compliance** cross-region log if multi-region relay.
5. **Cloud Platform** edge registry updates `last_seen_at` and uptime metrics.

---

## Deployment Architecture

Implemented and configured through **Ordella Cloud Platform** (`cloud-platform` module) and **Compliance Suite** (residency policies). Logical topology:

### Multi-region

- Tenants assigned **primary** and optional **secondary** regions (`cloud_tenant_region_assignments`).
- Region capabilities define supported modules and latency class.
- Admin selects active region for deployments; API remains stateless behind regional ingress.

### Multi-cloud

- Seed regions span **AWS** (primary), **Azure**, and **GCP** for module affinity (e.g. analytics on GCP).
- Per-region encryption keys (`cloud_encryption_keys`) — KMS / Key Vault / GCP KMS aliases.
- Replication links (`cloud_replication_links`) model async cross-region copy.

### Edge regions

- **Edge node types:** store, warehouse, IoT micro-region, POS cluster, sync gateway.
- Offline-first flags drive sync gateway URIs and Cloud Platform edge dashboards.
- Geo-routing sends POS/low-latency traffic to nearest capable region (`cloud_routing_policies`).

### Failover

- **Failover rules:** active-active or active-passive with RPO/RTO seconds.
- Auto-failover toggles and monitoring alerts on drift/unhealthy region health snapshots.
- Failover routing policy separate from tenant default routing.

### Data residency

- **Compliance / Cloud residency:** EU-only, US-only, APAC flags; allowed region lists.
- Strict mode blocks cross-region access logs when disallowed.
- Globalization and Compliance governance align tax/privacy zones with cloud region codes.

**Deployment strategies (platform):** blue/green, canary, provision, rollback via `cloud_deployments` — metadata marks zero-downtime intent; workers roll forward without dropping in-flight API requests when health checks pass.

---

## Security Architecture

### Authentication

- **JWT** access + refresh tokens (`auth`); optional **MFA** and **SSO** (SAML/OAuth) per Compliance security settings.
- **API keys** for developer and integration clients (`api-keys`).
- **Partner** and **auditor** portals use scoped JWT types (`partner-network/portal`, `compliance-suite/auditor`).
- Sessions tracked in `sessions` with configurable timeout policies.

### Permissions

- **RBAC:** permission catalog in `role-permissions.ts`; roles assigned per tenant user.
- **Guards:** `TenantGuard`, `JwtAuthGuard`, `RbacGuard` on admin routes.
- **Least privilege:** module-specific permissions (e.g. `retail-genome.ingest`, `compliance-suite.audit`).
- Manager role defaults seeded in `roles.service.ts`; custom roles via Admin.

### Encryption

- **In transit:** TLS 1.2+ termination at load balancer / ingress.
- **At rest:** PostgreSQL volume encryption; object storage SSE; per-region keys in Cloud Platform.
- **Compliance Suite** documents rotation days and encryption policy JSON per tenant.
- Secrets (DB, Stripe, JWT) via environment / secret manager — not stored in repo.

### Compliance boundaries

| Boundary | Mechanism |
|----------|-----------|
| **Tenant isolation** | `tenant_id` FK on all tenant tables; guards reject cross-tenant IDs. |
| **Audit** | Append-only `audit_logs` with hash chain; compliance export bundles. |
| **Residency** | `cloud_residency_policies` + compliance data governance. |
| **Cross-region access** | `cloud_cross_region_access_logs` for allowed/denied actions. |
| **Partner / auditor** | Separate auth guards; read-only auditor bundle for compliance reviews. |
| **PII in analytics** | Data Lake export `piiMasked`; Genome federated patterns anonymized + DP flag. |

---

## Technology reference

| Concern | Technology |
|---------|------------|
| API | NestJS, TypeScript |
| UI | Next.js (Admin, Storefront, POS, etc.) |
| Database | PostgreSQL |
| Cache | Redis (sessions, hot keys) |
| Events | Event store in PostgreSQL; RabbitMQ in local docker-compose |
| Storage | S3-compatible (MinIO local) |
| Monorepo | Turborepo, npm workspaces |

---

## Related documentation

| Document | Link |
|----------|------|
| Master index (all systems) | [MASTER_INDEX.md](./MASTER_INDEX.md) |
| API specification | [api-spec-v1.0.md](./api-spec-v1.0.md) |
| Local development | [local-development.md](./local-development.md) |
| ERD | [erd.md](./erd.md) |
| SRS | [srs-v7.md](./srs-v7.md) |

---

*Blueprint version aligns with Ordella monorepo modules through Retail Genome, Cloud Platform, Compliance Suite, and Partner Network (migrations `1737650000085`–`1737650000088`).*
