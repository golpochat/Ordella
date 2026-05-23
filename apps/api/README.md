# @ordella/api

NestJS modular monolith API.

## Auth module (`src/modules/auth`)

Scaffolded per SRS §1, API Spec §1, and ERD §1.1.

| Submodule | Routes | Description |
|-----------|--------|-------------|
| `authentication` | `/api/v1/auth/*` | Login, PIN login, refresh, logout, MFA |
| `users` | `/api/v1/users` | User accounts (tenant-scoped) |
| `roles` | `/api/v1/roles` | RBAC roles + permission assignment |
| `permissions` | `/api/v1/permissions` | Global permission catalog |
| `sessions` | `/api/v1/sessions` | Session list & terminate |
| `api-keys` | `/api/v1/api-keys` | Tenant-scoped API keys |

### Entities

`users`, `roles`, `permissions`, `role_permissions`, `sessions`, `api_keys`, `user_devices`, `mfa_factors`

### Migrations

1. `1737650000000-CreateTenantsStub.ts` — minimal `tenants` table (FK dependency)
2. `1737650000001-CreateAuthSchema.ts` — auth tables

```bash
npm run migration:run
```

### Tenant resolution

`TenantMiddleware` resolves tenant from `X-Tenant-Id` header or subdomain. JWT claims will augment this in `JwtStrategy` (TODO).

## Development

```bash
npm install
npm run start:dev
```

Requires PostgreSQL (`DATABASE_URL` in `.env`).
