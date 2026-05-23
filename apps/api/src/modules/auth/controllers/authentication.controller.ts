import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { Public } from '../decorators/public.decorator';
import { LoginDto } from '../dto/authentication/login.dto';
import { LoginResponseDto } from '../dto/authentication/login-response.dto';
import { RefreshTokenDto } from '../dto/authentication/refresh-token.dto';
import { LogoutDto } from '../dto/authentication/logout.dto';
import { MfaVerifyDto } from '../dto/authentication/mfa-verify.dto';
import { PinLoginDto } from '../dto/authentication/pin-login.dto';
import { AuthenticationService } from '../services/authentication.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  /** API Spec §1.2 */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @CurrentTenant() tenant: TenantContext | undefined,
    @Body() dto: LoginDto,
  ): Promise<ApiSuccessResponse<LoginResponseDto>> {
    const data = await this.authenticationService.login(tenant, dto);
    return { success: true, data };
  }

  /** SRS §1.2 — PIN login for POS */
  @Public()
  @Post('pin-login')
  @HttpCode(HttpStatus.OK)
  async pinLogin(
    @CurrentTenant() tenant: TenantContext | undefined,
    @Body() dto: PinLoginDto,
  ): Promise<ApiSuccessResponse<LoginResponseDto>> {
    const data = await this.authenticationService.pinLogin(tenant, dto);
    return { success: true, data };
  }

  /** API Spec §1.3 */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto): Promise<ApiSuccessResponse<LoginResponseDto>> {
    const data = await this.authenticationService.refresh(dto);
    return { success: true, data };
  }

  /** API Spec §1.4 */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: LogoutDto,
  ): Promise<void> {
    await this.authenticationService.logout(user?.id, dto);
  }

  /** API Spec §1.5 */
  @Public()
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  async verifyMfa(@Body() dto: MfaVerifyDto): Promise<ApiSuccessResponse<LoginResponseDto>> {
    const data = await this.authenticationService.verifyMfa(dto);
    return { success: true, data };
  }
}
