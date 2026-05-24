import { IsOptional, IsString } from 'class-validator';

export class AdminCreateModifierOptionDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  priceDelta?: string;
}
