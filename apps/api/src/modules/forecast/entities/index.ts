import { ForecastModelConfigEntity } from './forecast-model-config.entity';
import { ForecastSnapshotEntity } from './forecast-snapshot.entity';

export { ForecastModelConfigEntity } from './forecast-model-config.entity';
export { ForecastSnapshotEntity } from './forecast-snapshot.entity';
export type { ForecastModelType } from './forecast-model-config.entity';
export type { ForecastType } from './forecast-snapshot.entity';

export const FORECAST_ENTITIES = [ForecastSnapshotEntity, ForecastModelConfigEntity];
