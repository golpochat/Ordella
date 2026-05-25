/** PromotionRule.ruleType — eligibility rules */
export enum RuleType {
  MIN_ORDER_VALUE = 'min_order_value',
  PRODUCT_IN_CART = 'product_in_cart',
  CATEGORY_IN_CART = 'category_in_cart',
  CUSTOMER_SEGMENT = 'customer_segment',
  TIME_WINDOW = 'time_window',
  LOCATION = 'location',
  CHANNEL = 'channel',
  FIRST_ORDER = 'first_order',
}
