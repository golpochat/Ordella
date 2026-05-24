import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { Public } from '../decorators';
import { CreateLoginDto } from '../dto';
import { LoginResponseDto } from '../dto';
import { CreateRefreshTokenDto } from '../dto';
import { CreateLogoutDto } from '../dto';
import { CreateMfaVerifyDto } from '../dto';
import { CreatePinLoginDto } from '../dto';
import { AuthenticationService } from '../services';
import { CurrentUser } from '../../../common/decorators';
import { AuthenticatedUser } from '../../../common/interfaces';
import { JwtAuthGuard } from '../guards';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  /** API Spec §1.2 */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @CurrentTenant() tenant: TenantContext | undefined,
    @Body() dto: CreateLoginDto,
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
    @Body() dto: CreatePinLoginDto,
  ): Promise<ApiSuccessResponse<LoginResponseDto>> {
    const data = await this.authenticationService.pinLogin(tenant, dto);
    return { success: true, data };
  }

  /** API Spec §1.3 */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: CreateRefreshTokenDto): Promise<ApiSuccessResponse<LoginResponseDto>> {
    const data = await this.authenticationService.refresh(dto);
    return { success: true, data };
  }

  /** API Spec §1.4 */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: CreateLogoutDto,
  ): Promise<void> {
    await this.authenticationService.logout(user?.id, dto);
  }

  /** API Spec §1.5 */
  @Public()
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  async verifyMfa(@Body() dto: CreateMfaVerifyDto): Promise<ApiSuccessResponse<LoginResponseDto>> {
    const data = await this.authenticationService.verifyMfa(dto);
    return { success: true, data };
  }
}
