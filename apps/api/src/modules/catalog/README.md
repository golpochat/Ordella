# Catalog module

Product catalog per **SRS §3** and **API Spec §3**.

## Submodules

| Submodule | Routes | ERD |
|-----------|--------|-----|
| `categories` | `/api/v1/categories` | `categories` |
| `products` | `/api/v1/products` | `products` |
| `variants` | `/api/v1/variants` | `variants` |
| `modifiers` | `/api/v1/modifiers` | `modifiers` + `modifier_options` |
| `addons` | `/api/v1/addons` | `addons` |

All routes are tenant-scoped (`TenantGuard` + `X-Tenant-Id` / subdomain).

## SRS extensions (entity placeholders)

- `products.channel_visibility` — multi-channel visibility (POS, Online, WhatsApp)
- `categories.sort_order`, `products.sort_order` — catalog sorting

## Migration

`1737650000003-CreateCatalogSchema.ts`
