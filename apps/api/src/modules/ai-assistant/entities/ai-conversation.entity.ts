import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ai_assistant_conversations')
@Index(['tenantId', 'createdAt'])
export class AiConversationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'created_by_user_id', type: 'uuid', nullable: true })
  createdByUserId!: string | null;

  @Column({ type: 'varchar', length: 160 })
  title!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  context!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
