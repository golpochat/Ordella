import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { FilterPaginationDto } from '../../../auth/dto/filter-pagination.dto';
import { IntegrationLogLevel } from '../../enums/integration-log-level.enum';

export class FilterIntegrationLogDto extends FilterPaginationDto {
  @IsOptional()
  @IsUUID()
  integrationId?: string;

  @IsOptional()
  @IsEnum(IntegrationLogLevel)
  level?: IntegrationLogLevel;
}
