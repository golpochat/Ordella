# AI Page Copy — ordella.com/ai

Maps to [ai.md](../pages/ai.md) and [ai-overview section](../sections/ai-overview.md).

**Brand alignment:** [Voice and Tone](../../brand/VOICE_AND_TONE.md) · Pillar 4 (Intelligence with accountability)

---

## Page hero

### Headline options

1. **AI-native retail—not bolt-on dashboards**
2. **Intelligence inside the workflow**
3. **From data to decision—on one platform**

### Subheadline options

1. **Copilots, semantic search, and reasoning grounded in your tenant’s operational truth.**
2. **The Retail Genome connects customers, products, and locations so AI answers real questions.**
3. **Enterprise policies, audit logs, and consent boundaries—built in.**

### Copy (paragraphs)

On most retail stacks, “AI” means another dashboard fed by yesterday’s export. On Ordella, intelligence is **embedded**: the AI Assistant lives where operators work, the Retail Genome links entities and behaviors into a graph, and models consume curated features—not raw chaos.

Ordella is **AI-native** because the platform was designed for continuous data flow, tenant isolation, and governed automation from the start. That foundation makes assistance, search, and reasoning reliable enough to act on—with humans and policies still in control.

This page covers how Ordella approaches retail AI: what the intelligence engine does, how semantic search works, where reasoning applies, and how the Retail Genome powers it all.

**Related docs:** [AI Assistant](../../docs/public/systems/ai-assistant.md) · [Retail Genome](../../docs/public/systems/retail-genome.md) · [Data Lake](../../docs/public/systems/data-lake.md)

### CTA options

| Label | Destination |
|-------|-------------|
| Read AI Assistant docs | `https://docs.ordella.com/systems/ai-assistant` |
| Explore Retail Genome | `https://docs.ordella.com/systems/retail-genome` |
| Request a demo | `/contact` |

---

## AI-native retail explanation

### Section headline options

1. **What AI-native means on Ordella**
2. **Intelligence needs a real-time foundation**
3. **Built for operators—not only data scientists**

### Subheadline options

1. **Events, graphs, and guardrails—not disconnected models.**
2. **AI that respects tenant boundaries and enterprise policy.**
3. **Assist, explain, and recommend—without black boxes.**

### Copy (paragraphs)

**AI-native retail** on Ordella means intelligence consumes the same live operational graph as your POS and storefront. Orders, inventory movements, promotions, and customer events feed feature pipelines and the Retail Genome continuously—not after a weekly ETL job.

Operators interact through the **AI Assistant**: natural-language questions about stock, campaigns, and anomalies, with answers scoped to their tenant and role. Data teams access exports and documented feature APIs through the Data Lake. Enterprise tenants configure model policies, retention, and audit logging through compliance controls documented for review.

AI-native does not mean “fully autonomous stores with no people.” It means **fewer manual lookups**, **clearer explanations**, and **faster planning**—with accountability when models influence customer-facing actions.

**Related docs:** [Security Architecture](../../docs/public/architecture/security-architecture.md) · [GDPR](../../docs/public/compliance/gdpr.md)

---

## Intelligence engine overview

### Section headline options

1. **The intelligence layer of the Retail OS**
2. **From signals to features to action**
3. **One graph. Many intelligent surfaces.**

### Subheadline options

1. **Retail Genome + Data Lake + AI Assistant—connected by design.**
2. **Curated features for promotions, copilots, and partner apps.**
3. **Entity resolution and behavioral signals you can trust.**

### Copy (paragraphs)

Ordella’s **intelligence engine** is not a single monolith—it is a pipeline. Operational and commerce events land in the **Data Lake** for analytics and feature engineering. The **Retail Genome** resolves entities (customers, products, locations) and exposes behavioral features with consent boundaries. The **AI Assistant** and downstream systems—Promotions, Autonomous Engine, partner apps—consume those features through documented APIs.

Partners and internal teams build on the same graph instead of rebuilding customer 360 projects per initiative. Segmentation for campaigns, copilot context for store managers, and anomaly explanations share consistent definitions of “customer” and “product.”

Architecture reviewers can trace data flow in [Data Flow](../../docs/public/architecture/data-flow.md) and module docs; operators care that answers and recommendations align with what the register actually rang up five minutes ago.

