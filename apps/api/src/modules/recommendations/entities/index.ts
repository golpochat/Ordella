import { RecommendationCacheEntity } from './recommendation-cache.entity';
import { RecommendationEventEntity } from './recommendation-event.entity';
import { RecommendationSettingsEntity } from './recommendation-settings.entity';

export { RecommendationCacheEntity } from './recommendation-cache.entity';
export { RecommendationEventEntity } from './recommendation-event.entity';
export { RecommendationSettingsEntity } from './recommendation-settings.entity';
export type { RecommendationEventType } from './recommendation-event.entity';

export const RECOMMENDATION_ENTITIES = [
  RecommendationCacheEntity,
  RecommendationEventEntity,
  RecommendationSettingsEntity,
];
