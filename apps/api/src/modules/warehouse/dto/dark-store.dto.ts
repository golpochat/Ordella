import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsInt, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator';
import { PickTaskLineConfirmationDto } from './warehouse.dto';

export class DarkStoreOrdersQueryDto {
  @IsOptional()
  @IsUUID()
  locationId?: string;
}

export class CreateDarkStorePickTaskDto {
  @IsUUID()
  orderId!: string;

  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priority?: number;

  @IsOptional()
  @IsUUID()
  pickerId?: string;
}

export class CompleteDarkStorePickTaskDto {
  @IsUUID()
  pickTaskId!: string;

  @IsOptional()
  @IsArray()
  missingItemIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PickTaskLineConfirmationDto)
  lines?: PickTaskLineConfirmationDto[];
}

export class CreatePickWaveDto {
  @IsUUID()
  locationId!: string;

  @IsOptional()
  @IsUUID()
  pickerId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  pickTaskIds?: string[];

  @IsOptional()
  @IsBoolean()
  autoGenerate?: boolean;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxTasks?: number;
}

export class FulfillmentSlotsQueryDto {
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
