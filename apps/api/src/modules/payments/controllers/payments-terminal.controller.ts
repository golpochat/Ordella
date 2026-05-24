import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard } from '../../auth';
import { PosPermissionKeys } from '../../pos/constants/permission-keys';
import { RequirePermissions } from '../../auth';
import { CreateTerminalPaymentIntentDto } from '../dto/create-terminal-payment-intent.dto';
import { ConfirmTerminalPaymentDto } from '../dto/confirm-terminal-payment.dto';
import { PaymentsTerminalService } from '../services/payments-terminal.service';

/** In-store card payments via Stripe Terminal / PaymentIntent */
@Controller('payments/terminal')
@UseGuards(JwtAuthGuard, TenantGuard, RbacGuard)
export class PaymentsTerminalController {
  constructor(private readonly terminalService: PaymentsTerminalService) {}

  @Post('payment-intent')
  @RequirePermissions(PosPermissionKeys.POS_PAYMENT)
  async createPaymentIntent(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTerminalPaymentIntentDto,
  ): Promise<ApiSuccessResponse<{ paymentIntentId: string; clientSecret: string | null }>> {
    const data = await this.terminalService.createPaymentIntent(tenant, user, dto);
    return { success: true, data };
  }

  @Post('confirm')
  @RequirePermissions(PosPermissionKeys.POS_PAYMENT)
  async confirmPayment(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ConfirmTerminalPaymentDto,
  ): Promise<ApiSuccessResponse<{ paymentIntentId: string; status: string }>> {
    const data = await this.terminalService.confirmPaymentIntent(tenant, user, dto);
    return { success: true, data };
  }
}