**Related docs:** [Retail Genome](../../docs/public/systems/retail-genome.md) · [Data Lake](../../docs/public/systems/data-lake.md) · [Promotions](../../docs/public/systems/promotions.md)

---

## Semantic search

### Section headline options

1. **Ask retail questions in plain language**
2. **Search that understands products, places, and people**
3. **Find answers across catalog, ops, and policy**

### Subheadline options

1. **Meaning-based retrieval across the tenant knowledge graph.**
2. **“Where is SKU X selling fastest?”—without writing SQL.**
3. **Grounded in Genome entities—not generic web search.**

### Copy (paragraphs)

**Semantic search** on Ordella connects natural-language queries to structured retail knowledge: products, categories, locations, policies, and operational documents scoped to your tenant. Instead of keyword matching alone, search uses embeddings and graph context from the Retail Genome to return relevant records, explanations, and next steps.

Store managers can ask operational questions during a shift. Home office teams can explore assortment and performance without exporting cubes to a spreadsheet. Developers can expose search experiences in custom apps through platform APIs—subject to the same permission and audit rules as the core Assistant.

Search results should always be **verifiable**: link back to source systems, show as-of timestamps, and respect role-based access. Ordella’s approach favors **grounded answers** over creative hallucination—especially when inventory and pricing are involved.

**Related docs:** [Retail Genome — graph and reasoning](../../docs/public/systems/retail-genome.md) · [AI Assistant](../../docs/public/systems/ai-assistant.md)

---

## Reasoning capabilities

### Section headline options

1. **Explain the why—not just the what**
2. **Reasoning over retail context**
3. **From anomaly to actionable insight**

### Subheadline options

1. **Chain context across orders, inventory, and campaigns.**
2. **Support planning and root-cause analysis with audit-friendly outputs.**
3. **Recommendations you can review before they go live.**

### Copy (paragraphs)

**Reasoning** on Ordella means the platform can connect facts across domains: why sell-through dropped in a region, whether a promotion conflicted with pricing rules, or which locations will stock out first given current velocity. The Assistant and intelligence APIs use graph context, recent events, and policy metadata to produce **structured explanations**—not opaque scores.

Reasoning supports **planning workflows**: promotion design, assortment changes, and staffing adjustments with narrative summaries operators can challenge. When reasoning informs customer-facing actions, approval paths and logging apply—enterprise tenants configure how much autonomy models receive.

We describe capabilities honestly: preview features are labeled in documentation; production deployments should align with your governance model. See [changelog](../../docs/public/changelog.md) for API and capability evolution.

**Related docs:** [Orchestration](../../docs/public/systems/orchestration.md) · [Autonomous Engine](../../docs/public/systems/autonomous-engine.md)

---

## Retail Genome references

### Section headline options

1. **The Retail Genome Project**
2. **Your retail knowledge graph**
3. **Customers, products, locations—linked**

### Subheadline options

1. **Entity resolution and behavioral features for analytics and AI.**
2. **The foundation for segmentation, assistance, and partner innovation.**
3. **Consent-aware signals—not surveillance.**

### Copy (paragraphs)

The **Retail Genome** is Ordella’s intelligence graph: customers, products, locations, and events linked with resolved identities and curated behavioral features. It powers semantic search, Assistant copilots, smarter promotions, and partner applications that need a consistent view of the business.

Feature stores expose signals with **consent boundaries**—critical for GDPR-aligned programs and enterprise policy. Data scientists integrate via Data Lake exports and documented APIs; operators see outcomes in language they understand.

The Genome is what makes Ordella’s AI **retail-specific**. Generic models do not know your planogram, your loyalty tiers, or your regional pricing rules. The Genome does—because it is built from your tenant’s operational truth.

**Related docs:** [Retail Genome](../../docs/public/systems/retail-genome.md) · [High-Level Architecture](../../docs/public/architecture/high-level-architecture.md)

### CTA options

| Label | Destination |
|-------|-------------|
| Pair AI with autonomy | `/autonomy` · [autonomy.md](./autonomy.md) |
| Developer APIs | `/developers` · [developers.md](./developers.md) |
| Documentation home | `https://docs.ordella.com` |
