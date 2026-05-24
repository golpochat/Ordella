import { MigrationInterface, QueryRunner } from 'typeorm';

/** Tenant onboarding, branding, billing, staff invites, multi-tenant memberships */
export class CreateTenantOnboardingSchema1737650000020 implements MigrationInterface {
  name = 'CreateTenantOnboardingSchema1737650000020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tenant_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
        currency VARCHAR(8) NOT NULL DEFAULT 'USD',
        locale VARCHAR(16) NOT NULL DEFAULT 'en-US',
        opening_hours JSONB NOT NULL DEFAULT '{}',
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS tenant_branding (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
        logo_url TEXT,
        theme JSONB NOT NULL DEFAULT '{}',
        business_info JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS tenant_billing (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
        plan VARCHAR(32) NOT NULL DEFAULT 'free',
        billing_email VARCHAR(255),
        payment_method JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS tenant_onboarding (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
        current_step VARCHAR(32) NOT NULL DEFAULT 'started',
        completed_steps JSONB NOT NULL DEFAULT '[]',
        is_complete BOOLEAN NOT NULL DEFAULT FALSE,
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS staff_invitations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
        invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        token VARCHAR(128) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_staff_invitations_tenant_email
        ON staff_invitations (tenant_id, email);

      CREATE TABLE IF NOT EXISTS tenant_memberships (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ,
        UNIQUE (tenant_id, user_id)
      );

      CREATE INDEX IF NOT EXISTS idx_tenant_memberships_user
        ON tenant_memberships (user_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS tenant_memberships;
      DROP TABLE IF EXISTS staff_invitations;
      DROP TABLE IF EXISTS tenant_onboarding;
      DROP TABLE IF EXISTS tenant_billing;
      DROP TABLE IF EXISTS tenant_branding;
      DROP TABLE IF EXISTS tenant_settings;
    `);
  }
}
