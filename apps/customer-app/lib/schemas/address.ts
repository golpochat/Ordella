import { z } from 'zod';

export const customerAddressSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1, 'Label is required'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().optional(),
  instructions: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const createAddressSchema = customerAddressSchema.omit({ id: true });

export const updateAddressSchema = createAddressSchema.partial();

export type CustomerAddress = z.infer<typeof customerAddressSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
