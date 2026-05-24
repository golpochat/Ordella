import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OnboardingStep } from '../enums/onboarding-step.enum';
import { TenantEntity } from '../../tenants/entities/tenant.entity';

@Entity('tenant_onboarding')
export class TenantOnboardingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', unique: true })
  tenantId!: string;

  @OneToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: TenantEntity;

  @Column({ name: 'current_step', type: 'varchar', length: 32, default: OnboardingStep.STARTED })
  currentStep!: OnboardingStep;

  @Column({ name: 'completed_steps', type: 'jsonb', default: [] })
  completedSteps!: OnboardingStep[];

  @Column({ name: 'is_complete', type: 'boolean', default: false })
  isComplete!: boolean;

  @Column({ name: 'started_at', type: 'timestamptz', default: () => 'NOW()' })
  startedAt!: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
