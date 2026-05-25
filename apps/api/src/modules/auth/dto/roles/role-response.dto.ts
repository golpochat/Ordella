export class RoleResponseDto {
  id!: string;
  tenantId!: string;
  name!: string;
  description!: string | null;
  permissions!: string[];
  isSystemRole!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
