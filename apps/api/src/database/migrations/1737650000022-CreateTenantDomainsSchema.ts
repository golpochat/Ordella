import { MigrationInterface, QueryRunner } from 'typeorm';

/** Custom domains and verified hostnames for multi-tenant routing */
export class CreateTenantDomainsSchema1737650000022 implements MigrationInterface {
  name = 'CreateTenantDomainsSchema1737650000022';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tenant_domains (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        domain VARCHAR(255) NOT NULL,
        domain_type VARCHAR(32) NOT NULL DEFAULT 'custom',
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        verified BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ,
        CONSTRAINT uq_tenant_domains_domain UNIQUE (domain)
      );

      CREATE INDEX IF NOT EXISTS idx_tenant_domains_tenant_id
        ON tenant_domains (tenant_id);

      CREATE INDEX IF NOT EXISTS idx_tenant_domains_domain_verified
        ON tenant_domains (domain)
        WHERE verified = TRUE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS tenant_domains`);
  }
}
