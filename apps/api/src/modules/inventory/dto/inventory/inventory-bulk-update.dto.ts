import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { UpdateInventoryItemDto } from './update-inventory-item.dto';

/** POST /inventory/bulk-update */
export class InventoryBulkUpdateDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateInventoryItemDto)
  items!: UpdateInventoryItemDto[];
}
