import { DataGovernancePolicyEntity } from './data-governance-policy.entity';
import { DataLakeExportEntity } from './data-lake-export.entity';
import { DataLakePartitionEntity } from './data-lake-partition.entity';
import { DataLakeSchemaEntity } from './data-lake-schema.entity';
import { DataLakeSettingsEntity } from './data-lake-settings.entity';
import { DataLakeZoneEntity } from './data-lake-zone.entity';
import { DataMaterializedViewEntity } from './data-materialized-view.entity';
import { DataPipelineRunEntity } from './data-pipeline-run.entity';
import { DataPipelineEntity } from './data-pipeline.entity';
import { DataWarehouseTableEntity } from './data-warehouse-table.entity';
import { FeatureStoreFeatureEntity } from './feature-store-feature.entity';

export { DataGovernancePolicyEntity } from './data-governance-policy.entity';
export { DataLakeExportEntity } from './data-lake-export.entity';
export { DataLakePartitionEntity } from './data-lake-partition.entity';
export { DataLakeSchemaEntity } from './data-lake-schema.entity';
export { DataLakeSettingsEntity } from './data-lake-settings.entity';
export { DataLakeZoneEntity, type DataLakeZoneKey } from './data-lake-zone.entity';
export { DataMaterializedViewEntity } from './data-materialized-view.entity';
export { DataPipelineRunEntity } from './data-pipeline-run.entity';
export { DataPipelineEntity } from './data-pipeline.entity';
export { DataWarehouseTableEntity } from './data-warehouse-table.entity';
export { FeatureStoreFeatureEntity } from './feature-store-feature.entity';

export const DATA_LAKE_ENTITIES = [
  DataGovernancePolicyEntity,
  DataLakeExportEntity,
  DataLakePartitionEntity,
  DataLakeSchemaEntity,
  DataLakeSettingsEntity,
  DataLakeZoneEntity,
  DataMaterializedViewEntity,
  DataPipelineRunEntity,
  DataPipelineEntity,
  DataWarehouseTableEntity,
  FeatureStoreFeatureEntity,
];
