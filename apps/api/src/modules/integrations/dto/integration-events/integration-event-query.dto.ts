import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../auth/dto/pagination-query.dto';

export class IntegrationEventQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  integrationId?: string;
}
