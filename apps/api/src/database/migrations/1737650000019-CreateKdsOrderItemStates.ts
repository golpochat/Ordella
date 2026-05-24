import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateKdsOrderItemStates1737650000019 implements MigrationInterface {
  name = 'CreateKdsOrderItemStates1737650000019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "kds_order_item_states" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "order_id" uuid NOT NULL,
        "order_item_id" uuid NOT NULL,
        "station" varchar(64),
        "status" varchar(32) NOT NULL DEFAULT 'pending',
        "started_at" TIMESTAMPTZ,
        "completed_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ,
        CONSTRAINT "PK_kds_order_item_states" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_kds_order_item_states_item" UNIQUE ("order_item_id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_kds_order_item_states_tenant_order"
      ON "kds_order_item_states" ("tenant_id", "order_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_kds_order_item_states_tenant_status"
      ON "kds_order_item_states" ("tenant_id", "status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "kds_order_item_states"`);
  }
}
