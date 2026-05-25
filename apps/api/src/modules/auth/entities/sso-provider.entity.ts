import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SsoProviderType } from '../enums/sso-provider-type.enum';
import { SsoRoleMappingEntity } from './sso-role-mapping.entity';

@Entity('sso_providers')
@Index(['tenantId', 'providerType'])
export class SsoProviderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'provider_type', type: 'varchar', length: 32 })
  providerType!: SsoProviderType;

  @Column({ name: 'client_id', type: 'varchar', length: 255, nullable: true })
  clientId!: string | null;

  @Column({ name: 'client_secret_encrypted', type: 'text', nullable: true })
  clientSecretEncrypted!: string | null;

  @Column({ name: 'issuer_url', type: 'text', nullable: true })
  issuerUrl!: string | null;

  @Column({ name: 'redirect_url', type: 'text', nullable: true })
  redirectUrl!: string | null;

  @Column({ name: 'metadata_url', type: 'text', nullable: true })
  metadataUrl!: string | null;

  @Column({ name: 'authorization_url', type: 'text', nullable: true })
  authorizationUrl!: string | null;

  @Column({ name: 'token_url', type: 'text', nullable: true })
  tokenUrl!: string | null;

  @Column({ name: 'jwks_uri', type: 'text', nullable: true })
  jwksUri!: string | null;

  @Column({ name: 'default_role', type: 'varchar', length: 128, nullable: true })
  defaultRole!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => SsoRoleMappingEntity, (mapping) => mapping.provider)
  roleMappings!: SsoRoleMappingEntity[];
}
