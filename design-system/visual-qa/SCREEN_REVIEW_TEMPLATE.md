# Screen Review Template

Copy into PR description, ticket comment, or design review doc for each screen sign-off.

**Related:** [GLOBAL_VISUAL_QA_CHECKLIST](./GLOBAL_VISUAL_QA_CHECKLIST.md) · [MODULE_SPECIFIC_QA](./MODULE_SPECIFIC_QA.md) · [module templates](../module-templates/OVERVIEW.md)

---

## Screen metadata

| Field | Value |
|-------|--------|
| **Screen name** | e.g. Inventory list |
| **Route / path** | e.g. `/inventory` |
| **Module** | admin-ui / pos-ui / kds-ui / driver-ui / storefront-ui / customer-ui / marketing-ui |
| **Repo** | e.g. `apps/admin-ui` |
| **Module template** | Link: e.g. [ADMIN_UI_TEMPLATE](../module-templates/ADMIN_UI_TEMPLATE.md) |
| **Reviewer** | |
| **Date** | |
| **PR / ticket** | |

---

## Viewports tested

| Viewport | Tested? | PASS/FAIL |
|----------|---------|-----------|
| mobile ≤480px | ☐ | |
| tablet 481–768px | ☐ | |
| desktop 769–1440px | ☐ | |
| wide 1441px+ | ☐ / N/A | |
| POS 1024×768 | ☐ / N/A | |
| POS 1280×800 | ☐ / N/A | |
| KDS 1920×1080 | ☐ / N/A | |
| driver 375×812 | ☐ / N/A | |

---

## Checklist

Mark **PASS**, **FAIL**, or **N/A** for each section.

### 1. Layout structure

| # | Check | Result |
|---|--------|--------|
| L1 | Correct module shell (sidebar / split / fullscreen / mobile list) | |
| L2 | PageHeader present when required | |
| L3 | Content uses Container rules for module | |
| L4 | Matches module template diagram | |

**Notes / defects:**

---

### 2. Spacing

| # | Check | Result |
|---|--------|--------|
| S1 | 8px grid / ODS space tokens only | |
| S2 | PageHeader → content `space-32` | |
| S3 | Section gaps consistent | |
| S4 | Card / modal / table padding correct | |

**Notes / defects:**

---

### 3. Alignment

| # | Check | Result |
|---|--------|--------|
| A1 | Content left edge aligned with filters/table | |
| A2 | PageHeader actions aligned right (desktop) | |
| A3 | Numeric columns right-aligned | |
| A4 | Modal footer actions correct order | |

**Notes / defects:**

---

### 4. Typography

| # | Check | Result |
|---|--------|--------|
| T1 | Only approved typography tokens | |
| T2 | Heading hierarchy correct | |
| T3 | No arbitrary font-size overrides | |
| T4 | Tabular nums on money/qty where needed | |

**Notes / defects:**

---

### 5. Component usage

| # | Check | Result |
|---|--------|--------|
| C1 | ODS components only (no one-offs) | |
| C2 | Correct variants and sizes | |
| C3 | States: hover, focus, disabled, loading | |
| C4 | ≤1 primary per action cluster | |
| C5 | Form labels, errors, empty states | |

**Notes / defects:**

---

### 6. Responsiveness

| # | Check | Result |
|---|--------|--------|
| R1 | Breakpoint behavior per [layout/BREAKPOINTS](../layout/BREAKPOINTS.md) | |
| R2 | Tables scroll or stack correctly | |
| R3 | POS/KDS fixed layout stable (if applicable) | |
| R4 | No horizontal page overflow (unintended) | |

**Notes / defects:**

---

### 7. Accessibility (visual QA basics)

| # | Check | Result |
|---|--------|--------|
| X1 | Focus states visible | |
| X2 | Touch targets ≥44px (operational UIs) | |
| X3 | Contrast AA for text | |
| X4 | Errors have text; icon-only buttons labeled | |

**Notes / defects:**

---

## Pass / fail criteria

| Overall result | Criteria |
|----------------|----------|
| **PASS** | All sections **PASS** or **N/A**; zero open **FAIL** without waived ticket |
| **FAIL** | Any required **FAIL**; or module/global checklist not run |
| **PASS WITH DEBT** | Not design-complete—use only for non-launch screens with explicit design lead waiver + ticket IDs |

---

## Defect log

| ID | Type (visual/functional) | Description | ODS reference | Severity | Ticket |
|----|--------------------------|-------------|---------------|----------|--------|
| 1 | | | | blocker / major / minor | |
| 2 | | | | | |

**Severity:**

- **blocker** — fails global QA; must fix before design-complete  
- **major** — fails module QA or template  
- **minor** — polish; may ship only with waiver  

---

## Final sign-off

| | |
|-|-|
| **Global checklist** | PASS / FAIL — link or attach |
| **Module checklist** | PASS / FAIL / N/A |
| **Design-complete** | YES / NO |
| **Reviewer signature** | |

---

## Quick links

- [GLOBAL_VISUAL_QA_CHECKLIST](./GLOBAL_VISUAL_QA_CHECKLIST.md)  
- [MODULE_SPECIFIC_QA](./MODULE_SPECIFIC_QA.md)  
- [BEFORE_AFTER_EXAMPLES](./BEFORE_AFTER_EXAMPLES.md)
