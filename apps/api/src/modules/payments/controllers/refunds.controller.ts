import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { PaymentsPermissionKeys } from '../constants/permission-keys';
import { CreateRefundDto } from '../dto/refunds/create-refund.dto';
import { RefundResponseDto } from '../dto/refunds/refund-response.dto';
import { RefundsService } from '../services/refunds.service';

/** API Spec §6.2 */
@Controller('refunds')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  @RequirePermissions(PaymentsPermissionKeys.REFUNDS_CREATE)
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateRefundDto,
  ): Promise<ApiSuccessResponse<RefundResponseDto>> {
    const data = await this.refundsService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(PaymentsPermissionKeys.REFUNDS_READ)
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<RefundResponseDto>> {
    const data = await this.refundsService.findOne(tenant, id);
    return { success: true, data };
  }
}
