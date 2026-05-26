export enum SupportTicketCategory {
  ORDER_ISSUE = 'order_issue',
  DELIVERY_ISSUE = 'delivery_issue',
  REFUND = 'refund',
  PRODUCT_ISSUE = 'product_issue',
  SUBSCRIPTION = 'subscription',
  LOYALTY = 'loyalty',
  GENERAL = 'general',
}

export enum SupportTicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum SupportTicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_CUSTOMER = 'waiting_customer',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum SupportTicketSource {
  CUSTOMER_PORTAL = 'customer_portal',
  ADMIN = 'admin',
  STOREFRONT_CHAT = 'storefront_chat',
}

export enum SupportMessageAuthorType {
  CUSTOMER = 'customer',
  STAFF = 'staff',
  SYSTEM = 'system',
}
