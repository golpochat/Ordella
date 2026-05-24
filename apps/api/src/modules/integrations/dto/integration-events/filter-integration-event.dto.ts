import { IsOptional, IsUUID } from 'class-validator';
import { FilterPaginationDto } from '../../../auth/dto';

export class FilterIntegrationEventDto extends FilterPaginationDto {
  @IsOptional()
  @IsUUID()
  integrationId?: string;
}
