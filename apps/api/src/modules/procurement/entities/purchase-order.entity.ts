import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { LocationEntity } from '../../tenants/entities';
import { SupplierEntity } from './supplier.entity';
import { PurchaseOrderItemEntity } from './purchase-order-item.entity';
import { PurchaseOrderStatus } from './purchase-order-status.enum';
import { SupplierPurchaseOrderStatus } from './supplier-purchase-order-status.enum';

@Entity('purchase_orders')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'locationId', 'createdAt'])
export class PurchaseOrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId!: string;

  @ManyToOne(() => SupplierEntity, (supplier) => supplier.purchaseOrders, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supplier_id' })
  supplier!: SupplierEntity;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @ManyToOne(() => LocationEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'location_id' })
  location!: LocationEntity;

  @Column({ type: 'varchar', length: 32, default: PurchaseOrderStatus.DRAFT })
  status!: PurchaseOrderStatus;

  @Column({ name: 'supplier_status', type: 'varchar', length: 32, default: SupplierPurchaseOrderStatus.PENDING })
  supplierStatus!: SupplierPurchaseOrderStatus;

  @Column({ name: 'subtotal_cost', type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotalCost!: string;

  @Column({ name: 'tax_total', type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxTotal!: string;

  @Column({ name: 'total_cost', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCost!: string;

  @Column({ name: 'expected_delivery_date', type: 'date', nullable: true })
  expectedDeliveryDate!: string | null;

  @Column({ name: 'supplier_expected_delivery_date', type: 'date', nullable: true })
  supplierExpectedDeliveryDate!: string | null;

  @Column({ name: 'supplier_notes', type: 'text', nullable: true })
  supplierNotes!: string | null;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt!: Date | null;

  @Column({ name: 'received_at', type: 'timestamptz', nullable: true })
  receivedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;

  @OneToMany(() => PurchaseOrderItemEntity, (item) => item.purchaseOrder)
  items!: PurchaseOrderItemEntity[];
}
