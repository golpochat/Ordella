import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { loadDeploymentConfig } from '../config/deployment.config';

@Injectable()
export class SentryService implements OnModuleInit {
  private readonly logger = new Logger(SentryService.name);
  private readonly config = loadDeploymentConfig();
  private enabled = false;

  onModuleInit(): void {
    if (!this.config.sentryDsn) {
      this.logger.debug('Sentry DSN not set — error tracking disabled');
      return;
    }

    Sentry.init({
      dsn: this.config.sentryDsn,
      environment: this.config.env,
      tracesSampleRate: this.config.env === 'production' ? 0.1 : 1.0,
    });
    this.enabled = true;
    this.logger.log(`Sentry initialized for ${this.config.env}`);
  }

  captureException(error: unknown, context?: Record<string, unknown>): void {
    if (!this.enabled) {
      return;
    }
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('extra', context);
      }
      Sentry.captureException(error);
    });
  }
}
