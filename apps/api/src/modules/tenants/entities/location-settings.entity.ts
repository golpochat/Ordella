import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LocationEntity } from './location.entity';

/** API Spec §2.3 — location settings */
@Entity('location_settings')
export class LocationSettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'location_id', type: 'uuid', unique: true })
  locationId!: string;

  @OneToOne(() => LocationEntity, (location) => location.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'location_id' })
  location!: LocationEntity;

  @Column({ type: 'jsonb', default: {} })
  settings!: Record<string, unknown>;
}
