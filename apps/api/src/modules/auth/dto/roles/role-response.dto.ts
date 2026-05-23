export class RoleResponseDto {
  id!: string;
  tenantId!: string;
  name!: string;
  description!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
