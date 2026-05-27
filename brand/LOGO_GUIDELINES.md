# Ordella Logo Guidelines

Rules for the Ordella wordmark and mark. **Assets are not stored in `/brand`**—use placeholders below and implement from `packages/ui/assets/`.

**Related:** [Visual Identity](./VISUAL_IDENTITY.md) · [packages/ui README](../packages/ui/README.md)

---

## Logo assets (reference paths)

<!-- Placeholder paths — verify filenames before external distribution. -->

| Asset | Path | Description |
|-------|------|-------------|
| Full wordmark | `packages/ui/assets/logo.svg` | Primary horizontal logo |
| Wordmark (dark bg) | `packages/ui/assets/logo-dark.svg` | Light logo for dark surfaces |
| Wordmark (light bg) | `packages/ui/assets/logo-light.svg` | Dark logo for light surfaces |
| Mark only | `packages/ui/assets/logo-mark.svg` | Icon / favicon / compact UI |
| React components | `packages/ui/src/components/logo.tsx`, `logo-mark-svg.tsx` | `Logo` with `variant`, `size`, `color` props |

**Public docs placeholder:** `/assets/logo.svg` per [branding.md](../docs/public/_config/branding.md).

**Website:** **ordella.com** — header, footer, favicon, OG image templates.  
**Product:** Admin sidebar, customer app header (`apps/customer-app`), auth screens.

---

## Logo variations

### 1. Primary lockup (horizontal)

Default for marketing header, presentations, and partner co-brand decks.

**Use when:** Horizontal space ≥ [minimum width](#minimum-sizes).  
**Clear space:** See [Clear space](#clear-space).

### 2. Mark only

Square mark without wordmark for favicons, app icons, collapsed sidebar, and avatars.

**Use when:** Space &lt; 120px wide or square format required.  
**Do not** use mark alone on first customer touchpoint (prefer full lockup on homepage).

### 3. Reversed / on color

Use `logo-dark.svg` on primary or navy backgrounds; `logo-light.svg` on white/light gray.

**Placeholder rule:** Logo fill must maintain **4.5:1** contrast against background.

### 4. Monochrome

Single-color knockouts for print fax, emboss, or single-ink swag.

**Placeholder:** Use `neutral-900` on light; white on dark. No gradients in monochrome applications.

---

## Clear space

<!-- Placeholder: Replace X with finalized cap-height or mark width measurement. -->

Clear space around the logo equals **X** on all sides, where **X** = height of the “O” in Ordella (or height of the mark in mark-only usage).

```
        ┌─────────────────────────────┐
        │         X (clear)           │
        │   ┌───────────────────┐     │
        │ X │     ORDELLA       │ X   │
        │   └───────────────────┘     │
        │         X (clear)           │
        └─────────────────────────────┘
```

- No text, imagery, or UI elements inside the clear zone.  
- On photography, prefer solid overlay band if contrast is insufficient.

---

## Minimum sizes

<!-- Placeholder sizes for screen and print — validate with design. -->

| Variation | Digital (min width) | Print (min width) |
|-----------|---------------------|-------------------|
| Full lockup | 120px | 25mm |
| Mark only | 24px (favicon 32×32 canvas) | 10mm |

Below minimum sizes, use **mark only** or increase padding—do not scale below legibility.

---

## Color usage on logo

| Background | Logo treatment |
|------------|----------------|
| White / neutral-50 | Primary wordmark (`logo-light.svg`) |
| Primary-600 / navy | Reversed (`logo-dark.svg`) |
| Photography | Solid scrim + reversed logo |

**Component API (example):**

```tsx
<Logo variant="full" size="md" color="auto" />
<Logo variant="mark" size="sm" color="auto" />
```

---

## Incorrect usage examples

<!-- Text-only descriptions — do not replicate in production. -->

### ❌ Do not stretch or distort

Changing aspect ratio of the wordmark or mark.

**Why:** Breaks trademark consistency and legibility.

### ❌ Do not rotate

Applying rotation or skew to the logo.

**Why:** Ordella lockup is designed horizontal (or mark upright only).

### ❌ Do not change colors arbitrarily

Using non-brand gradients, rainbow fills, or low-contrast pastels on the wordmark.

**Why:** Fails accessibility and brand recognition.

### ❌ Do not add effects

Drop shadows, outer glow, bevel, or outline strokes not in approved assets.

**Why:** Appears unprofessional on enterprise collateral.

### ❌ Do not place on busy imagery without scrim

Full-color logo directly on cluttered product photos.

**Why:** Illegible; use clear space + overlay.

### ❌ Do not recreate the logo in a different typeface

Typing “Ordella” in Arial/Helvetica instead of the official wordmark.

**Why:** Off-brand; use SVG assets only.

### ❌ Do not combine with other logos inside clear space

Partner logos crowding Ordella clear zone.

**Why:** Use separated co-brand layout with equal visual weight and divider.

---

## Co-branding (partners)

<!-- Placeholder layout rules. -->

- Ordella and partner logos at **equal visual height**.  
- Separated by vertical rule or `space-8` minimum.  
- Ordella typically **left** in LTR locales; follow partner program legal.  
- See [Partner program](../docs/public/partners/partner-program.md) for API vs marketing co-brand.

---

## File delivery checklist

When requesting assets from design (placeholder):

- [ ] SVG (preferred) + PNG @1x/@2x  
- [ ] Favicon ICO + 180×180 Apple touch  
- [ ] OG image template 1200×630 with safe zone  
- [ ] Dark/light variants documented  

---

## Surfaces map

| Surface | Variation | Asset source |
|---------|-----------|--------------|
| ordella.com header | Full lockup | `packages/ui` / marketing static |
| docs.ordella.com | Full or text “Ordella” | `docs/public/_config/branding.md` |
| Favicon | Mark | `logo-mark.svg` |
| Email signature | Full lockup | Brand kit (TBD) |
| Slide deck | Full + mark slide | `pitch-deck/` |
