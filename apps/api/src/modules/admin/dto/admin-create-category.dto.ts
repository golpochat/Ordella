import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class AdminCreateCategoryDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsUUID()
  taxCategoryId?: string;
}
