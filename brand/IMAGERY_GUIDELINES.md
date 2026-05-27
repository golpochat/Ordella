# Ordella Imagery Guidelines

Photography, product screenshots, and mockup standards for **ordella.com**, social, sales decks, and docs. **No image assets in `/brand`**—this file defines rules only.

**Related:** [Visual Identity](./VISUAL_IDENTITY.md) · [Component Styles](./COMPONENT_STYLES.md) · `apps/marketing/components/screenshot-frame.tsx`

---

## Photography style

<!-- Placeholder: Art direction for brand photoshoots or stock selection. -->

### Mood

- **Authentic retail environments** — real stores, warehouses, and teams at work (not sterile stock “handshake” corporate).  
- **Calm and competent** — well-lit, natural color; avoid heavy filters.  
- **Diverse** — staff and customers reflect global retail; avoid stereotypes.

### Composition

- Negative space for headline overlay on hero images (left or center safe zone).  
- Depth of field moderate—environment readable, subject clear.  
- No competing signage or third-party logos in frame unless cleared.

### Technical

- Minimum **2400px** wide for hero masters; export WebP/AVIF for web.  
- Alt text describes scene and purpose, not “image of store.”

### Text example (alt text)

✅ “Associate scanning inventory in a grocery aisle using a handheld device.”  
❌ “Retail photo.”

---

## Product imagery style

### Screenshots (preferred proof)

- Capture from **staging or demo tenants** with realistic but fictional data (no real PII).  
- Use consistent demo retailer name (placeholder: “Northwind Market”).  
- Show UI in **light mode** unless documenting dark mode specifically.  
- Crop to relevant feature; blur or omit unrelated nav items if cluttered.

### Device frames

- Wrap in `ScreenshotFrame` / marketing frame component—`rounded-2xl`, `shadow-brand`, subtle border.  
- Browser chrome optional for web; native frame for mobile POS/customer app.

### Annotations

- Callouts: primary color lines, `body-sm` labels, max 3 per image.  
- No comic arrows or meme-style highlights in enterprise assets.

### References

- Admin UI: `apps/admin-ui`  
- Customer app: `apps/customer-app`  
- Marketing frames: `apps/marketing/components/screenshot-frame.tsx`

---

## Mockup rules

<!-- Placeholder: For Figma/marketing comps before GA UI. -->

### When to use mockups

- Pre-release features labeled **“Preview”** or **“Coming soon”** in caption.  
- Architecture diagrams not pretending to be live UI.  
- Partner co-marketing when partner UI cannot be shown.

### Fidelity

- Match [Visual Identity](./VISUAL_IDENTITY.md) tokens (color, type, radius).  
- Use real copy from [Messaging Pillars](./MESSAGING_PILLARS.md)—no lorem ipsum in external materials.  
- Include realistic data density for tables/charts.

### Labeling

| Label | Meaning |
|-------|---------|
| Preview | UI may change before release |
| Concept | Illustrative, not shipping UI |
| Simulated data | Numbers are examples |

### Docs vs marketing

- **docs.ordella.com:** Prefer diagrams (Mermaid) over speculative UI.  
- **ordella.com:** Mockups allowed with visible preview labeling when needed.

---

## Illustration and icon imagery

- Align with [Visual Identity — Illustration](./VISUAL_IDENTITY.md#illustration-style).  
- Empty states: simple line illustration + short copy + CTA.  
- Avoid mascots and clip-art in product.

---

## Do / don’t examples (text only)

### Photography

| ✅ Do | ❌ Don’t |
|-------|----------|
| Show real operational context (stockroom, checkout, pickup desk) | Use obviously fake “business people pointing at blank screen” |
| Respect brand clear space when placing logo on photo | Place logo on busy shelf labels without scrim |
| Get model/property releases for campaigns | Use competitor store signage visible in frame |

### Product screenshots

| ✅ Do | ❌ Don’t |
|-------|----------|
| Use fictional customer names and addresses | Show real customer emails, phone numbers, or API keys |
| Match current shipping UI or label as Preview | Show outdated UI without version/date note |
| Highlight one feature per hero image | Shrink full 4K desktop into illegible thumbnail |

### Mockups and charts

| ✅ Do | ❌ Don’t |
|-------|----------|
| State “Simulated performance data” in deck footnotes | Imply guaranteed ROI with fabricated metrics |
| Use Ordella chart colors from Visual Identity | Use default Excel garish palette |
| Crop mobile screenshots to actual viewport | Stretch portrait UI into landscape fake device |

### Social and thumbnails

| ✅ Do | ❌ Don’t |
|-------|----------|
| 1200×630 OG safe zone centered | Put critical text at image edges (platform crop) |
| Link to docs/changelog for feature claims | Post screenshot of unreleased admin with no context |

---

## Imagery on key surfaces

| Surface | Imagery type | Notes |
|---------|--------------|--------|
| **ordella.com** home | Hero photo or loop + UI frame | CTA + tagline overlay |
| **ordella.com** product pages | Screenshots per module | Link to `docs/public/systems/` |
| **docs.ordella.com** | Diagrams &gt; photos | Alt text required |
| **Developer Portal** | Screenshots of keys, webhooks, usage | Redact secrets |
| **pitch-deck/** | Mix photo + architecture | `pitch-deck/DECK_STRUCTURE.md` |
| **Email** | Single hero or none | Host on CDN; alt text in HTML |

---

## Legal and privacy

- No real API keys, JWTs, or tenant IDs in any published image.  
- Blur or replace payment card numbers and government IDs.  
- Third-party trademarks only with permission (POS hardware, payment brands).  
- Stock license must allow commercial use and modification.

---

## Asset request template (placeholder)

When filing a design request:

1. **Surface** (web, deck, social)  
2. **Message pillar** (from MESSAGING_PILLARS.md)  
3. **Fidelity** (photo / screenshot / mockup)  
4. **Labels** (GA / Preview / Concept)  
5. **Doc link** for accuracy review  

---

## Related documentation structure

```
brand/IMAGERY_GUIDELINES.md     ← this file
brand/VISUAL_IDENTITY.md        ← color, type, motion
docs/public/architecture/       ← diagrams for technical accuracy
docs/public/systems/            ← module names for screenshot captions
launch/LAUNCH_NARRATIVE.md      ← story alignment for campaign imagery
```
