import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SubscriptionPlan } from '../enums/subscription-plan.enum';
import { TenantEntity } from '../../tenants/entities/tenant.entity';

@Entity('tenant_billing')
export class TenantBillingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', unique: true })
  tenantId!: string;

  @OneToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: TenantEntity;

  @Column({ type: 'varchar', length: 32, default: SubscriptionPlan.FREE })
  plan!: SubscriptionPlan;

  @Column({ name: 'billing_email', type: 'varchar', length: 255, nullable: true })
  billingEmail!: string | null;

  @Column({ name: 'payment_method', type: 'jsonb', default: {} })
  paymentMethod!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
