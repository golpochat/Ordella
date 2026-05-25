import { IsArray, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CrmCustomerQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  segment?: string;

  @IsOptional()
  @IsString()
  tag?: string;
}

export class TagCustomerDto {
  @IsUUID()
  customerId!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addTags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  removeTags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}

export class UpdateCustomerInsightsDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;
}
