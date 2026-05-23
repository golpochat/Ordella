import { Repository, ObjectLiteral } from 'typeorm';

/**
 * Base repository helpers for tenant-scoped queries.
 * All queries must filter by tenantId — enforced in concrete repositories.
 */
export abstract class BaseTenantRepository<Entity extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<Entity>) {}

  protected withTenantScope(tenantId: string): { tenantId: string } {
    return { tenantId };
  }
}
