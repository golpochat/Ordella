import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('localized_content')
@Index(['tenantId', 'entityType', 'entityId', 'locale', 'field'], { unique: true })
export class LocalizedContentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 32 })
  entityType!: 'product' | 'category' | 'ui_label';

  @Column({ name: 'entity_id', type: 'varchar', length: 160 })
  entityId!: string;

  @Column({ type: 'varchar', length: 16 })
  locale!: string;

  @Column({ type: 'varchar', length: 64 })
  field!: string;

  @Column({ type: 'text' })
  value!: string;

  @Column({ name: 'text_direction', type: 'varchar', length: 8, default: 'ltr' })
  textDirection!: 'ltr' | 'rtl';

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
