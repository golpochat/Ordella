import { ApiError, createApiClient } from '@shared-utils';
import { z } from 'zod';
import { getApiBaseUrl } from './config';
import { clearSession, getDriverAccessToken, getSession } from './session';
import type { DeliveryTaskStatus } from './delivery-status';

function createDriverApiClient() {
  const session = getSession();
  return createApiClient({
    baseUrl: getApiBaseUrl(),
    getAccessToken: () => getDriverAccessToken(session),
    getTenantId: () => session.tenantId || null,
  });
}

export function fetchTenantSettings() {
  const api = createDriverApiClient();
  return withDriverSession(api.getData<unknown>('tenant/settings'));
}

async function withDriverSession<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearSession();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    throw error;
  }
}

const locationSchema = z.object({
  name: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  instructions: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const orderLineSchema = z.object({
  name: z.string(),
  quantity: z.number().int(),
});

export const deliveryTaskSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  orderId: z.string().uuid(),
  driverId: z.string().uuid().nullable(),
  status: z.enum([
    'pending',
    'assigned',
    'en_route',
    'delivered',
    'cancelled',
    'failed',
  ]),
  eta: z.string().nullable(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  metadata: z.record(z.unknown()).default({}),
  deliveryFee: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export type DeliveryTask = z.infer<typeof deliveryTaskSchema>;

export type DeliveryTaskDetails = DeliveryTask & {
  pickup: z.infer<typeof locationSchema>;
  dropoff: z.infer<typeof locationSchema>;
  customerName: string;
  customerPhone: string;
  orderNumber: string | null;
  orderItems: z.infer<typeof orderLineSchema>[];
};

const driverProfileSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  name: z.string(),
  phone: z.string(),
  status: z.string(),
  active: z.boolean(),
  vehicleType: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export type DriverProfile = z.infer<typeof driverProfileSchema>;

function parseMetadata(task: DeliveryTask): Omit<DeliveryTaskDetails, keyof DeliveryTask> {
  const meta = task.metadata ?? {};
  const pickup = locationSchema.safeParse(meta.pickup ?? meta.pickupLocation).data ?? {};
  const dropoff = locationSchema.safeParse(meta.dropoff ?? meta.delivery).data ?? {};
  const customer = z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
    })
    .safeParse(meta.customer).data;
  const orderItems = z.array(orderLineSchema).safeParse(meta.orderItems ?? meta.items).data ?? [];

  return {
    pickup,
    dropoff,
    customerName: customer?.name ?? 'Customer',
    customerPhone: customer?.phone ?? '',
    orderNumber: typeof meta.orderNumber === 'string' ? meta.orderNumber : null,
    orderItems,
  };
}

export function enrichTask(task: DeliveryTask): DeliveryTaskDetails {
  return { ...task, ...parseMetadata(task) };
}

export function belongsToDriver(task: DeliveryTask, driverId: string): boolean {
  return task.driverId === driverId || task.driverId === null;
}

export function belongsToTenant(task: DeliveryTask, tenantId: string): boolean {
  return task.tenantId === tenantId;
}

export async function fetchDeliveryTasks(status?: DeliveryTaskStatus): Promise<DeliveryTask[]> {
  const api = createDriverApiClient();
  const session = getSession();
  const filterParts = [`driverId:${session.driverId}`];
  if (status) {
    filterParts.push(`status:${status}`);
  }

  const response = await withDriverSession(
    api.get<{ success: boolean; data: unknown[] }>('deliveries', {
      params: { filter: filterParts.join(',') },
    }),
  );

  const tasks = z.array(deliveryTaskSchema).parse(response.data);
  return tasks.filter(
    (task) => belongsToTenant(task, session.tenantId) && belongsToDriver(task, session.driverId),
  );
}

export async function fetchDeliveryTask(taskId: string): Promise<DeliveryTaskDetails> {
  const api = createDriverApiClient();
  const session = getSession();
  const response = await withDriverSession(
    api.get<{ success: boolean; data: unknown }>(`deliveries/${taskId}`),
  );
  const task = deliveryTaskSchema.parse(response.data);

  if (!belongsToTenant(task, session.tenantId)) {
    throw new Error('Task is not available for this tenant');
  }
  if (!belongsToDriver(task, session.driverId)) {
    throw new Error('Task is not assigned to you');
  }

  return enrichTask(task);
}

export async function updateDeliveryTask(
  taskId: string,
  body: { status?: DeliveryTaskStatus; notes?: string },
): Promise<DeliveryTask> {
  const api = createDriverApiClient();
  const session = getSession();
  const response = await withDriverSession(
    api.patch<{ success: boolean; data: unknown }>(`deliveries/${taskId}`, body),
  );
  const task = deliveryTaskSchema.parse(response.data);

  if (!belongsToTenant(task, session.tenantId)) {
    throw new Error('Task is not available for this tenant');
  }
  if (!belongsToDriver(task, session.driverId)) {
    throw new Error('Task is not assigned to you');
  }

  return task;
}

export async function fetchDriverProfile(driverId: string): Promise<DriverProfile> {
  const api = createDriverApiClient();
  const response = await withDriverSession(
    api.get<{ success: boolean; data: unknown }>(`drivers/${driverId}`),
  );
  return driverProfileSchema.parse(response.data);
}

export async function updateDriverProfile(
  driverId: string,
  body: { status?: string },
): Promise<DriverProfile> {
  const api = createDriverApiClient();
  const response = await withDriverSession(
    api.patch<{ success: boolean; data: unknown }>(`drivers/${driverId}`, body),
  );
  return driverProfileSchema.parse(response.data);
}

export function formatAddress(location: {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
}): string {
  return [location.addressLine1, location.addressLine2, location.city, location.postalCode]
    .filter(Boolean)
    .join(', ');
}
