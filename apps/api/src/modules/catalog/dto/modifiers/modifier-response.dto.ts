import { ModifierType } from '../../enums/modifier-type.enum';

export class ModifierOptionResponseDto {
  id!: string;
  name!: string;
  priceDelta!: string;
}

export class ModifierResponseDto {
  id!: string;
  tenantId!: string;
  name!: string;
  type!: ModifierType;
  required!: boolean;
  options!: ModifierOptionResponseDto[];
  createdAt!: Date;
  updatedAt!: Date | null;
}
