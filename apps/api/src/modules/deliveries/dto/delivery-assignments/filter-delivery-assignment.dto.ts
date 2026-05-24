import { IsOptional, IsUUID } from 'class-validator';
import { FilterPaginationDto } from '../../../auth/dto';

export class FilterDeliveryAssignmentDto extends FilterPaginationDto {
  @IsOptional()
  @IsUUID()
  deliveryTaskId?: string;

  @IsOptional()
  @IsUUID()
  driverProfileId?: string;
}
