import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ModifierType } from '../../enums/modifier-type.enum';

export class ModifierOptionInputDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsNumber()
  priceDelta?: number;
}

/** API Spec §3.3 POST /api/v1/modifiers */
export class CreateModifierDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEnum(ModifierType)
  type!: ModifierType;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModifierOptionInputDto)
  options?: ModifierOptionInputDto[];
}
