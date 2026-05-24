import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../auth/dto/pagination-query.dto';

export class DeliveryAssignmentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  deliveryTaskId?: string;

  @IsOptional()
  @IsUUID()
  driverProfileId?: string;
}
