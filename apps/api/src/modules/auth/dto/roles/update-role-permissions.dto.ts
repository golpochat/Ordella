import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

/** API Spec §1.7 POST /api/v1/roles/{id}/assign */
export class UpdateRolePermissionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  permissionIds!: string[];
}
