import { IsOptional, IsUUID } from 'class-validator';
import { FilterPaginationDto } from '../../../../common/dto';

export class FilterIntegrationEventDto extends FilterPaginationDto {
  @IsOptional()
  @IsUUID()
  integrationId?: string;
}
