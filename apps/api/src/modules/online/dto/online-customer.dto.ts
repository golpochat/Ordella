import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class OnlineCustomerDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(32)
  phone!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;
}
