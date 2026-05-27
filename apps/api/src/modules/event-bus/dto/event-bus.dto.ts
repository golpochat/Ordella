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

export class PublishEventDto {
  @IsString()
  eventId!: string;

  @IsIn(['orders', 'inventory', 'customers', 'delivery', 'payments', 'iot'])
  topicKey!: 'orders' | 'inventory' | 'customers' | 'delivery' | 'payments' | 'iot';

  @IsString()
  eventType!: string;

  @IsIn(['pos', 'storefront', 'warehouse', 'delivery_app', 'iot_device', 'api', 'system'])
  producer!: 'pos' | 'storefront' | 'warehouse' | 'delivery_app' | 'iot_device' | 'api' | 'system';

  @IsObject()
  payload!: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  partitionKey?: string;

  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  schemaVersion?: number;

  @IsString()
  occurredAt!: string;
}

export class PublishEventsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublishEventDto)
  events!: PublishEventDto[];
}

export class SubscribeTopicDto {
  @IsIn(['orders', 'inventory', 'customers', 'delivery', 'payments', 'iot'])
  topicKey!: 'orders' | 'inventory' | 'customers' | 'delivery' | 'payments' | 'iot';

  @IsString()
  consumerGroup!: string;

  @IsIn(['analytics', 'ai_assistant', 'notifications', 'integrations', 'marketing', 'inventory', 'delivery'])
  consumerType!: 'analytics' | 'ai_assistant' | 'notifications' | 'integrations' | 'marketing' | 'inventory' | 'delivery';

  @IsOptional()
  @IsObject()
  filterRules?: Record<string, unknown>;

  @IsOptional()
  @IsIn(['at_least_once', 'exactly_once'])
  deliverySemantics?: 'at_least_once' | 'exactly_once';

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRetries?: number;
}

export class ReplayEventsDto {
  @IsIn(['orders', 'inventory', 'customers', 'delivery', 'payments', 'iot'])
  topicKey!: 'orders' | 'inventory' | 'customers' | 'delivery' | 'payments' | 'iot';

  @IsOptional()
  @IsString()
  fromSequence?: string;

  @IsOptional()
  @IsString()
  toSequence?: string;

  @IsOptional()
  @IsString()
  consumerGroup?: string;
}

export class UpdateTopicPermissionsDto {
  @IsArray()
  @IsString({ each: true })
  permissions!: string[];
}
