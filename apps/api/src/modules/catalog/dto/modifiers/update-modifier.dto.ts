import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ModifierType } from '../../enums/modifier-type.enum';
import { CreateModifierOptionDto } from './create-modifier-option.dto';

export class UpdateModifierDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsEnum(ModifierType)
  type?: ModifierType;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateModifierOptionDto)
  options?: CreateModifierOptionDto[];
}
