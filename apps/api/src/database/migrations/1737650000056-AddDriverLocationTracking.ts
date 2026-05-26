import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDriverLocationTracking1737650000056 implements MigrationInterface {
  name = 'AddDriverLocationTracking1737650000056';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE driver_profiles
        ADD COLUMN IF NOT EXISTS last_lat DECIMAL(10,7) NULL,
        ADD COLUMN IF NOT EXISTS last_lng DECIMAL(10,7) NULL,
        ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE driver_profiles
        DROP COLUMN IF EXISTS last_seen_at,
        DROP COLUMN IF EXISTS last_lng,
        DROP COLUMN IF EXISTS last_lat;
    `);
  }
}

