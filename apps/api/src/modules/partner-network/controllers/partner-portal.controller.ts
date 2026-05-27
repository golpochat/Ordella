import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { TenantGuard } from '../../../common/guards';
import { CurrentTenant } from '../../../common/decorators';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { PartnerAuthGuard } from '../guards/partner-auth.guard';
import { CurrentPartner } from '../decorators/current-partner.decorator';
import { PartnerNetworkService } from '../services/partner-network.service';
import {
  CreateMarketplaceItemDto,
  CreatePartnerSupportTicketDto,
  InstallAppOnBehalfDto,
  LinkClientTenantDto,
  MarketplaceQueryDto,
  PartnerPortalLoginDto,
  SubmitPartnerApplicationDto,
  UpdatePartnerTrainingProgressDto,
  UpdatePartnerVerificationDto,
} from '../dto';

@Controller('partner-network/portal')
export class PartnerPortalController {
  constructor(private readonly network: PartnerNetworkService) {}

  @Post('login')
  @UseGuards(TenantGuard)
  async login(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: PartnerPortalLoginDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.network.partnerLogin(tenant, dto);
    return { success: true, data };
  }

  @Post('application/submit')
  @UseGuards(TenantGuard, PartnerAuthGuard)
  async submitApplication(
    @CurrentTenant() tenant: TenantContext,
    @CurrentPartner() partner: any,
    @Body() dto: SubmitPartnerApplicationDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.network.submitPartnerApplication(tenant, partner, dto);
    return { success: true, data };
  }

  @Post('verification')
  @UseGuards(TenantGuard, PartnerAuthGuard)
  async verification(
    @CurrentTenant() tenant: TenantContext,
    @CurrentPartner() partner: any,
    @Body() dto: UpdatePartnerVerificationDto & { applicationId: string },
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.network.updateVerificationCheck(tenant, partner, dto.applicationId, dto);
    return { success: true, data };
  }

  @Post('training/:moduleId/progress')
  @UseGuards(TenantGuard, PartnerAuthGuard)
  async trainingProgress(
    @CurrentTenant() tenant: TenantContext,
    @CurrentPartner() partner: any,
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
    @Body() dto: UpdatePartnerTrainingProgressDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.network.updateTrainingProgress(tenant, partner, moduleId, dto);
    return { success: true, data };
  }

  @Post('client-tenants/link')
  @UseGuards(TenantGuard, PartnerAuthGuard)
  async linkClientTenant(
    @CurrentTenant() tenant: TenantContext,
    @CurrentPartner() partner: any,
    @Body() dto: LinkClientTenantDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.network.linkClientTenant(tenant, partner, dto);
    return { success: true, data };
  }

  @Get('client-tenants')
  @UseGuards(TenantGuard, PartnerAuthGuard)
  async clientTenants(
    @CurrentTenant() tenant: TenantContext,
    @CurrentPartner() partner: any,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.network.listClientTenants(tenant, partner);
    return { success: true, data };
  }

  @Get('marketplace/categories')
  @UseGuards(TenantGuard, PartnerAuthGuard)
  async categories(
    @CurrentTenant() tenant: TenantContext,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.network.listMarketplaceCategories(tenant);
    return { success: true, data };
  }

  @Get('marketplace/items')
  @UseGuards(TenantGuard, PartnerAuthGuard)
  async items(
    @CurrentTenant() tenant: TenantContext,
    @CurrentPartner() partner: any,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.network.listMarketplaceItems(tenant, partner, {});
    return { success: true, data };
  }

  @Post('tenants/:clientTenantId/apps/:appId/install')
  @UseGuards(TenantGuard, PartnerAuthGuard)
  async installApp(
    @CurrentTenant() tenant: TenantContext,
    @CurrentPartner() partner: any,
    @Param('clientTenantId', ParseUUIDPipe) clientTenantId: string,
    @Param('appId', ParseUUIDPipe) appId: string,
    @Body() dto: InstallAppOnBehalfDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.network.installAppOnBehalf(tenant, partner, clientTenantId, appId, dto);
    return { success: true, data };
  }

  @Post('support/tickets')
  @UseGuards(TenantGuard, PartnerAuthGuard)
  async createSupportTicket(
    @CurrentTenant() tenant: TenantContext,
    @CurrentPartner() partner: any,
    @Body() dto: CreatePartnerSupportTicketDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.network.createPartnerSupportTicket(tenant, partner, dto);
    return { success: true, data };
  }
}

