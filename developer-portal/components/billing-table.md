# Billing Table Component

Sortable table of invoices and line items on [Billing](../pages/billing.md).

---

## Purpose

Display billing history, payment status, and download actions for finance users.

---

## Columns (placeholder)

<!-- UI placeholder: data table -->

| Column | Sortable | Description |
|--------|----------|-------------|
| Invoice | Yes | Invoice number + link |
| Period | Yes | Service period dates |
| Amount | Yes | Formatted currency |
| Status | Yes | Paid · Open · Failed · Void |
| Actions | No | Download PDF (placeholder) |

---

## Row expansion (optional placeholder)

Expanded row shows line items: API overage, plan fee, partner credit (placeholder).

---

## Props (placeholder)

| Prop | Type |
|------|------|
| `invoices` | Invoice[] |
| `onDownload` | (id) => void |
| `loading` | boolean |

---

## Empty state

<!-- UI placeholder -->

“No invoices yet. Your first invoice will appear after the current billing period.”

**Section reference:** [Billing overview](../sections/billing-overview.md)
