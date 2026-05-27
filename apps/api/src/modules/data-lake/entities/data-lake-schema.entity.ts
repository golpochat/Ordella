import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('data_lake_schemas')
@Index(['tenantId', 'entityType', 'version'], { unique: true })
export class DataLakeSchemaEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 64 })
  entityType!: string;

  @Column({ type: 'int', default: 1 })
  version!: number;

  @Column({ name: 'schema_json', type: 'jsonb', default: () => "'{}'" })
  schemaJson!: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
