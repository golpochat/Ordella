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

  serialize(rows: Array<Record<string, unknown>>): string {
    if (!rows.length) {
      return '';
    }
    const headers = Object.keys(rows[0]);
    const lines = [
      headers.join(','),
      ...rows.map((row) => headers.map((header) => this.escape(row[header])).join(',')),
    ];
    return lines.join('\n');
  }

  private escape(value: unknown): string {
    if (value === null || value === undefined) return '';
    const raw = typeof value === 'object' ? JSON.stringify(value) : String(value);
    if (!/[",\n\r]/.test(raw)) return raw;
    return `"${raw.replace(/"/g, '""')}"`;
  }
}
