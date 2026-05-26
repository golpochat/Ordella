import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTenantLocalizationSettings1737650000046 implements MigrationInterface {
  name = 'AddTenantLocalizationSettings1737650000046';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE tenant_settings
        ALTER COLUMN currency SET DEFAULT 'EUR',
        ALTER COLUMN locale SET DEFAULT 'en-IE';

      ALTER TABLE tenant_settings
        ADD COLUMN IF NOT EXISTS currency_symbol VARCHAR(8) NOT NULL DEFAULT '€',
        ADD COLUMN IF NOT EXISTS timezone VARCHAR(64) NOT NULL DEFAULT 'Europe/Dublin',
        ADD COLUMN IF NOT EXISTS date_format VARCHAR(32) NOT NULL DEFAULT 'DD/MM/YYYY',
        ADD COLUMN IF NOT EXISTS number_format VARCHAR(32) NOT NULL DEFAULT '1,234.56',
        ADD COLUMN IF NOT EXISTS country VARCHAR(2) NOT NULL DEFAULT 'IE',
        ADD COLUMN IF NOT EXISTS default_tax_rate NUMERIC(7,4) NOT NULL DEFAULT 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE tenant_settings
        ALTER COLUMN currency SET DEFAULT 'USD',
        ALTER COLUMN locale SET DEFAULT 'en-US';

      ALTER TABLE tenant_settings
        DROP COLUMN IF EXISTS default_tax_rate,
        DROP COLUMN IF EXISTS country,
        DROP COLUMN IF EXISTS number_format,
        DROP COLUMN IF EXISTS date_format,
        DROP COLUMN IF EXISTS timezone,
        DROP COLUMN IF EXISTS currency_symbol;
    `);
  }
}

