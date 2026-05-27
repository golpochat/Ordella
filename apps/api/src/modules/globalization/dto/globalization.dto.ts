import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class UpdateGlobalizationSettingsDto {
  @IsOptional()
  @IsString()
  baseCurrency?: string;

  @IsOptional()
  @IsString()
  defaultLocale?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportedCountries?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportedCurrencies?: string[];

  @IsOptional()
  @IsBoolean()
  dualPricingEnabled?: boolean;

  @IsOptional()
  @IsIn(['half_up', 'bankers', 'cash'])
  roundingMode?: 'half_up' | 'bankers' | 'cash';

  @IsOptional()
  @IsString()
  reportingCurrency?: string;
}

export class ConvertCurrencyDto {
  @IsNumber()
  amount!: number;

  @IsString()
  fromCurrency!: string;

  @IsString()
  toCurrency!: string;

  @IsOptional()
  @IsIn(['order', 'refund', 'payout', 'subscription', 'promotion'])
  context?: 'order' | 'refund' | 'payout' | 'subscription' | 'promotion';
}

export class UpsertCountryPriceDto {
  @IsString()
  countryCode!: string;

  @IsString()
  currency!: string;

  @IsUUID()
  productId!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsNumber()
  compareAtPrice?: number;

  @IsOptional()
  @IsBoolean()
  taxInclusive?: boolean;
}

export class UpsertTaxExemptionDto {
  @IsString()
  countryCode!: string;

  @IsIn(['b2b', 'wholesale', 'export', 'nonprofit'])
  exemptionType!: 'b2b' | 'wholesale' | 'export' | 'nonprofit';

  @IsOptional()
  @IsString()
  regionCode?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;
}

export class UpsertLocalizedContentDto {
  @IsIn(['product', 'category', 'ui_label'])
  entityType!: 'product' | 'category' | 'ui_label';

  @IsString()
  entityId!: string;

  @IsString()
  locale!: string;

  @IsString()
  field!: string;

  @IsString()
  value!: string;

  @IsOptional()
  @IsIn(['ltr', 'rtl'])
  textDirection?: 'ltr' | 'rtl';
}

export class TaxPreviewDto {
  @IsString()
  countryCode!: string;

  @IsOptional()
  @IsString()
  regionCode?: string;

  @IsUUID()
  locationId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxPreviewLineDto)
  lines!: TaxPreviewLineDto[];

  @IsOptional()
  @IsNumber()
  discountTotal?: number;

  @IsOptional()
  @IsNumber()
  deliveryFee?: number;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsIn(['b2b', 'wholesale', 'export', 'nonprofit'])
  exemptionType?: 'b2b' | 'wholesale' | 'export' | 'nonprofit';
}

export class TaxPreviewLineDto {
  @IsUUID()
  productId!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  taxCategoryId?: string;
}

export class ReportingQueryDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  reportingCurrency?: string;
}
