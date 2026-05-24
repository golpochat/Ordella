import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../auth/dto/pagination-query.dto';
import { IntegrationLogLevel } from '../../enums/integration-log-level.enum';

export class IntegrationLogQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  integrationId?: string;

  @IsOptional()
  @IsEnum(IntegrationLogLevel)
  level?: IntegrationLogLevel;
}
