import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSupplierPortalMvp1737650000053 implements MigrationInterface {
  name = 'CreateSupplierPortalMvp1737650000053';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE suppliers
        ADD COLUMN IF NOT EXISTS portal_user_email VARCHAR(255) NULL,
        ADD COLUMN IF NOT EXISTS portal_password_hash TEXT NULL,
        ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ NULL;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_suppliers_tenant_portal_email
        ON suppliers(tenant_id, portal_user_email)
        WHERE portal_user_email IS NOT NULL;

      ALTER TABLE purchase_orders
        ADD COLUMN IF NOT EXISTS supplier_status VARCHAR(32) NOT NULL DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS supplier_expected_delivery_date DATE NULL,
        ADD COLUMN IF NOT EXISTS supplier_notes TEXT NULL;

      CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_supplier_status
        ON purchase_orders(tenant_id, supplier_id, supplier_status);

      CREATE TABLE IF NOT EXISTS supplier_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        purchase_order_id UUID NULL REFERENCES purchase_orders(id) ON DELETE SET NULL,
        sender_type VARCHAR(32) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_supplier_messages_tenant_supplier_created
        ON supplier_messages(tenant_id, supplier_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_supplier_messages_tenant_po_created
        ON supplier_messages(tenant_id, purchase_order_id, created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_supplier_messages_tenant_po_created;
      DROP INDEX IF EXISTS idx_supplier_messages_tenant_supplier_created;
      DROP TABLE IF EXISTS supplier_messages;
      DROP INDEX IF EXISTS idx_purchase_orders_tenant_supplier_status;
      ALTER TABLE purchase_orders
        DROP COLUMN IF EXISTS supplier_notes,
        DROP COLUMN IF EXISTS supplier_expected_delivery_date,
        DROP COLUMN IF EXISTS supplier_status;
      DROP INDEX IF EXISTS idx_suppliers_tenant_portal_email;
      ALTER TABLE suppliers
        DROP COLUMN IF EXISTS last_login_at,
        DROP COLUMN IF EXISTS portal_password_hash,
        DROP COLUMN IF EXISTS portal_user_email;
    `);
  }
}
