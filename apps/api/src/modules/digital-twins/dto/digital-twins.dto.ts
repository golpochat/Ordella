import {
  IsArray,
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTwinDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['store', 'warehouse', 'region', 'customer_segment', 'product_category'])
  twinType!: 'store' | 'warehouse' | 'region' | 'customer_segment' | 'product_category';

  @IsOptional()
  @IsUUID()
  entityRefId?: string;

  @IsOptional()
  @IsObject()
  baselineData?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  simulationParameters?: Record<string, unknown>;
}

export class SaveScenarioDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  parameters!: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  forecastOverrides?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  extremeConditions?: Record<string, unknown>;
}

export class RunSimulationDto {
  @IsOptional()
  @IsUUID()
  scenarioId?: string;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, unknown>;

  @IsOptional()
  @IsIn(['demand', 'inventory', 'staffing', 'delivery', 'pricing', 'promotion', 'customer_behavior', 'full'])
  simulationDomain?: 'demand' | 'inventory' | 'staffing' | 'delivery' | 'pricing' | 'promotion' | 'customer_behavior' | 'full';

  @IsOptional()
  @IsString()
  reproducibilitySeed?: string;

  @IsOptional()
  @IsBoolean()
  useCache?: boolean;
}

export class CompareScenariosDto {
  @IsArray()
  @IsUUID('4', { each: true })
  scenarioIds!: string[];

  @IsOptional()
  @IsIn(['demand', 'inventory', 'staffing', 'delivery', 'pricing', 'promotion', 'customer_behavior', 'full'])
  simulationDomain?: 'demand' | 'inventory' | 'staffing' | 'delivery' | 'pricing' | 'promotion' | 'customer_behavior' | 'full';
}

export class ForecastSandboxDto {
  @IsUUID()
  twinId!: string;

  @IsOptional()
  @IsString()
  modelVariant?: string;

  @IsOptional()
  @IsObject()
  assumptionOverrides?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  extremeConditions?: Record<string, unknown>;
}

export class ParallelSimulationsDto {
  @IsArray()
  scenarios!: Array<{ scenarioId?: string; parameters?: Record<string, unknown> }>;

  @IsOptional()
  @IsIn(['demand', 'inventory', 'staffing', 'delivery', 'pricing', 'promotion', 'customer_behavior', 'full'])
  simulationDomain?: 'demand' | 'inventory' | 'staffing' | 'delivery' | 'pricing' | 'promotion' | 'customer_behavior' | 'full';
}
