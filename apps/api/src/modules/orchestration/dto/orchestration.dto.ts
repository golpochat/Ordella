import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import type { WorkflowStepType } from '../entities';

export class CreateWorkflowDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  sandboxMode?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedRoles?: string[];
}

export class UpdateWorkflowDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['draft', 'active', 'paused', 'archived'])
  status?: 'draft' | 'active' | 'paused' | 'archived';

  @IsOptional()
  @IsBoolean()
  sandboxMode?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedRoles?: string[];
}

export class UpsertWorkflowStepDto {
  @IsString()
  stepKey!: string;

  @IsIn([
    'data_fetch',
    'condition',
    'delay',
    'approval',
    'notification',
    'entity_mutation',
    'integration',
    'ai_action',
    'custom_code',
  ])
  stepType!: WorkflowStepType;

  @IsString()
  label!: string;

  @IsInt()
  @Min(0)
  stepOrder!: number;

  @IsObject()
  config!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  branchGroup?: string;

  @IsOptional()
  @IsString()
  parallelGroup?: string;

  @IsOptional()
  @IsString()
  onErrorPath?: string;

  @IsOptional()
  @IsString()
  nextOnSuccess?: string;

  @IsOptional()
  @IsString()
  nextOnFailure?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxRetries?: number;
}

export class SaveWorkflowCanvasDto {
  @IsArray()
  nodes!: Array<Record<string, unknown>>;

  @IsArray()
  edges!: Array<Record<string, unknown>>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertWorkflowStepDto)
  steps?: UpsertWorkflowStepDto[];
}

export class UpsertWorkflowTriggerDto {
  @IsIn(['schedule', 'event', 'manual', 'api'])
  triggerType!: 'schedule' | 'event' | 'manual' | 'api';

  @IsObject()
  config!: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class StartWorkflowRunDto {
  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @IsOptional()
  @IsBoolean()
  sandbox?: boolean;
}

export class TriggerEventDto {
  @IsString()
  topicKey!: string;

  @IsObject()
  payload!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  eventId?: string;
}

export class ResolveApprovalDto {
  @IsIn(['approved', 'rejected'])
  decision!: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  comment?: string;
}

export class RetryStepRunDto {
  @IsOptional()
  @IsBoolean()
  resetAttempts?: boolean;
}
