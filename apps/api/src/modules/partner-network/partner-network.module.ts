import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_STORE_ENTITIES } from '../app-store/entities';
import { AppStoreModule } from '../app-store';
import { AuditModule } from '../audit';
import {
  PartnerTierEntity,
  PartnerProfileEntity,
  PartnerRegionEntity,
  PartnerCapabilityEntity,
  PartnerUserEntity,
  PartnerApplicationEntity,
  PartnerVerificationCheckEntity,
  PartnerCertTrainingModuleEntity,
  PartnerTrainingProgressEntity,
  PartnerApprovalEntity,
  PartnerClientTenantEntity,
  PartnerMarketplaceCategoryEntity,
  PartnerMarketplaceItemEntity,
  PartnerCommissionRecordEntity,
  PartnerPayoutReportEntity,
  PartnerReferralEntity,
  PartnerSupportTicketEntity,
} from './entities';
import { PartnerNetworkController } from './controllers/partner-network.controller';
import { PartnerPortalController } from './controllers/partner-portal.controller';
import { PartnerNetworkService } from './services/partner-network.service';
import { PartnerAuthGuard } from './guards/partner-auth.guard';

@Module({
  imports: [
    AuditModule,
    AppStoreModule,
    TypeOrmModule.forFeature([
      ...APP_STORE_ENTITIES,
      PartnerTierEntity,
      PartnerProfileEntity,
      PartnerRegionEntity,
      PartnerCapabilityEntity,
      PartnerUserEntity,
      PartnerApplicationEntity,
      PartnerVerificationCheckEntity,
      PartnerCertTrainingModuleEntity,
      PartnerTrainingProgressEntity,
      PartnerApprovalEntity,
      PartnerClientTenantEntity,
      PartnerMarketplaceCategoryEntity,
      PartnerMarketplaceItemEntity,
      PartnerCommissionRecordEntity,
      PartnerPayoutReportEntity,
      PartnerReferralEntity,
      PartnerSupportTicketEntity,
    ]),
  ],
  controllers: [PartnerNetworkController, PartnerPortalController],
  providers: [PartnerNetworkService, PartnerAuthGuard],
  exports: [PartnerNetworkService],
})
export class PartnerNetworkModule {}

