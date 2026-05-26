import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from '../entities';

export class SupportAttachmentDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  contentType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  url?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  size?: number;
}

export class CreateSupportTicketDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsUUID()
  subscriptionId?: string;

  @IsString()
  @MaxLength(180)
  subject!: string;

  @IsEnum(SupportTicketCategory)
  category!: SupportTicketCategory;

  @IsOptional()
  @IsEnum(SupportTicketPriority)
  priority?: SupportTicketPriority;

  @IsString()
  @MaxLength(10000)
  message!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupportAttachmentDto)
  attachments?: SupportAttachmentDto[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class CreateSupportChatTicketDto extends CreateSupportTicketDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;
}

export class UpdateSupportTicketDto {
  @IsOptional()
  @IsEnum(SupportTicketStatus)
  status?: SupportTicketStatus;

  @IsOptional()
  @IsEnum(SupportTicketPriority)
  priority?: SupportTicketPriority;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsUUID()
  subscriptionId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class AddSupportMessageDto {
  @IsString()
  @MaxLength(10000)
  body!: string;

  @IsOptional()
  internalOnly?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupportAttachmentDto)
  attachments?: SupportAttachmentDto[];
}

export class AssignSupportTicketDto {
  @IsUUID()
  assignedTo!: string;
}

export class RateSupportTicketDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
