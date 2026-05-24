import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ModifierType } from '../../catalog/enums/modifier-type.enum';

export class AdminCreateModifierDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsEnum(ModifierType)
  type?: ModifierType;

  @IsOptional()
  @IsBoolean()
  required?: boolean;
}
