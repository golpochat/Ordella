import { Column, Entity, Index } from 'typeorm';
import { IntegrationProviderCategory } from '../enums/integration-provider-category.enum';
import { BaseTimestampsEntity } from './base-timestamps.entity';

/** Platform catalog of connectable integration providers */
@Entity('integration_providers')
@Index(['slug'], { unique: true })
export class IntegrationProviderEntity extends BaseTimestampsEntity {
  @Column({ type: 'varchar', length: 64, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ type: 'varchar', length: 32 })
  category!: IntegrationProviderCategory;

  @Column({ name: 'auth_type', type: 'varchar', length: 32, default: 'api_key' })
  authType!: 'api_key' | 'oauth2' | 'saml' | 'none';

  @Column({ type: 'jsonb', default: () => "'[]'" })
  capabilities!: string[];

  @Column({ name: 'docs_url', type: 'varchar', length: 255, nullable: true })
  docsUrl!: string | null;

  @Column({ name: 'config_schema', type: 'jsonb', default: {} })
  configSchema!: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
