import { Injectable, Logger } from '@nestjs/common';

/** Placeholder — CSV / Excel export jobs */
@Injectable()
export class CsvExportService {
  private readonly logger = new Logger(CsvExportService.name);

  enqueueExport(tenantId: string, reportType: string, range: { from: string; to: string }): void {
    this.logger.debug(
      `[placeholder] CsvExportService.enqueue tenant=${tenantId} type=${reportType} from=${range.from} to=${range.to}`,
    );
  }
}
