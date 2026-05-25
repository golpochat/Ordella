import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateGiftCardDto {
  @IsNumber()
  @Min(0.01)
  initialValue!: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  code?: string;
}

export class GiftCardLookupDto {
  @IsString()
  @MaxLength(64)
  code!: string;
}

export class GiftCardRedeemDto {
  @IsString()
  @MaxLength(64)
  code!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsUUID()
  orderId?: string;
}

export class GiftCardAdjustDto {
  @IsUUID()
  giftCardId!: string;

  @IsNumber()
  amount!: number;
}

export class GiftCardDisableDto {
  @IsUUID()
  giftCardId!: string;

  @IsBoolean()
  isActive!: boolean;
}
