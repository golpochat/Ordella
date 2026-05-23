import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

export interface JwtPayload {
  sub: string;
  tenantId: string;
  email: string;
  roleId: string;
  sessionId?: string;
  permissions?: string[];
}

/**
 * JWT strategy placeholder — validates access tokens and builds AuthenticatedUser.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'change-me-local-dev-only'),
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    // TODO: optional session revocation check via SessionRepository
    return {
      id: payload.sub,
      tenantId: payload.tenantId,
      email: payload.email,
      roleId: payload.roleId,
      sessionId: payload.sessionId,
      permissions: payload.permissions ?? [],
    };
  }
}
