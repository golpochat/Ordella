export class CategoryResponseDto {
  id!: string;
  tenantId!: string;
  name!: string;
  sortOrder!: number;
  createdAt!: Date;
  updatedAt!: Date | null;
}
