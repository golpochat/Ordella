# Ordella Component Styles

UI pattern documentation for product apps, Developer Portal, and marketing components. **Documentation only**—implementations live in `packages/ui`, `apps/shared-ui`, and app-specific code.

**Related:** [Visual Identity](./VISUAL_IDENTITY.md) · [Developer Portal](../developer-portal/) · `apps/marketing/components/`

---

## Global conventions

<!-- Placeholder: Align with design tokens when unified. -->

- **No inline styles** in React components—use Tailwind utility classes or shared CSS variables.  
- **Focus rings:** Visible keyboard focus on all interactive elements.  
- **Density:** Default comfortable; compact mode for data-heavy admin tables (TBD).  
- **Dark mode:** Document tokens when available; until then, light mode is canonical reference.

---

## Buttons

### Variants (placeholder)

| Variant | Use | Example label |
|---------|-----|----------------|
| **Primary** | Main action per view | “Save changes”, “Create API key” |
| **Secondary** | Alternative actions | “Cancel”, “Back” |
| **Ghost** | Tertiary / toolbar | “Export CSV” |
| **Destructive** | Irreversible delete | “Delete tenant” |

### Rules

- One primary button per modal or card footer.  
- Destructive requires confirmation pattern (modal or typed confirm).  
- Minimum hit target **44×44px** on touch surfaces.  
- Loading state: disable + spinner + “Saving…” (not blank button).

### Text examples

| ✅ | ❌ |
|----|-----|
| “Create webhook” | “Submit” |
| “Delete location” | “OK” |

### References

- Marketing CTAs: `apps/marketing` button components  
- Shared patterns: `apps/shared-ui`

---

## Cards

### Anatomy

```
┌──────────────────────────────────────┐
│  Title (heading-md)                  │
│  Optional description (body-sm)      │
│  ─────────────────────────────────   │
│  Content area                        │
│  [ Secondary ]  [ Primary ]          │
└──────────────────────────────────────┘
```

### Rules

- `radius-md`, `shadow-brand` or subtle border on marketing; border-only in dense admin.  
- Padding `space-4` to `space-6`.  
- Screenshot/marketing frames: see `apps/marketing/components/screenshot-frame.tsx`.

### Text examples

- Title: “Webhook deliveries”  
- Meta: “Last 24 hours · 1,204 events”

---

## Navigation

### Marketing site (**ordella.com**)

- Top nav: Product, Developers, Partners, Pricing (placeholder IA).  
- Sticky header with clear CTA (“Request demo” / “Start building”).  
- Footer: docs link → **docs.ordella.com**, API status, legal.

### Documentation (**docs.ordella.com**)

- Config: `docs/public/_config/navigation.json`, `sidebar.json`.  
- Left sidebar hierarchy mirrors [MASTER_INDEX](../docs/MASTER_INDEX.md).  
- “Related pages” footer on articles.

### Product app

- Collapsible sidebar (`apps/shared-ui/src/components/sidebar.tsx`).  
- Brand slot: `<Logo variant="mark" />` + product name when expanded.  
- Active item: background `accent` + `font-medium`.

### Developer Portal

- Section-based sidebar mirroring `developer-portal/sections/`.  
- Cross-link to public API reference for endpoint detail.

---

## Forms

### Fields

| Element | Style notes |
|---------|-------------|
| Label | `body-sm`, `font-medium`, above field |
| Input | `radius-sm`, border `neutral-200`, focus ring primary |
| Help text | `caption`, neutral-600 |
| Error | `caption`, danger color + icon; explain fix |

### Rules

- Mark required fields with “(required)” or asterisk + legend.  
- Password fields: show strength hint, not cute copy.  
- API key display: copy button + “Shown once” warning.

### Text examples

| ✅ Error | ❌ Error |
|----------|----------|
| “Enter a valid HTTPS URL for the webhook endpoint.” | “Invalid input.” |

### References

- Auth and settings flows in `apps/admin-ui` (patterns vary—converge over time).

---

## Tables

### Use cases

- Admin lists (tenants, locations, orders).  
- Developer Portal usage/billing tables (`developer-portal/sections/billing-overview.md`).  
- Docs: comparison tables in Markdown.

### Rules

- Sticky header on long scroll.  
- Right-align numeric columns; tabular nums.  
- Row actions: icon button + menu for &gt;2 actions.  
- Empty state: illustration + headline + primary CTA (see Cards).

### Text examples

- Empty: “No API keys yet. Create a key to authenticate requests.”  
- Column: “Created” / “Last used” / “Status”

---

## Charts

### Style (placeholder)

- **Series colors:** Primary, accent, then neutral-600, success, warning (max 5 series).  
- **Grid lines:** Subtle `neutral-200`; avoid heavy borders.  
- **Labels:** `body-sm`; tooltips with precise values + units.  
- **Accessibility:** Patterns or labels in addition to color for multi-series.

### Use in product

- Operations dashboards, inventory velocity, marketing performance.  
- Prefer sparklines in cards; full charts on dedicated analytics views.

### Text examples

- Y-axis: “Units sold”  
- Tooltip: “12 Apr · 1,240 units · +8% vs prior week”

---

## UI patterns

### Modals

- Title = action outcome (“Delete webhook?”).  
- Body = consequence + what cannot be undone.  
- Footer: Secondary (Cancel) + Primary/Destructive.

### Toasts

- Short sentence + optional action (“Undo”, “View log”).  
- Auto-dismiss 5s except errors (persist until dismissed).

### Banners

- Info / warning / error strip below header for platform notices.  
- Link to `docs/public/changelog.md` for releases.

### Cookie / consent

- Reference: `apps/marketing/components/cookie-banner.tsx` — calm copy, border-top, no aggressive colors.

### Loading

- Skeleton for tables and cards; spinner only for inline/button.

### Code blocks (docs + portal)

- Monospace, method uppercase (`GET`, `POST`).  
- Base URL: `https://api.ordella.com/v1` per [branding.md](../docs/public/_config/branding.md).

---

## Cross-app consistency matrix

| Component | packages/ui | shared-ui | marketing | admin-ui |
|-----------|-------------|-----------|-----------|----------|
| Logo | ✅ | via import | ✅ | ✅ |
| Button tokens | TBD | partial | ✅ | partial |
| Sidebar | — | ✅ | docs sidebar | ✅ |

---

## Review checklist for new UI

- [ ] Uses shared tokens / Tailwind theme variables  
- [ ] Voice matches [VOICE_AND_TONE](./VOICE_AND_TONE.md)  
- [ ] Keyboard and screen reader accessible  
- [ ] Empty, loading, and error states defined  
- [ ] Linked to relevant doc section where users need help  
