export type DeliveryListFilter = {
  driverId?: string;
  status?: string;
  orderId?: string;
};

/** Parses `driverId:uuid,status:assigned` filter strings from list endpoints. */
export function parseDeliveryFilter(filter?: string): DeliveryListFilter {
  if (!filter?.trim()) {
    return {};
  }

  const result: DeliveryListFilter = {};
  for (const part of filter.split(',')) {
    const [key, value] = part.split(':');
    if (!key || !value) continue;
    if (key === 'driverId') result.driverId = value;
    if (key === 'status') result.status = value;
    if (key === 'orderId') result.orderId = value;
  }
  return result;
}
