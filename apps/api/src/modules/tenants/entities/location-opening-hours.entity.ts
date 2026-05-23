import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LocationEntity } from './location.entity';

/** API Spec §2.4 — opening hours per day */
@Entity('location_opening_hours')
@Index(['locationId', 'dayOfWeek'], { unique: true })
export class LocationOpeningHoursEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @ManyToOne(() => LocationEntity, (location) => location.openingHours, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'location_id' })
  location!: LocationEntity;

  /** 0 = Sunday … 6 = Saturday */
  @Column({ name: 'day_of_week', type: 'smallint' })
  dayOfWeek!: number;

  @Column({ name: 'open_time', type: 'time', nullable: true })
  openTime!: string | null;

  @Column({ name: 'close_time', type: 'time', nullable: true })
  closeTime!: string | null;

  @Column({ name: 'is_closed', type: 'boolean', default: false })
  isClosed!: boolean;
}
