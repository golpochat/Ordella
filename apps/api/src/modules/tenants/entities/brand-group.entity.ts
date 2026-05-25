import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('brand_groups')
export class BrandGroupEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'hq_tenant_id', type: 'uuid' })
  hqTenantId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'brand_tenant_ids', type: 'uuid', array: true, default: () => "'{}'" })
  brandTenantIds!: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
