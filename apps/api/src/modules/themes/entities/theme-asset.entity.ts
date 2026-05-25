import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ThemeEntity } from './theme.entity';

export type ThemeAssetType = 'logo' | 'banner' | 'background' | 'favicon';

@Entity('theme_assets')
@Index(['themeId', 'type'])
export class ThemeAssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'theme_id', type: 'uuid' })
  themeId!: string;

  @ManyToOne(() => ThemeEntity, (theme) => theme.themeAssets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'theme_id' })
  theme!: ThemeEntity;

  @Column({ type: 'varchar', length: 32 })
  type!: ThemeAssetType;

  @Column({ type: 'text' })
  url!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
