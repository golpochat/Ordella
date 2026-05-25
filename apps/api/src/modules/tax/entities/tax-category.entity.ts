import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TaxRuleEntity } from './tax-rule.entity';

@Entity('tax_categories')
@Index(['tenantId', 'name'], { unique: true })
export class TaxCategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'default_tax_rule_id', type: 'uuid', nullable: true })
  defaultTaxRuleId!: string | null;

  @ManyToOne(() => TaxRuleEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'default_tax_rule_id' })
  defaultTaxRule!: TaxRuleEntity | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
