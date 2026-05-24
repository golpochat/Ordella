import { IsBoolean, IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class AdminUpdateFulfillmentSettingsDto {
  @IsUUID()
  locationId!: string;

  @IsOptional()
  @IsBoolean()
  autoAcceptOrders?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  autoCompleteMinutes?: number | null;

  @IsOptional()
  @IsBoolean()
  soundAlerts?: boolean;

  @IsOptional()
  @IsEnum(['grid', 'list'])
  displayMode?: 'grid' | 'list';

  @IsOptional()
  @IsBoolean()
  showCustomerInfo?: boolean;
}
