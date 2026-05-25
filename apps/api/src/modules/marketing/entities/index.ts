import { MarketingCampaignLogEntity } from './marketing-campaign-log.entity';
import { MarketingCampaignEntity } from './marketing-campaign.entity';
import { MarketingSegmentEntity } from './marketing-segment.entity';

export { MarketingCampaignLogEntity } from './marketing-campaign-log.entity';
export { MarketingCampaignEntity } from './marketing-campaign.entity';
export {
  MarketingCampaignLogStatus,
  MarketingCampaignStatus,
  MarketingCampaignType,
} from './marketing-campaign-status.enum';
export { MarketingSegmentEntity } from './marketing-segment.entity';

export const MARKETING_ENTITIES = [
  MarketingCampaignEntity,
  MarketingCampaignLogEntity,
  MarketingSegmentEntity,
];
