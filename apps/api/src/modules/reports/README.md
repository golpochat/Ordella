# Reports module

Reporting and analytics per **SRS §14** and **API Spec §12** (blueprint Reporting Service).

## Submodules

| Submodule | Routes | Table |
|-----------|--------|-------|
| `reports` | `/reports/sales`, `/orders`, `/customers`, `/inventory`, `POST /export` | `reports` |
| `report-definitions` | `/report-definitions` | `report_definitions` |
| `report-jobs` | `/report-jobs` | `report_jobs` |
| `report-results` | `/report-results` | `report_results` |

## API Spec §12

- §12.1–§12.4 — analytics endpoints with `from`, `to`, `location_id` query params
- §12.5 — `POST /reports/export` (CSV/PDF via async `report_jobs`)

## Report definition slugs

`sales`, `orders`, `customers`, `inventory`

## Migration

`1737650000010-CreateReportsSchema.ts`

## Not in this scaffold (future)

SRS §14.2 scheduled reports; dashboard/KPI widgets.
