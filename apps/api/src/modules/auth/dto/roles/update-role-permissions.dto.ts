import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

/** API Spec §1.7 POST /api/v1/roles/{id}/assign */
export class UpdateRolePermissionsDto {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionKeys?: string[];
}
