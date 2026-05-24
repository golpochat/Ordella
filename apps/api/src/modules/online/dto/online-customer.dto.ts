import { IsEmail, IsString, MaxLength } from 'class-validator';

export class OnlineCustomerDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(32)
  phone!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;
}
