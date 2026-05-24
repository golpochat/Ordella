import { ReportDefinitionSlug } from '../../enums/report-definition-slug.enum';

export class ReportDefinitionResponseDto {
  id!: string;
  slug!: ReportDefinitionSlug;
  name!: string;
  description!: string | null;
  parametersSchema!: Record<string, unknown>;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date | null;
}
