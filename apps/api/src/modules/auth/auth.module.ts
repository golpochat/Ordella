import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AUTH_ENTITIES } from './entities';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RbacGuard } from './guards/rbac.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Auth domain module — Authentication Service (architecture blueprint §2.2).
 *
 * API routes (prefix /api/v1):
 * - /auth/*           — login, refresh, logout, MFA, PIN
 * - /users            — user accounts
 * - /roles            — RBAC roles
 * - /permissions      — permission catalog
 * - /sessions         — session management
 * - /api-keys         — tenant-scoped API keys
 */
@Module({
  imports: [
    TypeOrmModule.forFeature(AUTH_ENTITIES),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'change-me-local-dev-only'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
    }),
    AuthenticationModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    SessionsModule,
    ApiKeysModule,
  ],
  providers: [JwtStrategy, JwtAuthGuard, RbacGuard],
  exports: [JwtModule, JwtAuthGuard, RbacGuard, ApiKeysModule],
})
export class AuthModule {}
