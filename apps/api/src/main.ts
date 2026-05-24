import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { json, raw } from 'express';
import { AppModule } from './app.module';
import { loadDeploymentConfig } from './platform/config/deployment.config';
import { MigrationRunnerService } from './platform/migrations/migration-runner.service';
import { AuthenticatedIoAdapter } from './platform/websocket/authenticated-io.adapter';

async function bootstrap(): Promise<void> {
  const deployConfig = loadDeploymentConfig();
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use('/api/v1/billing/webhook', raw({ type: 'application/json' }));
  expressApp.use('/api/v1/payments/webhook', raw({ type: 'application/json' }));
  expressApp.use(json());

  app.useWebSocketAdapter(new AuthenticatedIoAdapter(app));

  app.enableCors({
    origin: deployConfig.corsOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id'],
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (deployConfig.runMigrationsOnBoot) {
    app.get(MigrationRunnerService).runPendingMigrations();
  }

  const port = app.get(ConfigService).get<string>('API_PORT') ?? 3000;
  await app.listen(port);
}

bootstrap();
