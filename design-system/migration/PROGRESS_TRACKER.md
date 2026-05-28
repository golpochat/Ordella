# ODS Migration — Progress Tracker

Track screen and shell migration status. Update this file when opening or merging refactor PRs.

**Related:** [migration/OVERVIEW](./OVERVIEW.md) · [refactor/OVERVIEW](../refactor/OVERVIEW.md) · [visual QA](../visual-qa/SCREEN_REVIEW_TEMPLATE.md)

---

## Status values

| Status | Meaning |
|--------|---------|
| `not started` | No ODS refactor work |
| `in progress` | PR open or partial implementation |
| `design-complete` | Global + module visual QA PASS; screen review attached |

---

## Shell / layout (admin-ui)

| Module | Screen / area | Migration status | Visual QA | Notes |
|--------|---------------|------------------|-----------|-------|
| admin-ui | **Admin Sidebar** (shell) | **design-complete** | PASS | ODS Sidebar + `admin-nav.tsx`; NavGroup sections, tooltips when collapsed, 240px/64px, mobile drawer, tablet collapse |
| admin-ui | Admin TopNav (shell) | design-complete | PASS | ODS `TopNav` (sticky h-14, shadow-sm, z-50); switchers + user menu |
| admin-ui | **Admin Global Layout** (shell, content, grid, header rhythm) | **design-complete** | PASS | `ContentArea`, `TopNav`, `admin-layout.tsx`; shell wraps `ContentArea`; PageHeader filters slot; responsive Grid |
| admin-ui | Dashboard layout wrapper | design-complete | PASS | `dashboard-shell.tsx` + `PageContainer` + `ContentArea` |

---

## admin-ui screens (priority)

