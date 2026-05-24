import { Injectable, Logger } from '@nestjs/common';

/** Placeholder — scheduled report generation */
@Injectable()
export class ScheduledReportsService {
  private readonly logger = new Logger(ScheduledReportsService.name);

  registerCron(tenantId: string, schedule: string, reportType: string): void {
    this.logger.debug(
      `[placeholder] ScheduledReportsService.register tenant=${tenantId} schedule=${schedule} type=${reportType}`,
    );
  }
}
