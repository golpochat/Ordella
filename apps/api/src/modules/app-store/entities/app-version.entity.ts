import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MarketplaceAppEntity } from './marketplace-app.entity';

@Entity('app_versions')
@Index(['appId', 'version'], { unique: true })
export class AppVersionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'app_id', type: 'uuid' })
  appId!: string;

  @ManyToOne(() => MarketplaceAppEntity, (app) => app.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  app!: MarketplaceAppEntity;

  @Column({ type: 'varchar', length: 48 })
  version!: string;

  @Column({ type: 'text', nullable: true })
  changelog!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  manifest!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 32, default: 'approved' })
  status!: 'draft' | 'submitted' | 'approved' | 'rejected';

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
