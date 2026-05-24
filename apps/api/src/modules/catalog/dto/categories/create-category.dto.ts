import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

/** API Spec §3.5 POST /api/v1/categories */
export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
