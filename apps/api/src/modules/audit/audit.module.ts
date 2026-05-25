import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuditLogsController } from './controllers';
import { AUDIT_ENTITIES } from './entities';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';
import { AuditLogService } from './services';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature(AUDIT_ENTITIES)],
  controllers: [AuditLogsController],
  providers: [
    AuditLogService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
  exports: [AuditLogService],
})
export class AuditModule {}
