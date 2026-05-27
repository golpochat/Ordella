# Ordella Pitch Deck — Structure

Master outline for investor, partner, and enterprise presentations. Each slide lists **on-deck content**, **visuals**, and **speaker notes**. Replace bracketed placeholders before presenting.

**Related:** [Launch narrative](../launch/LAUNCH_NARRATIVE.md) · [Public documentation](../docs/public/index.md) · [Architecture blueprint](../docs/ARCHITECTURE_BLUEPRINT.md)

---

## Slide 1 — Title Slide

### On slide

- **Logo:** Ordella wordmark — asset placeholder: `/pitch-deck/assets/logo.svg`
- **Product name:** Ordella
- **Tagline:** *The Autonomous Retail Operating System*
- **Presenter:** [Founder Name], Founder & CEO
- **Optional footer:** ordella.com · Confidential

### Visuals

| Element | Placeholder |
|---------|-------------|
| Background | Dark teal gradient or clean white with brand accent |
| Logo | Full-color wordmark, centered or top-left |
| Tagline | Single line beneath logo, Inter or brand font |

### Speaker notes

Open with one sentence: retail needs an operating system, not another app. Set the tone—confident, clear, no jargon. Introduce yourself and the ask (meeting purpose) in 15 seconds.

---

## Slide 2 — The Retail Crisis

### On slide

**Headline:** Retail is broken by fragmentation—not by lack of software.

| Pillar | Key points (on slide) |
|--------|------------------------|
| **Fragmentation of tools** | POS, ecommerce, inventory, loyalty, and analytics live in separate stacks with brittle integrations |
| **Operational inefficiency** | Manual reconciliation, duplicate data entry, slow decisions across locations |
| **Outdated systems** | Batch reports, legacy POS, and channel silos that cannot meet modern shopper expectations |
| **Margin pressure** | Shrink, stockouts, promotion errors, and IT overhead erode profitability every quarter |

**Visual:** Four-quadrant diagram or “spaghetti integration” graphic showing disconnected vendors.

### Speaker notes

Make it visceral: merchants, staff, and customers all pay the price. The crisis is architectural—patching tools does not fix a missing foundation. Bridge to slide 3: the same forces creating pain are creating the opportunity.

