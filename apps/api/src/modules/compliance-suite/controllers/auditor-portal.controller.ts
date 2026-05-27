import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { AuditorLoginDto } from '../dto';
import { AuditorAuthGuard } from '../guards/auditor-auth.guard';
import { ComplianceSuiteService } from '../services/compliance-suite.service';

@Controller('compliance-suite/auditor')
export class AuditorPortalController {
  constructor(private readonly compliance: ComplianceSuiteService) {}

  @Post('login')
  @UseGuards(TenantGuard)
  async login(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: AuditorLoginDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.compliance.auditorLogin(tenant, dto) };
  }

  @Get('bundle')
  @UseGuards(TenantGuard, AuditorAuthGuard)
  async bundle(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.compliance.auditorReadonlyBundle(tenant) };
  }
}
