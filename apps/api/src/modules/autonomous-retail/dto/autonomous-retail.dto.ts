import {
  IsArray,
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdatePolicyDto {
  @IsOptional()
  @IsIn(['fully_autonomous', 'semi_autonomous', 'suggestion_only'])
  mode?: 'fully_autonomous' | 'semi_autonomous' | 'suggestion_only';

  @IsOptional()
  @IsUUID()
  locationId?: string | null;

  @IsOptional()
  @IsBoolean()
  pricingEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  replenishmentEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  staffingEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  promotionEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  deliveryEnabled?: boolean;

  @IsOptional()
  @IsObject()
  overrides?: Record<string, unknown>;
}

export class UpdateConstraintDto {
  @IsObject()
  rules!: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class GenerateDecisionsDto {
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsArray()
  @IsIn(['pricing', 'replenishment', 'staffing', 'promotion', 'delivery'], { each: true })
  modelTypes?: Array<'pricing' | 'replenishment' | 'staffing' | 'promotion' | 'delivery'>;

  @IsOptional()
  @IsBoolean()
  batch?: boolean;
}

export class ResolveDecisionDto {
  @IsIn(['approved', 'rejected'])
  decision!: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  comment?: string;
}

export class OverrideActionDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
