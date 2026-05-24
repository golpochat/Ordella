import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { resolveRolePermissions } from '../../../common/rbac/role-permissions';
import { verifyPassword } from '../../onboarding/utils/password.util';
import { UserEntity } from '../entities/user.entity';
import { UserStatus } from '../enums/user-status.enum';
import { CreateLoginDto } from '../dto';
import { LoginResponseDto } from '../dto';
import { CreateRefreshTokenDto } from '../dto';
import { CreateLogoutDto } from '../dto';
import { CreateMfaVerifyDto } from '../dto';
import { CreatePinLoginDto } from '../dto';
import { TenantContext } from '../../../common/interfaces';
import { OnboardingRepository } from '../../onboarding/repositories/onboarding.repositories';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly onboardingRepository: OnboardingRepository,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async login(
    tenant: TenantContext | undefined,
    dto: CreateLoginDto,
  ): Promise<LoginResponseDto> {
    if (!tenant?.tenantId) {
      throw new UnauthorizedException('Tenant context is required');
    }

    const user = await this.onboardingRepository.findUserByEmail(tenant.tenantId, dto.email);
    if (!user || user.status !== UserStatus.ACTIVE || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await verifyPassword(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueTokens(user);
  }

  pinLogin(_tenant: TenantContext | undefined, _dto: CreatePinLoginDto): Promise<LoginResponseDto> {
    throw new UnauthorizedException('PIN login is not configured');
  }

  async refresh(dto: CreateRefreshTokenDto): Promise<LoginResponseDto> {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; tenantId: string }>(
        dto.refreshToken,
      );
      const user = await this.users.findOne({
        where: { id: payload.sub, tenantId: payload.tenantId },
        relations: ['role'],
      });
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return this.issueTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(_userId: string | undefined, _dto: CreateLogoutDto): Promise<void> {
    return;
  }

  verifyMfa(_dto: CreateMfaVerifyDto): Promise<LoginResponseDto> {
    throw new UnauthorizedException('MFA is not configured');
  }

  private async issueTokens(user: UserEntity): Promise<LoginResponseDto> {
    const assigned = await this.onboardingRepository.getRolePermissions(user.roleId);
    const roleName = user.role?.name ?? 'unknown';
    const permissions = resolveRolePermissions(roleName, assigned);

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      roleId: user.roleId,
      roleName,
      permissions,
    });

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, tenantId: user.tenantId, type: 'refresh' },
      { expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') },
    );

    const expiresIn = this.parseExpiresInSeconds(
      this.config.get<string>('JWT_EXPIRES_IN', '15m'),
    );

    return { accessToken, refreshToken, expiresIn };
  }

  private parseExpiresInSeconds(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value.trim());
    if (!match) {
      return 900;
    }
    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return amount * (multipliers[unit] ?? 60);
  }
}
