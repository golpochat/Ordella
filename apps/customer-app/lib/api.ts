import { ApiError, createApiClient } from '@shared-utils';
import { z } from 'zod';
import { getApiBaseUrl, getTenantId } from './config';
import {
  createAddressSchema,
  customerAddressSchema,
  updateAddressSchema,
  type CreateAddressInput,
  type CustomerAddress,
  type UpdateAddressInput,
} from './schemas/address';
import { clearCustomerSession, getCustomerAccessToken, getCustomerId, tokenStorage } from './session';

function createCustomerApiClient() {
  return createApiClient({
    baseUrl: getApiBaseUrl(),
    getAccessToken: () => getCustomerAccessToken(),
    getTenantId: () => tokenStorage.getTenantId() ?? getTenantId() ?? null,
  });
}

export function fetchTenantSettings() {
  const api = createCustomerApiClient();
  return api.getData<unknown>('tenant/settings');
}

async function withCustomerSession<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && /customer session/i.test(error.message)) {
      const tenantId = tokenStorage.getTenantId();
      clearCustomerSession();
      if (tenantId) {
        tokenStorage.setTenantId(tenantId);
      }
    }
    throw error;
  }
}

const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  customerId: z.string().uuid(),
  name: z.string().optional(),
});

export const customerOrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string().nullable(),
  status: z.string(),
  paymentStatus: z.string(),
  orderType: z.string(),
  total: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export const customerOrderDetailSchema = customerOrderSchema.extend({
  subtotal: z.string().optional(),
  tax: z.string().optional(),
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        variantName: z.string().nullable().optional(),
        quantity: z.number().int(),
        price: z.string(),
        modifiers: z.array(z.unknown()).optional(),
        notes: z.string().nullable().optional(),
      }),
    )
    .optional(),
  delivery: z
    .object({
      addressLine1: z.string(),
      city: z.string(),
      instructions: z.string().optional(),
    })
    .optional(),
  statusTimeline: z
    .array(
      z.object({
        status: z.string(),
        changedAt: z.string(),
        reason: z.string().nullable().optional(),
      }),
    )
    .optional(),
});

export const customerProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  loyaltyPoints: z.number().optional(),
  pointsBalance: z.number().optional(),
  storeCreditBalance: z.string().optional(),
  lifetimeValue: z.string().optional(),
  totalOrders: z.number().optional(),
  avgOrderValue: z.string().optional(),
  firstOrderAt: z.string().nullable().optional(),
  lastOrderAt: z.string().nullable().optional(),
  preferredLocationId: z.string().nullable().optional(),
  orderFrequency: z.string().optional(),
  segments: z.array(z.string()).optional(),
  loyaltyHistory: z.array(z.unknown()).optional(),
  storeCreditHistory: z.array(z.unknown()).optional(),
  giftCards: z.array(z.unknown()).optional(),
  notificationPreferences: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
    marketingEmail: z.boolean().optional(),
    marketingSms: z.boolean().optional(),
  }),
  marketingEmailOptIn: z.boolean().optional(),
  marketingSmsOptIn: z.boolean().optional(),
});

