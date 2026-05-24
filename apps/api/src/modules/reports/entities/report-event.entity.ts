import { Column, Entity, Index } from 'typeorm';
import { ReportEventType } from '../enums/report-event-type.enum';
import { BaseTimestampsEntity } from './base-timestamps.entity';

@Entity('report_events')
@Index(['tenantId', 'eventType', 'createdAt'])
export class ReportEventEntity extends BaseTimestampsEntity {
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'event_type', type: 'varchar', length: 64 })
  eventType!: ReportEventType;

  @Column({ type: 'jsonb', default: {} })
  payload!: Record<string, unknown>;
}
