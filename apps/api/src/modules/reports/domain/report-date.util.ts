export function toSummaryDate(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function normalizeDateRange(from?: string, to?: string): { from: string; to: string } {
  const today = toSummaryDate();
  return {
    from: from?.slice(0, 10) ?? today,
    to: to?.slice(0, 10) ?? today,
  };
}
