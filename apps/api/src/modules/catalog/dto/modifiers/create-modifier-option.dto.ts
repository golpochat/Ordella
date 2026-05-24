import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateModifierOptionDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsNumber()
  priceDelta?: number;
}
