export type AppEnvironment = 'development' | 'staging' | 'production' | 'test';

export interface DeploymentConfig {
  env: AppEnvironment;
  platformBaseDomain: string;
  onboardingHost: string;
  adminHost: string;
  corsOrigins: string[];
  rateLimitTenantPerMinute: number;
  rateLimitIpPerMinute: number;
  sentryDsn: string | null;
  redisUrl: string | null;
  runMigrationsOnBoot: boolean;
  allowDestructiveMigrations: boolean;
}

export function loadDeploymentConfig(): DeploymentConfig {
  const env = (process.env.NODE_ENV ?? 'development') as AppEnvironment;
  const corsRaw = process.env.CORS_ORIGINS ?? '';

  return {
    env,
    platformBaseDomain: process.env.PLATFORM_BASE_DOMAIN ?? 'ordella.local',
    onboardingHost: process.env.ONBOARDING_HOST ?? 'app.ordella.local',
    adminHost: process.env.ADMIN_HOST ?? 'admin.ordella.local',
    corsOrigins: corsRaw
      ? corsRaw.split(',').map((o) => o.trim())
      : defaultCorsOrigins(env),
    rateLimitTenantPerMinute: Number(process.env.RATE_LIMIT_TENANT_PER_MIN ?? 600),
    rateLimitIpPerMinute: Number(process.env.RATE_LIMIT_IP_PER_MIN ?? 120),
    sentryDsn: process.env.SENTRY_DSN ?? null,
    redisUrl: process.env.REDIS_URL ?? null,
    runMigrationsOnBoot: process.env.RUN_MIGRATIONS_ON_BOOT === 'true',
    allowDestructiveMigrations:
      env !== 'production' && process.env.ALLOW_DESTRUCTIVE_MIGRATIONS === 'true',
  };
}

function defaultCorsOrigins(env: AppEnvironment): string[] {
  if (env === 'production') {
    return ['https://app.ordella.com', 'https://admin.ordella.com'];
  }
  return [
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
  ];
}
