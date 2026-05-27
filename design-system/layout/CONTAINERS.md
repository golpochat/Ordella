# Containers

Horizontal constraints and padding for page content.

**Tokens:** [SPACING_TOKENS](../tokens/SPACING_TOKENS.md) · [BREAKPOINTS](./BREAKPOINTS.md)

**Related:** [components/Container](../components/LAYOUT_PRIMITIVES.md) · [GRID_SYSTEM](./GRID_SYSTEM.md)

---

## Container widths

| Tier | Max width | Breakpoint | Typical UIs |
|------|-----------|------------|-------------|
| **mobile** | **100%** (fluid) | ≤480px | driver-ui, storefront phone |
| **tablet** | **640–720px** centered | 481–768px | customer account, narrow marketing prose |
| **desktop** | **960–1280px** | 769–1440px | storefront, customer-ui, marketing content |
| **wide desktop** | **1440px** max outer | 1441px+ | marketing-ui hero band; inner prose still **1280px** |

| Named token | px | Use |
|-------------|-----|-----|
| `container-sm` | 640 | admin narrow forms, legal copy |
| `container-md` | 960 | compact marketing sections |
| `container-lg` | 1280 | **default** commerce + marketing content |
| `container-xl` | 1440 | outer marketing wrapper only |

**admin-ui:** main column is **fluid** (fills shell minus sidebar)—tables may use full width; forms use `container-sm` **inside** content.

**pos-ui / kds-ui:** `container-full` = 100vw; no max-width cap.

---

## Padding rules

### Horizontal (`paddingX`)

| Breakpoint | Token | px |
|------------|-------|-----|
| mobile | `space-16` | 16 |
| tablet+ | `space-24` | 24 |
| marketing wide | `space-32` | 32 optional outer |

### Vertical (`paddingY`)

| Context | Token |
|---------|-------|
| Page content top (below header) | `space-24`–`space-32` |
| marketing section | `space-48`–`space-64` between sections |
| admin dense list | `space-24` |
| driver-ui list | `space-16` |

**Rule:** Padding is on **Container** or shell content region—not duplicated on every child Card.

---

## Fixed vs fluid containers

| Type | Behavior | When |
|------|----------|------|
| **Fluid** | `width: 100%`; max-width optional | admin-ui data area, driver-ui |
| **Fixed max** | `width: 100%`; `max-width: token`; `margin-inline: auto` | storefront, customer-ui, marketing |
| **Full bleed** | Breaks out of max-width for band backgrounds | marketing CTA strip |

**Fixed max + fluid:** outer full-bleed `neutral-50` band; inner `container-lg` centers content.

---

## Usage: admin pages

| Page type | Container |
|-----------|-----------|
| Inventory list | Fluid in shell; `paddingX space-24` |
| Settings form | `container-sm` (640px) centered in content |
| Reports | Fluid; chart Card full width of content |

**Example (text):** “Staff roles” settings — PageHeader full width; form Stack inside `container-sm`.

---

## Usage: storefront pages

| Page type | Container |
|-----------|-----------|
| PLP / category | `container-lg` 1280px; `paddingX space-16` mobile |
| PDP | `container-lg`; 2-col grid desktop |
| Cart / checkout | `container-md` 960px max for readability |

**Example (text):** Product grid centered in `container-lg`; filters collapse to drawer on mobile.

---

## Usage: marketing pages

| Page type | Container |
|-----------|-----------|
| Hero | `container-xl` outer; headline block max 720px |
| Feature sections | `container-lg` inner |
| Footer | `container-lg` |

**Example (text):** Hero screenshot sits in `container-lg`; background gradient is full bleed.

---

## customer-ui

| Rule | Value |
|------|-------|
| Max width | `container-lg` 1280px |
| Forms | `container-sm` 640px |
| Simplicity | Single column Stack default; minimal side nav |

---

## Do / don’t (text)

| Do | Don’t |
|----|--------|
| storefront PDP `container-lg` + 24px padding | 100% width text lines on 4K monitor |
| admin form `container-sm` inside fluid shell | 1280px cap on wide inventory table |
| marketing full-bleed band + inner lg | Double `container-lg` nested with double padding |
| pos-ui 100vw shell | `container-lg` on register |

Next: [LAYOUT_PRIMITIVES.md](./LAYOUT_PRIMITIVES.md)
