import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class GraphQueryDto {
  @IsString()
  query!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxHops?: number;
}

export class VectorSearchDto {
  @IsString()
  queryText!: string;

  @IsOptional()
  @IsIn(['product', 'customer', 'order', 'location', 'staff', 'supplier', 'category'])
  entityType?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class SemanticSearchDto {
  @IsString()
  query!: string;

  @IsOptional()
  @IsIn(['product', 'analytics', 'customer_segment', 'inventory'])
  searchMode?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class RunReasoningDto {
  @IsIn([
    'product_similarity',
    'customer_behavior',
    'inventory_risk',
    'promotion_impact',
    'staff_performance',
    'delivery_network',
  ])
  reasoningType!: string;

  @IsOptional()
  @IsUUID()
  subjectEntityId?: string;
}

export class IngestPipelineDto {
  @IsIn(['event_bus', 'data_lake'])
  source!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5000)
  limit?: number;
}

export class TraverseGraphDto {
  @IsUUID()
  startEntityId!: string;

  @IsOptional()
  @IsString()
  relationshipType?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  maxHops?: number;
}
