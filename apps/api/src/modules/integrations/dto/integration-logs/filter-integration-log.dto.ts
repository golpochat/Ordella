import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { FilterPaginationDto } from '../../../../common/dto';
import { IntegrationLogLevel } from '../../enums/integration-log-level.enum';

export class FilterIntegrationLogDto extends FilterPaginationDto {
  @IsOptional()
  @IsUUID()
  integrationId?: string;

  @IsOptional()
  @IsEnum(IntegrationLogLevel)
  level?: IntegrationLogLevel;
}
