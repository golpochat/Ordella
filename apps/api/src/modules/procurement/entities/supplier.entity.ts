import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SupplierItemEntity } from './supplier-item.entity';
import { PurchaseOrderEntity } from './purchase-order.entity';
import { SupplierMessageEntity } from './supplier-message.entity';

@Entity('suppliers')
@Index(['tenantId', 'name'])
@Index(['tenantId', 'portalUserEmail'], {
  unique: true,
  where: 'portal_user_email IS NOT NULL',
})
export class SupplierEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'contact_name', type: 'varchar', length: 255, nullable: true })
  contactName!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  phone!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'portal_user_email', type: 'varchar', length: 255, nullable: true })
  portalUserEmail!: string | null;

  @Column({ name: 'portal_password_hash', type: 'text', nullable: true, select: false })
  portalPasswordHash!: string | null;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => SupplierItemEntity, (item) => item.supplier)
  items!: SupplierItemEntity[];

  @OneToMany(() => PurchaseOrderEntity, (order) => order.supplier)
  purchaseOrders!: PurchaseOrderEntity[];

  @OneToMany(() => SupplierMessageEntity, (message) => message.supplier)
  messages!: SupplierMessageEntity[];
}
