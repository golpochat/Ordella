import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

/** API Spec §3.4 POST /api/v1/addons */
export class CreateAddonDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsNumber()
  price!: number;
}
