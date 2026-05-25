import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { CustomerEntity } from '../../loyalty/entities/customer.entity';
import { BaseTimestampsEntity } from '../../loyalty/entities/base-timestamps.entity';

@Entity('customer_addresses')
@Index(['customerId', 'isDefault'])
export class CustomerAddressEntity extends BaseTimestampsEntity {
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: CustomerEntity;

  @Column({ type: 'varchar', length: 64, default: 'Home' })
  label!: string;

  @Column({ name: 'line_1', type: 'varchar', length: 255 })
  line1!: string;

  @Column({ name: 'line_2', type: 'varchar', length: 255, nullable: true })
  line2!: string | null;

  @Column({ type: 'varchar', length: 120 })
  city!: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  postcode!: string | null;

  @Column({ type: 'varchar', length: 120, default: 'GB' })
  country!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  instructions!: string | null;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault!: boolean;
}
