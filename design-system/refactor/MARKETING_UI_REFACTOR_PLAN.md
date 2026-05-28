# marketing-ui Refactor Plan

**Repo:** `apps/marketing` · **Template:** [MARKETING_UI_TEMPLATE](../module-templates/MARKETING_UI_TEMPLATE.md)

---

## Key views

| View | Routes / files |
|------|----------------|
| Home / landing | `app/page.tsx`, `components/page-hero.tsx`, `how-it-works.tsx`, `pillars.tsx` |
| Features | `app/features/page.tsx`, `components/feature-grid.tsx`, `feature-module-section.tsx` |
| Pricing | `app/pricing/page.tsx`, `components/pricing-grid.tsx`, `pricing-card.tsx` |
| Contact / signup | `app/contact/page.tsx`, `app/signup/page.tsx` |
| Shared | `components/header.tsx`, `footer.tsx`, `container.tsx`, `section.tsx`, `cta-section.tsx` |
| Tokens | `app/globals.css`, `tailwind.config.ts` |

---

## Refactor order

| Order | View |
|-------|------|
| 1 | `container.tsx`, `section.tsx`, `globals.css` → ODS tokens |
| 2 | `header.tsx` / `footer.tsx` |
| 3 | Home hero + CTA |
| 4 | Features page sections |
| 5 | Pricing grid |
| 6 | Contact, signup, blog shell (lower priority) |

---

## Per view execution

| Step | Action |
|------|--------|
| 1 | [MARKETING_UI_TEMPLATE](../module-templates/MARKETING_UI_TEMPLATE.md) |
| 2 | Hero: `font-size-display` desktop; `space-48`+ padding |
| 3 | Sections: `space-48`–`space-64` between blocks |
| 4 | CTA bands: centered Stack; one primary per section |
| 5 | Replace `cta-button.tsx` with ODS [Button](../components/BUTTON.md) variants |
| 6 | Migrate `#3A6DFF` → `primary-600` per [COLOR_TOKENS](../tokens/COLOR_TOKENS.md) (phased PR) |
| 7 | Prose ≤72ch |
| 8 | Visual QA marketing module |

---

## Done criteria (marketing-ui)

- [ ] Home, features, pricing — design-complete  
- [ ] `container-lg` / `container-xl` per [CONTAINERS](../layout/CONTAINERS.md)  
- [ ] No arbitrary section gaps  
- [ ] [cta-button](../apps/marketing/components/cta-button.tsx) eliminated or thin wrapper over ODS Button  
- [ ] Align copy with [website/copy](../../website/copy/homepage.md) — no layout conflict  

**Estimated effort:** 1–2 weeks (first module in migration order).

**Note:** First module validates tokens before admin/pos complexity.
