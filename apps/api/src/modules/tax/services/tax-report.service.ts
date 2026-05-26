import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxReportQueryDto } from '../dto';
import { OrderTaxLineEntity } from '../entities';

@Injectable()
export class TaxReportService {
  constructor(
    @InjectRepository(OrderTaxLineEntity)
    private readonly taxLines: Repository<OrderTaxLineEntity>,
  ) {}

  async report(tenantId: string, query: TaxReportQueryDto) {
    const qb = this.taxLines.createQueryBuilder('line').where('line.tenantId = :tenantId', { tenantId });
    if (query.locationId) qb.andWhere('line.locationId = :locationId', { locationId: query.locationId });
    if (query.from) qb.andWhere('line.createdAt >= :from', { from: query.from });
    if (query.to) qb.andWhere('line.createdAt <= :to', { to: query.to });
    const rows = await qb.getMany();

    const byType = this.group(rows, (line) => line.taxType);
    const byRate = this.group(rows, (line) => `${line.taxName} ${line.taxRate}% ${line.priceMode}`);
    const byLocation = this.group(rows, (line) => line.locationId);
    const byCategory = this.group(rows, (line) => line.taxCategoryId ?? 'uncategorized');

    return {
      summary: {
        taxableAmount: this.sum(rows, 'taxableAmount'),
        taxCollected: this.sum(rows, 'taxAmount'),
        lineCount: rows.length,
      },
      vat: byType.vat ?? this.empty(),
      gst: byType.gst ?? this.empty(),
      salesTax: byType.sales_tax ?? this.empty(),
      byRate,
      byLocation,
      byCategory,
      generatedAt: new Date().toISOString(),
    };
  }

  private group(rows: OrderTaxLineEntity[], key: (line: OrderTaxLineEntity) => string) {
    const result: Record<string, { taxableAmount: string; taxCollected: string; lineCount: number }> = {};
    for (const row of rows) {
      const groupKey = key(row);
      const current = result[groupKey] ?? { taxableAmount: '0.00', taxCollected: '0.00', lineCount: 0 };
      current.taxableAmount = (Number(current.taxableAmount) + Number(row.taxableAmount)).toFixed(2);
      current.taxCollected = (Number(current.taxCollected) + Number(row.taxAmount)).toFixed(2);
      current.lineCount += 1;
      result[groupKey] = current;
    }
    return result;
  }

  private sum(rows: OrderTaxLineEntity[], field: 'taxableAmount' | 'taxAmount') {
    return rows.reduce((sum, line) => sum + Number(line[field]), 0).toFixed(2);
  }

  private empty() {
    return { taxableAmount: '0.00', taxCollected: '0.00', lineCount: 0 };
  }
}
