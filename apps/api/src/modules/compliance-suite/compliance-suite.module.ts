import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { SsoProviderEntity } from '../auth/entities';
import { AuditorPortalController } from './controllers/auditor-portal.controller';
import { ComplianceSuiteController } from './controllers/compliance-suite.controller';
import { COMPLIANCE_SUITE_ENTITIES } from './entities';
import { AuditorAuthGuard } from './guards/auditor-auth.guard';
import { ComplianceSuiteService } from './services/compliance-suite.service';

@Module({
  imports: [
    AuditModule,
    AuthModule,
    TypeOrmModule.forFeature([...COMPLIANCE_SUITE_ENTITIES, SsoProviderEntity]),
  ],
  controllers: [ComplianceSuiteController, AuditorPortalController],
  providers: [ComplianceSuiteService, AuditorAuthGuard],
  exports: [ComplianceSuiteService],
})
export class ComplianceSuiteModule {}
