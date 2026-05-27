# Digital Twins Page Copy — ordella.com/digital-twins

Maps to [digital-twins.md](../pages/digital-twins.md) and [digital-twins-overview section](../sections/digital-twins-overview.md).

---

## Page hero

### Headline options

1. **Your store—modeled in software**
2. **Digital twins for retail that stays current**
3. **Plan in the model. Execute on the floor.**

### Subheadline options

1. **Live virtual models of stores, assets, and state—synced from operations and IoT.**
2. **Simulate planograms, staffing, and fulfillment before you change the real world.**
3. **Pair twins with autonomy and edge for closed-loop retail.**

### Copy (paragraphs)

A **digital twin** on Ordella is not a static 3D render for marketing. It is a **live graph** of store layout, devices, inventory positions, and environmental signals—updated from operational systems and edge deployments. Planners and operators work from the same picture of reality that automation uses.

Twins bridge the gap between headquarters strategy and store execution. When the model is wrong, Ordella’s sync pipelines correct it; when the model is right, teams test bold changes without risking live customers.

**Related docs:** [Digital Twins](../../docs/public/systems/digital-twins.md) · [Edge Architecture](../../docs/public/architecture/edge-architecture.md) · [Autonomous Engine](../../docs/public/systems/autonomous-engine.md)

### CTA options

| Label | Destination |
|-------|-------------|
| Read Digital Twins documentation | `https://docs.ordella.com/systems/digital-twins` |
| IoT integration guide | `https://docs.ordella.com/guides/iot-device-integration` |
| Request a demo | `/contact` |

---

## What digital twins are

### Section headline options

1. **Mirrors of real stores—not slideshows**
2. **What Ordella models—and why it matters**
3. **Structure, assets, and live state**

### Subheadline options

1. **Layout, devices, inventory, and environment in one tenant-scoped graph.**
2. **Aligned with operations data—not a one-time CAD import.**
3. **The planning layer for autonomy and AI.**

### Copy (paragraphs)

On Ordella, a **digital twin** represents a location (or network of locations) as software objects: floors and zones, fixtures and planograms, POS and IoT devices, SKU positions, temperature or energy sensors where deployed. Relationships mirror how the store actually runs—which aisle holds which category, which device reports which telemetry.

Twins are **tenant-scoped** and permissioned like every other resource. They consume events from the Event Bus when inventory moves, prices change, or devices report status. That keeps the twin useful for **today’s shift**, not last quarter’s floor walk.

Twins connect to **Autonomous Retail Engine** policies and **AI Assistant** context: automation and copilots reason about “the store” as a structured entity, not a bag of disconnected tables.

**Related docs:** [How Ordella Works](../../docs/public/getting-started/how-ordella-works.md) · [Event Flow](../../docs/public/architecture/event-flow.md)

---

## Simulation capabilities

### Section headline options

1. **Test changes before customers feel them**
2. **Simulation built on live twins**
3. **What-if without what-went-wrong**

### Subheadline options

1. **Planogram, labor, and flow scenarios on current store state.**
2. **Compare outcomes side by side—with assumptions documented.**
3. **From headquarters planning to store validation.**

### Copy (paragraphs)

**Simulation** on Ordella runs scenarios against twin state: move a planogram, add a pickup zone, shift staffing, or model a promotion’s effect on traffic and basket size. Simulations use the same product, price, and inventory rules as production—within a sandbox boundary—so results reflect business logic, not generic spreadsheets.

Simulations support **cross-functional alignment**. Merchandising sees shelf impact; operations sees labor and fulfillment load; finance sees margin implications when cost and price data are in scope. Results export to planning workflows or trigger approval chains through Orchestration.

Edge deployments can run twin updates locally for latency-sensitive perception loops; see Edge Architecture for when stores need continuity off the WAN.

**Related docs:** [Digital Twins](../../docs/public/systems/digital-twins.md) · [Orchestration](../../docs/public/systems/orchestration.md)

---

## Forecasting sandbox

### Section headline options

1. **Forecast in context—not in isolation**
2. **A sandbox for demand and supply experiments**
3. **Project velocity, stock, and labor together**

### Subheadline options

1. **Blend historical signals from Data Lake with twin-backed scenarios.**
2. **Safe environment for planners and data teams.**
3. **Label assumptions. Version scenarios.**

### Copy (paragraphs)

The **forecasting sandbox** combines time-series history from the Data Lake with twin geometry and policy knobs: what if lead times stretch, what if a category gains facings, what if a competitor opens nearby. Outputs feed replenishment policies, staffing proposals, and executive summaries—with clear **as-of dates** and **input versions**.

Sandboxes are not production automation until you promote them. Teams compare sandbox runs, agree on a winner, and enable policies through governed workflows—matching Ordella’s autonomy safety model.

Data scientists use documented exports and APIs; operators see narratives and visuals appropriate to their role.

**Related docs:** [Data Lake](../../docs/public/systems/data-lake.md) · [Retail Genome](../../docs/public/systems/retail-genome.md)

---

## Scenario planning

### Section headline options

1. **Scenario planning for real retail constraints**
2. **Prepare for peak, disruption, and expansion**
3. **Playbooks backed by models—not hope**

### Subheadline options

1. **Holiday peaks, supply shocks, and new store openings—modeled on twins.**
2. **Share scenarios across merchandising, ops, and finance.**
3. **Turn winners into orchestrated runbooks.**

### Copy (paragraphs)

**Scenario planning** extends simulation into decision packages: “peak week with 20% traffic uplift,” “DC delay of three days,” “new format store with smaller backroom.” Each scenario documents assumptions, twin starting state, and expected KPI ranges. Teams stress-test labor, inventory, and customer promises before committing capital.

When a scenario graduates to execution, **Orchestration** can deploy runbooks: temporary policies, communication templates, and monitoring dashboards—always with rollback paths.

Scenario planning is how digital twins earn ROI: fewer surprise stockouts during peaks, faster new-store ramp, and calmer executives because the model was argued before the floor was.

**Related docs:** [Operations](../../docs/public/systems/operations.md) · [Inventory](../../docs/public/systems/inventory.md) · [Autonomous Engine](../../docs/public/systems/autonomous-engine.md)

### CTA options

| Label | Destination |
|-------|-------------|
| See autonomy | `/autonomy` · [autonomy.md](./autonomy.md) |
| Platform overview | `/platform` · [platform.md](./platform.md) |
| Architecture for technical teams | `https://docs.ordella.com/architecture/edge-architecture` |
