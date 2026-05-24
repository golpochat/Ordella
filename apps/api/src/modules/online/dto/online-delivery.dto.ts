import { IsOptional, IsString, MaxLength } from 'class-validator';

export class OnlineDeliveryDto {
  @IsString()
  @MaxLength(255)
  addressLine1!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine2?: string;

  @IsString()
  @MaxLength(128)
  city!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  postalCode?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  contactPhone?: string;
}
