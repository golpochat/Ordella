import { IsOptional, IsString, IsUUID } from 'class-validator';
import { FilterPaginationDto } from '../../../../common/dto';

export class InventoryListQueryDto extends FilterPaginationDto {
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
