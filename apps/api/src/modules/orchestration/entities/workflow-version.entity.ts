import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('workflow_versions')
@Index(['tenantId', 'workflowId', 'version'], { unique: true })
export class WorkflowVersionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'workflow_id', type: 'uuid' })
  workflowId!: string;

  @Column({ type: 'int' })
  version!: number;

  @Column({ name: 'canvas_definition', type: 'jsonb', default: () => "'{\"nodes\":[],\"edges\":[]}'" })
  canvasDefinition!: { nodes: Array<Record<string, unknown>>; edges: Array<Record<string, unknown>> };

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
