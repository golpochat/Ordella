# Ordella — Press Screenshots Guide

Placeholder catalog for UI screenshots used in press, blogs, and launch coverage. **No image files in `/press-kit`**—descriptions and framing rules only. Align visuals with [Imagery Guidelines](../brand/IMAGERY_GUIDELINES.md).

**Related:** [Product overview](./PRODUCT_OVERVIEW.md) · [Homepage copy](../website/copy/homepage.md) · [Launch video script](../launch/video/VIDEO_SCRIPT.md)

---

## Distribution policy

- Screenshots are provided as **`<!-- PLACEHOLDER: press-kit/assets/screenshots/ -->`** when cleared for external use.  
- Use **demo tenant data only**—fictional retailer (e.g., “Northwind Market”); **no real PII, API keys, or card numbers**.  
- Label **Preview** or **Concept** in caption if UI shows pre-GA modules.  
- Blur third-party logos on devices unless rights cleared.

**Request access:** [CONTACT.md](./CONTACT.md) (press) with outlet, resolution needs, and embargo date if applicable.

---

## Recommended framing guidelines

| Guideline | Detail |
|-----------|--------|
| **Aspect ratio** | 16:9 for hero/press; 4:3 or 16:10 for print |
| **Resolution** | Min 2560px wide for 16:9 masters; export WebP/PNG |
| **Chrome** | Prefer `ScreenshotFrame` style—rounded corners, subtle border ([marketing component](../apps/marketing/components/screenshot-frame.tsx)) |
| **Mode** | Light mode default unless documenting dark mode |
| **Crop** | One primary feature per image; avoid illegible full-desktop shrink |
| **Captions** | Describe outcome + “Simulated data” when applicable |
| **Alt text** | Concrete: “Ordella admin inventory view showing stock by location” |

---

## Screenshot catalog (placeholders)

### 1. Platform hub / admin dashboard

| Field | Detail |
|-------|--------|
| **Filename (placeholder)** | `ordella-admin-dashboard-16x9.png` |
| **Screen** | Unified admin home: locations, key metrics, recent events |
| **Description** | Establishes “single pane of glass”—operations and commerce KPIs in one tenant-scoped view. |
| **Best for** | Press hero, fact sheet, platform story |
| **Doc link** | [Operations](../docs/public/systems/operations.md) · [Platform copy](../website/copy/platform.md) |

### 2. Inventory by location

| Field | Detail |
|-------|--------|
| **Filename** | `ordella-inventory-locations-16x9.png` |
| **Screen** | Inventory table: SKU, on-hand, reserved, locations, last updated |
| **Description** | Shows real-time inventory truth across stores—supports “one source of truth” narrative. |
| **Best for** | Operations trade press, retail CIO stories |
| **Doc link** | [Inventory](../docs/public/systems/inventory.md) |

### 3. Event Bus / activity feed

| Field | Detail |
|-------|--------|
| **Filename** | `ordella-event-activity-feed-16x9.png` |
| **Screen** | Event timeline: order placed, stock adjusted, webhook delivered |
| **Description** | Visualizes real-time propagation—contrast with batch/export legacy stacks. |
| **Best for** | Technical press, developer blogs |
| **Doc link** | [Event Bus](../docs/public/systems/event-bus.md) · [Event flow](../docs/public/architecture/event-flow.md) |

### 4. AI Assistant (operator copilot)

| Field | Detail |
|-------|--------|
| **Filename** | `ordella-ai-assistant-query-16x9.png` |
| **Screen** | Natural-language question + grounded answer citing live inventory |
| **Description** | AI-native workflow—not a disconnected analytics tab. |
| **Best for** | AI/retail features, innovation coverage |
| **Doc link** | [AI Assistant](../docs/public/systems/ai-assistant.md) · [AI website copy](../website/copy/ai.md) |

### 5. Autonomous workflow / policy view

| Field | Detail |
|-------|--------|
| **Filename** | `ordella-autonomous-policy-timeline-16x9.png` |
| **Screen** | Policy trigger → proposed action → approval or auto-execute with audit log |
| **Description** | Communicates governed automation—human-in-the-loop visible. |
| **Best for** | Autonomy angle, video script beat alignment |
| **Doc link** | [Autonomous Engine](../docs/public/systems/autonomous-engine.md) · [Autonomy copy](../website/copy/autonomy.md) |

### 6. Digital twin / simulation

| Field | Detail |
|-------|--------|
| **Filename** | `ordella-digital-twin-simulation-16x9.png` |
| **Screen** | Store layout twin with scenario overlay (planogram or staffing) |
| **Description** | Plan in software before changing the floor—twins + sandbox story. |
| **Best for** | Future-of-retail pieces, supply chain media |
| **Doc link** | [Digital Twins](../docs/public/systems/digital-twins.md) |

### 7. Retail Genome graph (stylized)

| Field | Detail |
|-------|--------|
| **Filename** | `ordella-retail-genome-graph-16x9.png` |
| **Screen** | Graph view: customer–product–location relationships (simplified for press) |
| **Description** | Intelligence layer—not generic “AI brain” stock art. |
| **Best for** | Data/AI press, partner technical stories |
| **Doc link** | [Retail Genome](../docs/public/systems/retail-genome.md) |

### 8. Developer Portal — API keys & webhooks

| Field | Detail |
|-------|--------|
| **Filename** | `ordella-developer-portal-keys-16x9.png` |
| **Screen** | API key list + webhook endpoint configuration (secrets redacted) |
| **Description** | Developer-first platform proof for technical outlets. |
| **Best for** | Dev press, API launch posts |
| **Doc link** | [Developers copy](../website/copy/developers.md) · [developer-portal/billing-overview](../developer-portal/sections/billing-overview.md) |

### 9. POS / storefront channel (composite)

| Field | Detail |
|-------|--------|
| **Filename** | `ordella-channels-pos-storefront-16x9.png` |
| **Screen** | Split: POS checkout + ecommerce product page with consistent price/stock |
| **Description** | Channel unity—same truth on floor and online. |
| **Best for** | Omnichannel retail narratives |
| **Doc link** | [POS guide](../docs/public/guides/pos-integration.md) · [Storefront guide](../docs/public/guides/storefront-integration.md) |

### 10. Architecture diagram (press-safe)

| Field | Detail |
|-------|--------|
| **Filename** | `ordella-architecture-diagram-16x9.png` |
| **Screen** | Simplified layer diagram: channels → API → services → Event Bus → cloud/edge |
| **Description** | Non-technical architecture summary for enterprise press kits. |
| **Best for** | CIO/CTO publications, fact sheet inset |
| **Doc link** | [High-level architecture](../docs/public/architecture/high-level-architecture.md) |

---

## Caption templates

**Standard:**  
*Ordella [screen description]. Simulated data shown.*

**Preview:**  
*Ordella [screen description] (Preview). Features may change before general availability.*

**Composite:**  
*Ordella connects [channel A] and [channel B] through one platform. Simulated data shown.*

---

## What not to submit to press

- Screenshots with visible **API keys**, JWTs, or real customer records  
- Outdated UI without version/date note  
- Heavily compressed social crops that obscure UI text  
- Stock photography passed off as product UI

---

## Source applications (for internal capture)

| UI surface | Repo path |
|------------|-----------|
| Admin | `apps/admin-ui` |
| Marketing frames | `apps/marketing` |
| Customer app | `apps/customer-app` |
| Developer Portal | `developer-portal/` |

Capture from **staging/demo tenants** per [brand imagery rules](../brand/IMAGERY_GUIDELINES.md).
