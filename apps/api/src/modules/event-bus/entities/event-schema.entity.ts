import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('event_schemas')
@Index(['tenantId', 'topicKey', 'version'], { unique: true })
export class EventSchemaEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'topic_key', type: 'varchar', length: 64 })
  topicKey!: string;

  @Column({ type: 'int', default: 1 })
  version!: number;

  @Column({ name: 'event_type', type: 'varchar', length: 128 })
  eventType!: string;

  @Column({ name: 'schema_json', type: 'jsonb', default: () => "'{}'" })
  schemaJson!: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
