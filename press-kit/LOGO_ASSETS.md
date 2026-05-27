# Ordella — Logo Assets (Press)

Text-only reference for press and marketing teams. **No binary files in `/press-kit`**—source SVGs live in `packages/ui/assets/`. Full rules: [Brand Logo Guidelines](../brand/LOGO_GUIDELINES.md).

**Related:** [Visual Identity](../brand/VISUAL_IDENTITY.md) · [Company boilerplate](./COMPANY_BOILERPLATE.md)

---

## Logo variations (descriptions)

| Variation | Description | Source file (repo) | Typical use |
|-----------|-------------|-------------------|-------------|
| **Primary wordmark** | Horizontal “Ordella” logotype | `packages/ui/assets/logo.svg` | Press headers, website, decks |
| **Light background** | Dark logo on white/neutral | `packages/ui/assets/logo-light.svg` | Fact sheets, light articles |
| **Dark background** | Light/reversed logo on navy/primary | `packages/ui/assets/logo-dark.svg` | Hero banners, video end cards |
| **Mark only** | Icon without wordmark | `packages/ui/assets/logo-mark.svg` | Favicon, social avatars, tight crops |
| **Monochrome** | Single-color knockout | Derived per [Logo Guidelines](../brand/LOGO_GUIDELINES.md) | Print, fax, single-ink |

**Press pack delivery (placeholder):** `press-kit/assets/logos/` — ZIP to include SVG + PNG @1x/@2x when distributed (`<!-- NOT IN REPO YET -->`).

**Product name:** Always **Ordella** (capital O). Pair with tagline **The Retail Operating System** on first major mention when space allows.

---

## Usage rules

### Do

- Use official SVG/PNG exports only—do not retype the logo in another font.  
- Maintain [clear space](#clear-space-rules) around the lockup.  
- Use **logo-dark** on primary (`#0F766E` placeholder) or navy backgrounds; **logo-light** on white/light gray.  
- Ensure **4.5:1 contrast** minimum between logo and background (WCAG AA).  
- On photography, place logo on a **solid scrim band** if the background is busy.  
- Co-brand at **equal visual height** with partner logos, separated by rule or adequate margin—see [Partner program](../docs/public/partners/partner-program.md).

### Do not

- Stretch, rotate, skew, or add effects (drop shadow, glow, outline) not in approved assets.  
- Change logo colors to non-brand gradients or low-contrast pastels.  
- Crowd the clear zone with text, badges, or UI chrome.  
- Use mark-only lockup as the **first** customer-facing brand touch on main launch materials (prefer full wordmark on homepage/press release header).

---

## Clear space rules

Clear space on all sides equals **X**, where **X** is the height of the capital **“O”** in the wordmark (or the height of the mark in mark-only usage).

No other graphic elements, headlines, or partner logos may enter the clear zone. Increase padding on small formats rather than shrinking below [minimum sizes](#minimum-sizes).

```
        ┌─────────────────────────────┐
        │         X (clear)           │
        │   ┌───────────────────┐     │
        │ X │     ORDELLA       │ X   │
        │   └───────────────────┘     │
        │         X (clear)           │
        └─────────────────────────────┘
```

*Detailed spec: [brand/LOGO_GUIDELINES.md](../brand/LOGO_GUIDELINES.md)*

---

## Minimum sizes

| Variation | Digital (min width) | Print (min width) |
|-----------|---------------------|-------------------|
| Full wordmark | 120px | 25mm |
| Mark only | 24px (32×32 favicon canvas) | 10mm |

Below minimum, use **mark only** or increase layout size—never distort aspect ratio.

---

## Incorrect usage examples (text descriptions)

Press and partners must **avoid** the following—common errors in amateur layouts:

1. **Stretched wordmark** — Logo wider or taller than official aspect ratio.  
2. **Rotated or skewed logo** — Any angle other than horizontal wordmark / upright mark.  
3. **Unapproved colors** — Rainbow fill, neon gradient, or low-contrast pastel on white.  
4. **Effects** — Drop shadows, bevels, outer glows not in master SVG.  
5. **Busy photo placement** — Full-color logo on cluttered shelf imagery without scrim.  
6. **Typography substitute** — Word “Ordella” set in Arial/Helvetica instead of official wordmark.  
7. **Clear-space violation** — Headline or partner logo touching the lockup.  
8. **Co-brand dominance** — Partner logo larger than Ordella in co-marketing without agreement.

Report misuse to brand/communications via [CONTACT.md](./CONTACT.md).

---

## Requesting assets

| Request type | Contact | Include |
|--------------|---------|---------|
| Press logo ZIP | Press — [CONTACT.md](./CONTACT.md) | Outlet name, deadline, color/light vs dark |
| Partner co-brand | Partner — [CONTACT.md](./CONTACT.md) | Partner name, layout mockup |
| Product UI in logo frame | See [SCREENSHOTS.md](./SCREENSHOTS.md) | Do not composite fake UI into logo clear space |

**Website implementation:** `apps/marketing` · **Shared components:** `packages/ui/src/components/logo.tsx`