export const orderStatusSchema = z.object({
  orderId: z.string().uuid(),
  orderNumber: z.string().nullable(),
  status: z.string(),
  paymentStatus: z.string(),
  orderType: z.string(),
  total: z.string(),
  driverName: z.string().nullable().optional(),
  driverStatus: z.string().nullable().optional(),
  driverStatusLabel: z.string().nullable().optional(),
  deliveryConfirmed: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export type CustomerOrder = z.infer<typeof customerOrderSchema>;
export type CustomerOrderDetail = z.infer<typeof customerOrderDetailSchema>;
export type CustomerProfile = z.infer<typeof customerProfileSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const customerSubscriptionSchema = z.object({
  id: z.string().uuid(),
  schedule: z.string(),
  nextRunAt: z.string(),
  status: z.string(),
  totalPrice: z.string(),
  items: z.array(
    z.object({
      id: z.string().uuid(),
      itemId: z.string().uuid(),
      quantity: z.number(),
      variantId: z.string().nullable(),
      modifiers: z.record(z.unknown()),
    }),
  ).default([]),
  orders: z.array(
    z.object({
      id: z.string().uuid(),
      orderId: z.string().uuid().nullable(),
      runAt: z.string(),
      status: z.string(),
      failureReason: z.string().nullable().optional(),
    }),
  ).default([]),
});

export type CustomerSubscription = z.infer<typeof customerSubscriptionSchema>;

export async function registerCustomer(body: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}) {
  const api = createCustomerApiClient();
  const data = await api.postData<unknown>('public/customer/register', body);
  return loginResponseSchema.parse(data);
}

export async function loginWithPassword(email: string, password: string) {
  const api = createCustomerApiClient();
  const data = await api.postData<unknown>('public/customer/login', { email, password });
  return loginResponseSchema.parse(data);
}

export async function requestOtp(email: string) {
  const api = createCustomerApiClient();
  await api.post('public/customer/otp/request', { email });
}

export async function loginWithOtp(email: string, otp: string) {
  const api = createCustomerApiClient();
  const data = await api.postData<unknown>('public/customer/login', { email, otp });
  return loginResponseSchema.parse(data);
}

export async function requestPasswordReset(email: string) {
  const api = createCustomerApiClient();
  await api.post('public/customer/reset-password', { email });
}

export async function fetchCustomerOrders(filter?: 'active' | 'past') {
  const api = createCustomerApiClient();
  const data = await withCustomerSession(
    api.getData<unknown[]>('public/customer/orders', {
      params: filter ? { filter } : undefined,
    }),
  );
  return z.array(customerOrderSchema).parse(data);
}

export async function fetchCustomerOrder(orderId: string) {
  const api = createCustomerApiClient();
  const customerId = getCustomerId();
  const data = await withCustomerSession(api.getData<unknown>(`public/customer/orders/${orderId}`));
  const order = customerOrderDetailSchema.parse(data);
  if (customerId && (data as { customerId?: string }).customerId) {
    const ownerId = (data as { customerId: string }).customerId;
    if (ownerId !== customerId) {
      throw new Error('Order not found');
    }
  }
  return order;
}

export async function fetchOrderStatus(orderId: string) {
  const api = createCustomerApiClient();
  const data = await api.getData<unknown>(`public/order-status/${orderId}`);
  return orderStatusSchema.parse(data);
}

export async function fetchCustomerProfile() {
  const api = createCustomerApiClient();
  const data = await withCustomerSession(api.getData<unknown>('public/customer/profile'));
  return customerProfileSchema.parse(data);
}

export async function fetchCustomerSubscriptions() {
  const api = createCustomerApiClient();
  const data = await withCustomerSession(api.getData<unknown[]>('public/customer/subscriptions'));
  return z.array(customerSubscriptionSchema).parse(data);
}

export async function updateCustomerSubscription(
  subscriptionId: string,
  body: { schedule?: string; nextRunAt?: string; status?: string; items?: unknown[] },
) {
  const api = createCustomerApiClient();
  const data = await withCustomerSession(
    api.patch<{ success: boolean; data: unknown }>(
      `public/customer/subscriptions/${subscriptionId}`,
      body,
    ),
  );
  return customerSubscriptionSchema.parse((data as { data: unknown }).data);
}

export async function pauseCustomerSubscription(subscriptionId: string) {
  const api = createCustomerApiClient();
  const data = await withCustomerSession(
    api.postData<unknown>(`public/customer/subscriptions/${subscriptionId}/pause`),
  );
  return customerSubscriptionSchema.parse(data);
}

export async function cancelCustomerSubscription(subscriptionId: string) {
  const api = createCustomerApiClient();
  const data = await withCustomerSession(
    api.postData<unknown>(`public/customer/subscriptions/${subscriptionId}/cancel`),
  );
  return customerSubscriptionSchema.parse(data);
}

export async function updateCustomerProfile(body: {
  name?: string;
  email?: string;
  phone?: string;
  notificationPreferences?: Partial<CustomerProfile['notificationPreferences']>;
  marketingEmailOptIn?: boolean;
  marketingSmsOptIn?: boolean;
}) {
  const api = createCustomerApiClient();
  const data = await withCustomerSession(
    api.patch<{ success: boolean; data: unknown }>('public/customer/profile', body),
  );
  return customerProfileSchema.parse((data as { data: unknown }).data);
}

export async function fetchAddresses(): Promise<CustomerAddress[]> {
  const api = createCustomerApiClient();
  const data = await withCustomerSession(api.getData<unknown[]>('public/customer/addresses'));
  return z.array(customerAddressSchema).parse(data);
}

export async function createAddress(input: CreateAddressInput): Promise<CustomerAddress> {
  const body = createAddressSchema.parse(input);
  const api = createCustomerApiClient();
  const data = await withCustomerSession(api.postData<unknown>('public/customer/addresses', body));
  return customerAddressSchema.parse(data);
}

export async function updateAddress(
  addressId: string,
  input: UpdateAddressInput,
): Promise<CustomerAddress> {
  const body = updateAddressSchema.parse(input);
  const api = createCustomerApiClient();
  const data = await withCustomerSession(
    api.patch<{ success: boolean; data: unknown }>(`public/customer/addresses/${addressId}`, body),
  );
  return customerAddressSchema.parse((data as { data: unknown }).data);
}

export async function deleteAddress(addressId: string): Promise<void> {
  const api = createCustomerApiClient();
  await withCustomerSession(api.delete(`public/customer/addresses/${addressId}`));
}
