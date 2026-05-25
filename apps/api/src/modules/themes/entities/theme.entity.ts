import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ThemeAssetEntity } from './theme-asset.entity';

export type BaseTheme = 'default' | 'modern' | 'minimal' | 'bold';

@Entity('themes')
@Index(['tenantId', 'isActive'])
export class ThemeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ name: 'base_theme', type: 'varchar', length: 32, default: 'default' })
  baseTheme!: BaseTheme;

  @Column({ type: 'jsonb', default: {} })
  colors!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: {} })
  typography!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: {} })
  layout!: Record<string, unknown>;

  @Column({ name: 'homepage_sections', type: 'jsonb', default: [] })
  homepageSections!: Array<Record<string, unknown>>;

  @Column({ type: 'jsonb', default: {} })
  assets!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: {} })
  seo!: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;

  @OneToMany(() => ThemeAssetEntity, (asset) => asset.theme)
  themeAssets!: ThemeAssetEntity[];
}
