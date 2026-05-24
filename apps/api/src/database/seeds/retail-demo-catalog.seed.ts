/**
 * Retail-agnostic sample catalog for demos, onboarding import, and seeds.
 */
export const RETAIL_DEMO_CATEGORIES = [
  { name: 'Beverages', description: 'Hot and cold drinks' },
  { name: 'Snacks', description: 'Quick bites and packaged snacks' },
  { name: 'Household', description: 'Home essentials' },
  { name: 'Fresh Produce', description: 'Fruit and vegetables' },
  { name: 'Bakery', description: 'Fresh baked goods' },
  { name: 'Clothing', description: 'Apparel and accessories' },
] as const;

export const RETAIL_DEMO_PRODUCTS = [
  { name: 'Latte', category: 'Beverages', price: '3.80', sku: 'BEV-LATTE' },
  { name: 'Croissant', category: 'Bakery', price: '2.50', sku: 'BAK-CROI' },
  { name: 'Organic Apples', category: 'Fresh Produce', price: '4.99', sku: 'PRO-APPLE' },
  { name: 'T-Shirt', category: 'Clothing', price: '24.00', sku: 'CLT-TEE' },
  { name: 'Laundry Detergent', category: 'Household', price: '8.99', sku: 'HOU-DET' },
] as const;
