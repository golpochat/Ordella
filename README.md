# Ordella

A modern multi-tenant SaaS platform for restaurant ordering, POS, delivery, and operations automation.

## Monorepo layout

```
ordella/
├── apps/
│   ├── api/              # NestJS API (modular monolith)
│   ├── admin/            # Next.js admin dashboard
│   ├── pos/              # Next.js POS
│   ├── customer-app/     # Next.js customer ordering
│   └── driver-app/       # Next.js driver app
├── packages/
│   ├── shared/           # Shared utilities
│   ├── ui/               # Shared UI components
│   ├── types/            # Shared TypeScript types
│   └── config/           # Tooling presets
├── infrastructure/       # Docker, K8s (v2), ops scripts
├── tools/                # Monorepo scripts
└── docs/                 # SRS, API spec, ERD, architecture
```

See [docs/architecture-blueprint.md](docs/architecture-blueprint.md) and [docs/cursor-bootstrap.md](docs/cursor-bootstrap.md).
