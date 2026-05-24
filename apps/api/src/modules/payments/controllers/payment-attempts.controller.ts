import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard } from '../../auth';
import { RbacGuard } from '../../auth';
import { RequirePermissions } from '../../auth';
import { PaymentsPermissionKeys } from '../constants/permission-keys';
import { FilterPaymentAttemptDto } from '../dto';
import { PaymentAttemptResponseDto } from '../dto';
import { PaymentAttemptsService } from '../services';

/** SRS §9 — gateway attempt audit log */
@Controller('payment-attempts')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class PaymentAttemptsController {
  constructor(private readonly paymentAttemptsService: PaymentAttemptsService) {}

  @Get()
  @RequirePermissions(PaymentsPermissionKeys.PAYMENT_ATTEMPTS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaymentAttemptDto,
  ): Promise<ApiSuccessResponse<PaymentAttemptResponseDto[]>> {
    const data = await this.paymentAttemptsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(PaymentsPermissionKeys.PAYMENT_ATTEMPTS_READ)
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<PaymentAttemptResponseDto>> {
    const data = await this.paymentAttemptsService.findOne(tenant, id);
    return { success: true, data };
  }
}
