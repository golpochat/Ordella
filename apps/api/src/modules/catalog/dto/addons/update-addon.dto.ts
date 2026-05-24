import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAddonDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsNumber()
  price?: number;
}
