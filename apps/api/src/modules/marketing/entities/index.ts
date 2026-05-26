import { MarketingCampaignLogEntity } from './marketing-campaign-log.entity';
import { MarketingCampaignEntity } from './marketing-campaign.entity';
import { MarketingBehaviorEventEntity } from './marketing-behavior-event.entity';
import { MarketingJourneyEntity } from './marketing-journey.entity';
import { MarketingSegmentEntity } from './marketing-segment.entity';

export { MarketingBehaviorEventEntity } from './marketing-behavior-event.entity';
export { MarketingCampaignLogEntity } from './marketing-campaign-log.entity';
export { MarketingCampaignEntity } from './marketing-campaign.entity';
export {
  MarketingCampaignAutomationType,
  MarketingCampaignLogStatus,
  MarketingScheduleType,
  MarketingCampaignStatus,
  MarketingCampaignType,
} from './marketing-campaign-status.enum';
export { MarketingJourneyEntity } from './marketing-journey.entity';
export { MarketingSegmentEntity } from './marketing-segment.entity';

export const MARKETING_ENTITIES = [
  MarketingBehaviorEventEntity,
  MarketingCampaignEntity,
  MarketingCampaignLogEntity,
  MarketingJourneyEntity,
  MarketingSegmentEntity,
];
