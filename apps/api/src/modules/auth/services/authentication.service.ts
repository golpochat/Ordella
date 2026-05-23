import { Injectable, NotImplementedException } from '@nestjs/common';
import { LoginDto } from '../dto/authentication/login.dto';
import { LoginResponseDto } from '../dto/authentication/login-response.dto';
import { RefreshTokenDto } from '../dto/authentication/refresh-token.dto';
import { LogoutDto } from '../dto/authentication/logout.dto';
import { MfaVerifyDto } from '../dto/authentication/mfa-verify.dto';
import { PinLoginDto } from '../dto/authentication/pin-login.dto';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';

@Injectable()
export class AuthenticationService {
  login(_tenant: TenantContext | undefined, _dto: LoginDto): Promise<LoginResponseDto> {
    // TODO: validate credentials, create session, issue JWT + refresh token
    throw new NotImplementedException('login');
  }

  pinLogin(_tenant: TenantContext | undefined, _dto: PinLoginDto): Promise<LoginResponseDto> {
    // TODO: POS PIN login with terminal binding
    throw new NotImplementedException('pinLogin');
  }

  refresh(_dto: RefreshTokenDto): Promise<LoginResponseDto> {
    // TODO: validate refresh token, rotate session
    throw new NotImplementedException('refresh');
  }

  logout(_userId: string | undefined, _dto: LogoutDto): Promise<void> {
    // TODO: revoke session / refresh token
    throw new NotImplementedException('logout');
  }

  verifyMfa(_dto: MfaVerifyDto): Promise<LoginResponseDto> {
    // TODO: verify MFA code and complete login
    throw new NotImplementedException('verifyMfa');
  }
}
