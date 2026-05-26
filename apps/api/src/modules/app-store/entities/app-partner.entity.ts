import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('app_partners')
@Index(['tenantId', 'email'], { unique: true })
export class AppPartnerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'company_name', type: 'varchar', length: 160 })
  companyName!: string;

  @Column({ name: 'contact_name', type: 'varchar', length: 160 })
  contactName!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status!: 'pending' | 'approved' | 'rejected' | 'sandbox';

  @Column({ name: 'sandbox_enabled', type: 'boolean', default: true })
  sandboxEnabled!: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
