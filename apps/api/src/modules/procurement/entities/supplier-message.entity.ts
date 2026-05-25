import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PurchaseOrderEntity } from './purchase-order.entity';
import { SupplierEntity } from './supplier.entity';

export type SupplierMessageSenderType = 'supplier' | 'merchant';

@Entity('supplier_messages')
@Index(['tenantId', 'supplierId', 'createdAt'])
@Index(['tenantId', 'purchaseOrderId', 'createdAt'])
export class SupplierMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId!: string;

  @ManyToOne(() => SupplierEntity, (supplier) => supplier.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplier_id' })
  supplier!: SupplierEntity;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'purchase_order_id', type: 'uuid', nullable: true })
  purchaseOrderId!: string | null;

  @ManyToOne(() => PurchaseOrderEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder!: PurchaseOrderEntity | null;

  @Column({ name: 'sender_type', type: 'varchar', length: 32 })
  senderType!: SupplierMessageSenderType;

  @Column({ type: 'text' })
  message!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
