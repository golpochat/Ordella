import { IsArray, IsIn, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMarketingSegmentDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsObject()
  filters!: Record<string, unknown>;

  @IsOptional()
  @IsIn(['rfm', 'ltv', 'churn', 'behavior', 'custom'])
  builderType?: 'rfm' | 'ltv' | 'churn' | 'behavior' | 'custom';

  @IsOptional()
  @IsArray()
  ruleSummary?: Array<Record<string, unknown>>;
}

export class UpdateMarketingSegmentDto extends CreateMarketingSegmentDto {}
