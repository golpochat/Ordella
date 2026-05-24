import { normalizeDateRange } from '../../reports/domain/report-date.util';

export type AnalyticsRange = {
  from: string;
  to: string;
  fromDate: Date;
  toDate: Date;
  previousFromDate: Date;
  previousToDate: Date;
};

export function resolveAnalyticsRange(from?: string, to?: string): AnalyticsRange {
  const { from: fromStr, to: toStr } = normalizeDateRange(from, to);
  const fromDate = new Date(`${fromStr}T00:00:00.000Z`);
  const toDate = new Date(`${toStr}T23:59:59.999Z`);

  const dayMs = 24 * 60 * 60 * 1000;
  const spanDays =
    Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / dayMs) + 1);
  const previousToDate = new Date(fromDate.getTime() - 1);
  const previousFromDate = new Date(previousToDate.getTime() - (spanDays - 1) * dayMs);
  previousFromDate.setUTCHours(0, 0, 0, 0);
  previousToDate.setUTCHours(23, 59, 59, 999);

  return {
    from: fromStr,
    to: toStr,
    fromDate,
    toDate,
    previousFromDate,
    previousToDate,
  };
}
