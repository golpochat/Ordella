export interface OrderLineForTotals {
  quantity: number;
  price: string;
}

export interface OrderTotals {
  subtotal: string;
  tax: string;
  total: string;
}

export function formatMoney(amount: number): string {
  return amount.toFixed(2);
}

export function calculateOrderTotals(
  lines: OrderLineForTotals[],
  taxRate: number = 0,
): OrderTotals {
  const subtotalAmount = lines.reduce(
    (sum, line) => sum + Number(line.price) * line.quantity,
    0,
  );
  const taxAmount = subtotalAmount * taxRate;
  const totalAmount = subtotalAmount + taxAmount;

  return {
    subtotal: formatMoney(subtotalAmount),
    tax: formatMoney(taxAmount),
    total: formatMoney(totalAmount),
  };
}
