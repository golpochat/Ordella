# Changelog

Release history and versioning policy for the Ordella platform and public APIs.

Ordella follows semantic versioning for API contracts (`MAJOR.MINOR.PATCH`) and calendar-based labels for platform feature bundles. Breaking API changes require a new major version and advance notice in this changelog.

## Versioning structure

| Component | Scheme | Notes |
|-----------|--------|-------|
| REST API | `v1`, `v2`, … | URL path prefix; deprecations announced here |
| Platform modules | `YYYY.MM` | Feature releases (e.g. Retail Genome, Cloud Platform) |
| Documentation | `docs-YYYY.MM.DD` | Public docs site updates |

### Support policy (placeholder)

- **Current API:** `v1` — fully supported
- **Deprecated:** announced 90 days before removal
- **Preview:** modules marked `beta` in Systems docs

## Release notes template

Use this template for each release entry:

```markdown
## [version] — YYYY-MM-DD

### Added
- ...

### Changed
- ...

### Deprecated
- ...

### Fixed
- ...

### Security
- ...
```

## Release history

### docs-2026.05.27

#### Added

- Public documentation site structure at docs.ordella.com (content)
- Master index, architecture blueprint references, systems and compliance sections
- Search config with synonyms (e.g. POS ↔ point of sale)

<!-- Platform API release notes to be appended below -->

### platform-2026.05 (placeholder)

#### Added

- Partner Network, Compliance Suite, Cloud Platform, Retail Genome modules
- Admin UI surfaces for enterprise modules

---

## Related pages

- [API Reference](./api-reference.md)
- [API Overview](./developers/api-overview.md)
- [Introduction](./getting-started/introduction.md)

---

[← Back to Master Documentation Index](../MASTER_INDEX.md)
