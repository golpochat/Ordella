import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

const TAX_TYPES = ['vat', 'gst', 'sales_tax'] as const;
const APPLIES_TO = ['items', 'categories', 'delivery', 'service_fee'] as const;
const PRICE_MODES = ['inclusive', 'exclusive'] as const;

export class UpsertTaxRuleDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsString()
  country!: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsString()
  taxName!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate!: number;

  @IsIn(TAX_TYPES)
  taxType!: 'vat' | 'gst' | 'sales_tax';

  @IsArray()
  @IsIn(APPLIES_TO, { each: true })
  appliesTo!: Array<'items' | 'categories' | 'delivery' | 'service_fee'>;

  @IsIn(PRICE_MODES)
  priceMode!: 'inclusive' | 'exclusive';

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsIn(['half_up', 'down', 'up'])
  roundingMode?: 'half_up' | 'down' | 'up';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(4)
  decimalPlaces?: number;

  @IsOptional()
  @IsString()
  taxIdLabel?: string;

  @IsOptional()
  @IsString()
  taxIdValue?: string;
}

export class UpsertTaxCategoryDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  defaultTaxRuleId?: string;
}

export class TaxReportQueryDto {
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}