| Module | Screen | Migration status | Visual QA | Notes |
|--------|--------|------------------|-----------|-------|
| admin-ui | Dashboard `/dashboard` | not started | — | |
| admin-ui | Inventory `/inventory` | not started | — | |
| admin-ui | Catalog `/catalog` | not started | — | |
| admin-ui | **Admin Settings Page** `/settings` | **design-complete** | PASS | ODS PageHeader, PageSection, FormLayout, Grid 2-col desktop, localization panel |
| admin-ui | **Admin Tables** (all list/log/history tables) | **design-complete** | PASS | ODS Table primitives, EmptyState, Pagination, TableActions, IconButton actions |
| admin-ui | **Admin Forms** (settings, create/edit, modals, filters) | **design-complete** | PASS | FormLayout, FormField, Select, Textarea, Checkbox, Switch, FormModal, SettingsSection |
| admin-ui | **Admin Reports** (sales/inventory/delivery/promotions, forecasting, analytics reporting) | **in progress** | — | PageHeader + PageSection + Grid/Stack + ODS filter/table controls |
| admin-ui | **Admin Modals** (forms, confirmations, inventory adjustments) | **design-complete** | PASS | `admin-modal.tsx`; ODS Modal sizes, ModalBody, IconButton close, FormModal, ConfirmModal |
| admin-ui | **Admin Detail Pages** (entity drill-downs) | **design-complete** | PASS | `admin-detail.tsx`; orders, audit logs, locations, CRM, subscriptions, analytics insights, reports/forecast drill-downs |
| admin-ui | **Admin Cards** (metrics, summaries, dashboards, reports) | **design-complete** | PASS | `admin-card.tsx` (`MetricCard`, `MetricGrid`, `SectionCard`, `InteractiveCard`, `StatTile`); panel metric migration + analytics KPI/bar charts |
| admin-ui | **Admin Navigation Items** (sidebar, sections, sub-nav) | **design-complete** | PASS | `admin-nav.tsx`; ODS `NavItem`, `NavSection`, `NavGroup`, `NavIcon`, `Tooltip`; collapsible groups; sub-nav via `NavItem` subnav variant |
| admin-ui | **Admin Page Headers** (titles, descriptions, actions, section tabs) | **design-complete** | PASS | ODS `PageHeader` compound API; `admin-page-header.tsx`; SubNav embedded in `tabs`; legacy `action` prop |
| admin-ui | **Admin Empty States** (tables, panels, search, reports) | **design-complete** | PASS | ODS `EmptyState` compound API; `admin-empty-state.tsx` (`PanelEmpty`, `EmptyStateActionLink`); `AdminTableShell` + panel migration |
| admin-ui | **Admin Charts** (analytics, reports, forecasting, insights, twins) | **design-complete** | PASS | ODS `ChartContainer`, `ChartHeader`, `ChartLegend`, `ChartTooltip`, `ChartEmptyState`; `admin-chart.tsx` chart widgets |
| admin-ui | **Admin Filters** (analytics, reports, orders, inventory, CRM, marketing, search) | **design-complete** | PASS | ODS `FilterBar`, `FilterGroup`, `FilterItem`, `DateRangePicker`; `admin-filter.tsx`; panel filter migration |
| admin-ui | **Admin Search Bars** (filters, panels, advanced search, modals) | **design-complete** | PASS | ODS `SearchBar`, `SearchInput`, `SearchIcon`, `SearchClearButton`; `admin-search.tsx`; debounced multi-store search |
| admin-ui | **Admin Pagination** (tables, reports, lists, audit logs) | **design-complete** | PASS | ODS `Pagination`, `PaginationButton`, `PaginationEllipsis`, `IconButton` prev/next; `admin-pagination.tsx`; responsive ellipsis ranges |
| admin-ui | **Admin Toasts/Notifications** (feedback, saves, jobs, workflows) | **design-complete** | PASS | ODS `Toast`, `ToastProvider`, `ToastContainer`, semantic variants; `admin-toast.tsx`; global stack in `theme-root.tsx` |
| admin-ui | **Admin Breadcrumbs** (detail, reports, analytics, forecasting drill-downs) | **design-complete** | PASS | ODS `Breadcrumb`, `BreadcrumbItem`, `BreadcrumbSeparator`, `BreadcrumbIcon`; `admin-breadcrumb.tsx`; `DetailPageHeader` |
| admin-ui | **Admin Loaders/Skeletons** (panels, tables, charts, forms, modals, buttons) | **design-complete** | PASS | ODS `Spinner`, `InlineLoader`, `PageLoader`, `Skeleton*`; `admin-loader.tsx`; `Button` `isLoading`; panel + Suspense migration |
| admin-ui | **Admin Tags/Badges** (status, orders, inventory, CRM, marketing, workflows) | **design-complete** | PASS | ODS `Tag`, `TagLabel`, `TagIcon`, `TagCloseButton`, `TagGroup`; `admin-tag.tsx`; semantic variants; 56+ panel migrations |
| admin-ui | **Admin Tooltips** (nav, icons, charts, forms, status) | **design-complete** | PASS | ODS `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipArrow`; `admin-tooltip.tsx`; `TooltipProvider` in `theme-root.tsx`; Radix collision + a11y |
| admin-ui | **Admin Form Validation States** (fields, forms, modals, multi-step) | **design-complete** | PASS | ODS `FormControl`, `FormLabel`, `FormHelperText`, `FormErrorMessage`, `Alert`; `admin-form-validation.tsx`; `FormErrorAlert`; blur/submit patterns |
| admin-ui | **Admin Dialogs/Confirmations** (delete, disable, revoke, uninstall, cancel) | **design-complete** | PASS | ODS `Dialog*` in `dialog.tsx`; `admin-dialog.tsx` (`ConfirmDialog`, `DeleteConfirmDialog`, `DisableConfirmDialog`, `FormDialog`); destructive no overlay/ESC; panel migration |
| admin-ui | **Admin Keyboard Shortcuts** (global, page, table, modal, forms) | **design-complete** | PASS | ODS `ShortcutManager`, `ShortcutScope`, `ShortcutHint`, `ShortcutOverlay`; `admin-shortcuts.tsx`; Cmd+K palette; `/` search; modal lock; responsive modes |
| admin-ui | **Admin Accessibility Pass** (WCAG 2.2 AA shell + primitives) | **design-complete** | PASS | ODS `SkipToContent`, `AccessibilityProvider`, `FocusRing`, `LiveRegion`; `admin-a11y.tsx`; landmarks; mobile drawer focus trap; table/chart/toast/modal a11y |
| admin-ui | **Admin Performance Pass** (async boundaries, SWR, virtualization, lazy panels) | **design-complete** | PASS | ODS `AsyncBoundary`, `VirtualizedList`, `LazyMount`; `admin-performance.tsx` (SWR + Web Vitals); route `loading.tsx`; `lazy-panels` / `lazy-charts`; `AdminVirtualTable`; locations + low-stock SWR |
| admin-ui | **Admin Theming / Dark Mode** (ODS theme engine, tokens, appearance) | **design-complete** | PASS | `OdsThemeProvider`, `ThemeSwitcher`, semantic tokens; light/dark/system/high-contrast; bootstrap script; toast/tag/alert tokens; `admin-theme.tsx`; TopNav switcher |
| admin-ui | **Admin Internationalization (i18n)** | **design-complete** | PASS | `I18nProvider`, `useTranslation`, `LocaleSwitcher`, `locales/*`, RTL `dir`; nav/subnav/settings/dialogs; `extract-admin-i18n.mjs`; lazy locale bundles |
| admin-ui | **Admin Micro‑Animations & Motion** | **design-complete** | PASS | ODS motion tokens (`design-tokens-motion.css`); `motion.ts` utilities; PageTransition/StaggerReveal; button/modal/toast/nav/sidebar/table/skeleton; `admin-motion.tsx` |
| admin-ui | **Admin QA + Polish Pass** | **in progress** | — | JSX/layout repair (Stack/fragment closings, Tag syntax); ODS primitive imports; shell alignment; command palette i18n; ~160 TS cleanup items remain (unused imports, Button/Tag variant mapping) |

---

## Other modules

| Module | Screen / area | Migration status | Visual QA | Notes |
|--------|---------------|------------------|-----------|-------|
| marketing-ui | — | not started | — | |
| pos-ui | — | not started | — | |
| kds-ui | — | not started | — | |
| driver-ui | — | not started | — | |
| storefront-ui | — | not started | — | |
| customer-ui | — | not started | — | |

---

## How to update

1. Set **Migration status** to `in progress` when the refactor branch is created.  
2. Complete [GLOBAL_VISUAL_QA_CHECKLIST](../visual-qa/GLOBAL_VISUAL_QA_CHECKLIST.md) + [MODULE_SPECIFIC_QA](../visual-qa/MODULE_SPECIFIC_QA.md).  
3. Attach [SCREEN_REVIEW_TEMPLATE](../visual-qa/SCREEN_REVIEW_TEMPLATE.md) to the PR.  
4. Set **Visual QA** to `PASS` and **Migration status** to `design-complete`.  
5. Commit this file in the same PR or immediately after merge.

**Last updated:** Admin QA + Polish Pass — layout/JSX repair and ODS primitive fixes landed; typecheck variant/unused-import cleanup in progress.
