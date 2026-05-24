import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { ReportDefinitionSlug } from '../../enums/report-definition-slug.enum';

export class CreateReportDefinitionDto {
  @IsEnum(ReportDefinitionSlug)
  slug!: ReportDefinitionSlug;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  parametersSchema?: Record<string, unknown>;
}
