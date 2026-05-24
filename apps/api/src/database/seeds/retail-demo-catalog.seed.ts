/**
 * Reference catalog items for demos and future seed runners.
 * Mixed retail verticals — not wired to DB until a seed runner is implemented.
 */
export const RETAIL_DEMO_CATEGORIES = [
  { name: 'Fresh produce', vertical: 'grocery' },
  { name: 'Coffee & pastries', vertical: 'café' },
  { name: 'Butcher counter', vertical: 'butcher' },
  { name: 'Apparel', vertical: 'clothing' },
  { name: 'Essentials', vertical: 'convenience' },
] as const;

export const RETAIL_DEMO_PRODUCTS = [
  { name: 'Organic apples (1 kg)', category: 'Fresh produce', price: '4.99' },
  { name: 'Sourdough loaf', category: 'Coffee & pastries', price: '5.50' },
  { name: 'Flat white', category: 'Coffee & pastries', price: '3.80' },
  { name: 'Grass-fed ribeye (400 g)', category: 'Butcher counter', price: '18.99' },
  { name: 'Classic crew tee', category: 'Apparel', price: '24.00' },
  { name: 'House batteries (4-pack)', category: 'Essentials', price: '6.49' },
] as const;
