import { IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ReportDefinitionSlug } from '../../enums/report-definition-slug.enum';

export class CreateReportDto {
  @IsEnum(ReportDefinitionSlug)
  definitionSlug!: ReportDefinitionSlug;

  @IsOptional()
  @IsString()
  name?: string;

  @IsObject()
  parameters!: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  locationId?: string;
}