**Docs:** [Introduction](../docs/public/getting-started/introduction.md) · [Launch narrative §1](../launch/LAUNCH_NARRATIVE.md#1-the-retail-crisis)

---

## Slide 3 — The Opportunity

### On slide

**Headline:** A once-in-a-generation retail transformation—and the window is now.

| Theme | Message |
|-------|---------|
| **AI-native retail transformation** | Intelligence belongs in operations, not slide decks; data must drive same-day decisions |
| **Automation wave** | Repetitive store and back-office work can be orchestrated, not staffed around |
| **Global commerce modernization** | Cloud and API-first platforms let mid-market retailers operate with enterprise capability |
| **Why now** | Shopper expectations, competitive speed, and viable cloud economics have aligned—winners adopt platforms, not point tools |

**Visual:** Timeline or “wave” graphic: cloud → APIs → AI → autonomy.

### Speaker notes

Position timing: competitors are not waiting for annual IT cycles. Ordella is built for this moment—not retrofitted legacy. Transition: “Here is what we built.”

**Docs:** [How Ordella works](../docs/public/getting-started/how-ordella-works.md) · [Launch narrative §2](../launch/LAUNCH_NARRATIVE.md#2-the-opportunity)

---

## Slide 4 — What is Ordella?

### On slide

**Headline:** Ordella is the Retail Operating System.

**One line:** One unified platform for operations, commerce, data, and intelligence—across every channel and location.

**Four pillars (icons recommended):**

| Pillar | One-liner |
|--------|-----------|
| **Real-time** | Live inventory, pricing, and events—not yesterday’s batch |
| **AI-native** | Assistance, genome, and automation embedded in workflows |
| **Autonomous** | Sense, decide, and act across store and supply chain |
| **Global · multi-cloud · edge-first** | Scale by region with residency; run offline at the store when it matters |

**Visual:** Simple platform diagram—channels on top, Ordella OS in the middle, cloud + edge below.

### Speaker notes

Define “Retail OS” in plain language: the layer beneath POS, web, mobile, and partners. Emphasize tenant-unified truth and API-first extensibility. Avoid feature dumps—save modules for slide 5.

**Docs:** [Systems overview](../docs/public/systems/overview.md) · [Key concepts](../docs/public/getting-started/key-concepts.md)

---

## Slide 5 — The Product

### On slide

**Headline:** Everything a retailer runs—on one platform.

**Major modules (group for clarity):**

| Layer | Modules |
|-------|---------|
| **Operations** | Operations Core, Inventory, Pricing, Promotions, Loyalty, Subscriptions |
| **Engagement** | Marketing Automation, AI Assistant |
| **Intelligence & automation** | Event Bus, Data Lake, Orchestration, Digital Twins, Autonomous Retail Engine, Retail Genome |
| **Enterprise** | Cloud Platform, Compliance-ready controls |

**Screenshots (placeholders):**

| Screen | Placeholder path | Caption |
|--------|------------------|---------|
| Admin dashboard | `/pitch-deck/assets/screenshots/admin-dashboard.png` | Unified operations view |
| POS / store | `/pitch-deck/assets/screenshots/pos-store.png` | Real-time catalog and checkout |
| Analytics / genome | `/pitch-deck/assets/screenshots/retail-genome.png` | Intelligence and segments |

**Architecture summary (footer or right column):**

- Experience tier → Domain services → Event & data plane → Cloud / edge
- Link for depth: [High-level architecture](../docs/public/architecture/high-level-architecture.md)

**Visual:** 3-column product montage + slim architecture strip.

### Speaker notes

Walk left-to-right: run the business, grow the customer, automate and predict, deploy globally. Screenshots can be mockups until GA polish—call out what is live vs. roadmap if asked.

**Docs:** [Systems overview](../docs/public/systems/overview.md) · [Operations](../docs/public/systems/operations.md)

---

## Slide 6 — The Technology

### On slide

**Headline:** Built for autonomy, intelligence, and scale.

| System | Role (one line on slide) |
|--------|---------------------------|
| **[Event Bus](../docs/public/systems/event-bus.md)** | Canonical real-time events for every integration and downstream system |
| **[Data Lake & ETL](../docs/public/systems/data-lake.md)** | Ingestion, warehousing, and analytics pipelines |
| **[Orchestration Engine](../docs/public/systems/orchestration.md)** | Cross-system workflows, policies, and automated actions |
| **[Digital Twins](../docs/public/systems/digital-twins.md)** | Live models of stores, assets, and operational state |
| **[Autonomous Retail Engine](../docs/public/systems/autonomous-engine.md)** | Perception-to-action for shelf, store, and policy-driven automation |
| **[Retail Genome Project](../docs/public/systems/retail-genome.md)** | Unified intelligence graph—customers, products, locations, behavior |

**Visual:** Hub-and-spoke diagram—Event Bus at center, other systems as nodes; optional data-flow arrows.

### Speaker notes

This slide is for technical investors and enterprise architects—keep language accessible. Stress **composability**: modules work alone but compound together. Point to public architecture docs for diligence.

**Docs:** [Event flow](../docs/public/architecture/event-flow.md) · [Data flow](../docs/public/architecture/data-flow.md) · [Architecture blueprint](../docs/ARCHITECTURE_BLUEPRINT.md)

---

## Slide 7 — The Platform Advantage

### On slide

**Headline:** Why Ordella wins.

| Dimension | Legacy / fragmented | Ordella |
|-----------|---------------------|---------|
| **Unified vs. fragmented** | Many vendors, many truths | One OS, one tenant model, one API |
| **Autonomous vs. manual** | Reports after the fact | Orchestration and autonomous engine in the loop |
| **Predictive vs. reactive** | Guesswork and spreadsheets | Retail Genome and real-time signals |
| **Global vs. regional** | Per-country rebuilds | Multi-region cloud, residency, edge at store |

**Visual:** 2×2 comparison matrix or four “vs.” cards with checkmarks on Ordella side.

### Speaker notes

This is the moat slide—not a feature checklist. Tie each row to customer outcomes: margin, speed, experience, expansion. Mirror messaging from [Launch narrative §5](../launch/LAUNCH_NARRATIVE.md#5-the-ordella-difference).

**Docs:** [Cloud Platform](../docs/public/systems/cloud-platform.md) · [Edge architecture](../docs/public/architecture/edge-architecture.md)

---

## Slide 8 — The Market

### On slide

**Headline:** A massive, underserved retail technology market.

**Retail vertical focus:**

- Multi-location retail, franchise, grocery, specialty, and commerce-heavy brands modernizing operations and channels
- Buyers: CIO/CTO, COO, Head of Digital, and transformation leads replacing legacy POS + ecommerce stacks

**Market sizing (placeholders—update with sourced research):**

| Metric | Definition | Placeholder value |
|--------|------------|-------------------|
| **TAM** | Global retail operations & commerce software spend | **$[___]B** |
| **SAM** | Addressable multi-location retailers in target geographies (NA, EU, APAC) | **$[___]B** |
| **SOM** | Realistic 5-year capture (install base × ARPA) | **$[___]M** |

**Assumptions footnote (small type):**

- TAM source: [Gartner / IDC / internal model — cite before presenting]
- SAM filter: [employee count, store count, vertical list]
- SOM: [year 5 logos × ACV]

**Visual:** Concentric circles (TAM → SAM → SOM) or bar chart with placeholder bars.

### Speaker notes

Lead with **why this vertical**: fragmentation pain is highest where stores + digital + supply chain intersect. Be ready to defend TAM/SAM/SOM methodology in appendix—do not present empty placeholders to investors; fill before the meeting. Tease next slides (business model, traction, team, ask) if extending the deck beyond this structure.

---

## Deck metadata

| Field | Value |
|-------|--------|
| **Recommended length** | 8 core slides (+ appendix as needed) |
| **Aspect ratio** | 16:9 |
| **Brand colors** | Primary `#0F766E`, accent `#F59E0B` (see [docs branding](../docs/public/_config/branding.md)) |
| **Asset folder** | `/pitch-deck/assets/` (create when exporting slides) |

### Suggested appendix slides (optional, not in core 8)

- Business model & pricing
- Traction & pipeline
- Team
- Financials / use of funds
- Competition landscape
- Security & compliance ([SOC 2](../docs/public/compliance/soc2-overview.md))
- Roadmap
- The ask

---

*Structure version 1.0 · Align with [LAUNCH_NARRATIVE.md](../launch/LAUNCH_NARRATIVE.md) for spoken story consistency.*
