import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { FilterPaginationDto } from '../../../common/dto';
import { SearchEntityType } from '../entities';

const ENTITY_TYPES = [
  'item',
  'category',
  'customer',
  'order',
  'supplier',
  'inventory_item',
  'location',
  'bin',
] as const;

const SORT_VALUES = ['relevance', 'price', 'name', 'popularity'] as const;

export class SearchQueryDto extends FilterPaginationDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(ENTITY_TYPES)
  entityType?: SearchEntityType;

  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMax?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStockOnly?: boolean;

  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @IsOptional()
  @IsString()
  dateRange?: string;

  @IsOptional()
  @IsIn(SORT_VALUES)
  sort?: 'relevance' | 'price' | 'name' | 'popularity';

  @IsOptional()
  @IsUUID()
  boostCategoryId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  popularityWeight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  availabilityWeight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  categoryWeight?: number;
}

export class SemanticSearchQueryDto extends SearchQueryDto {}

export class ReindexSearchDto {
  @IsOptional()
  @IsIn(ENTITY_TYPES)
  entityType?: SearchEntityType;
}

export class SearchAnalyticsEventDto {
  @IsIn(['query', 'click', 'conversion'])
  eventType!: 'query' | 'click' | 'conversion';

  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsIn(ENTITY_TYPES)
  entityType?: SearchEntityType;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  resultCount?: number;
}
