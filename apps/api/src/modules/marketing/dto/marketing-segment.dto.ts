import { IsObject, IsString, MaxLength } from 'class-validator';

export class CreateMarketingSegmentDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsObject()
  filters!: Record<string, unknown>;
}

export class UpdateMarketingSegmentDto extends CreateMarketingSegmentDto {}
