import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateLoginDto } from '../dto';
import { LoginResponseDto } from '../dto';
import { CreateRefreshTokenDto } from '../dto';
import { CreateLogoutDto } from '../dto';
import { CreateMfaVerifyDto } from '../dto';
import { CreatePinLoginDto } from '../dto';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';

@Injectable()
export class AuthenticationService {
  login(_tenant: TenantContext | undefined, _dto: CreateLoginDto): Promise<LoginResponseDto> {
    // TODO: validate credentials, create session, issue JWT + refresh token
    throw new NotImplementedException('login');
  }

  pinLogin(_tenant: TenantContext | undefined, _dto: CreatePinLoginDto): Promise<LoginResponseDto> {
    // TODO: POS PIN login with terminal binding
    throw new NotImplementedException('pinLogin');
  }

  refresh(_dto: CreateRefreshTokenDto): Promise<LoginResponseDto> {
    // TODO: validate refresh token, rotate session
    throw new NotImplementedException('refresh');
  }

  logout(_userId: string | undefined, _dto: CreateLogoutDto): Promise<void> {
    // TODO: revoke session / refresh token
    throw new NotImplementedException('logout');
  }

  verifyMfa(_dto: CreateMfaVerifyDto): Promise<LoginResponseDto> {
    // TODO: verify MFA code and complete login
    throw new NotImplementedException('verifyMfa');
  }
}
