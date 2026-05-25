import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('franchise_groups')
export class FranchiseGroupEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'hq_tenant_id', type: 'uuid' })
  hqTenantId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'franchisee_tenant_ids', type: 'uuid', array: true, default: () => "'{}'" })
  franchiseeTenantIds!: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
