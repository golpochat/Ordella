# Data Flow Architecture

How operational and analytical data moves through ingestion, storage, and consumption.

Transactional writes land in tenant-scoped operational stores; events fan out asynchronously to integrators and the Data Lake.

Read models and caches are rebuilt from events where needed to protect write-path latency at scale.

Batch and streaming ETL paths are documented alongside Data Lake system capabilities.

## Overview

<!-- Expanded content planned -->

## Operational data path

<!-- Expanded content planned -->

## Analytics and lake pipelines

<!-- Expanded content planned -->

## Knowledge graph ingestion

<!-- Expanded content planned -->

## Governance and lineage

<!-- Expanded content planned -->

## Related pages

- [Event Flow](../architecture/event-flow.md)
- [Data Lake & ETL](../systems/data-lake.md)
- [High-Level Architecture](../architecture/high-level-architecture.md)

---

[← Back to Master Documentation Index](../../MASTER_INDEX.md)
