import { IsBoolean, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

/** POST /inventory/update */
export class UpdateInventoryItemDto {
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockLevel?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  reorderPoint?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
