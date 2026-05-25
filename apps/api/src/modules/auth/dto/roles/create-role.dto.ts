import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

/** API Spec §1.7 POST /api/v1/roles */
export class CreateRoleDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
