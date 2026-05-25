import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SsoProviderEntity } from './sso-provider.entity';

@Entity('sso_role_mappings')
@Index(['tenantId', 'externalRole'])
@Index(['tenantId', 'providerId', 'externalRole'], { unique: true })
export class SsoRoleMappingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'provider_id', type: 'uuid', nullable: true })
  providerId!: string | null;

  @ManyToOne(() => SsoProviderEntity, (provider) => provider.roleMappings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider!: SsoProviderEntity | null;

  @Column({ name: 'external_role', type: 'varchar', length: 255 })
  externalRole!: string;

  @Column({ name: 'internal_role', type: 'varchar', length: 128 })
  internalRole!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
