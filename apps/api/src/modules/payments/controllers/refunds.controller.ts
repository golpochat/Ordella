import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard } from '../../auth';
import { RbacGuard } from '../../auth';
import { RequirePermissions } from '../../auth';
import { PaymentsPermissionKeys } from '../constants/permission-keys';
import { CreateRefundDto } from '../dto';
import { RefundResponseDto } from '../dto';
import { RefundsService } from '../services';

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
