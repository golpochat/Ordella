import 'reflect-metadata';
import db from '../apps/api/src/database/data-source';
import { RoleEntity } from '../apps/api/src/modules/auth/entities/role.entity';
import { UserEntity } from '../apps/api/src/modules/auth/entities/user.entity';
import { UserStatus } from '../apps/api/src/modules/auth/enums/user-status.enum';
import { BundleEntity } from '../apps/api/src/modules/bundles/entities/bundle.entity';
import { CategoryEntity } from '../apps/api/src/modules/catalog/entities/category.entity';
import { ProductEntity } from '../apps/api/src/modules/catalog/entities/product.entity';
import { DeliveryTaskEntity } from '../apps/api/src/modules/deliveries/entities/delivery-task.entity';
import { DriverProfileEntity } from '../apps/api/src/modules/deliveries/entities/driver-profile.entity';
import { ForecastSnapshotEntity } from '../apps/api/src/modules/forecast/entities/forecast-snapshot.entity';
import { StockItemEntity } from '../apps/api/src/modules/inventory/entities/stock-item.entity';
import { CustomerEntity } from '../apps/api/src/modules/loyalty/entities/customer.entity';
import { LoyaltyTransactionEntity } from '../apps/api/src/modules/loyalty/entities/loyalty-transaction.entity';
import { TenantOnboardingEntity } from '../apps/api/src/modules/onboarding/entities/tenant-onboarding.entity';
import { TenantMembershipEntity } from '../apps/api/src/modules/onboarding/entities/tenant-membership.entity';
import { ONBOARDING_WIZARD_STEP_ORDER, OnboardingStep } from '../apps/api/src/modules/onboarding/enums/onboarding-step.enum';
import { hashPassword } from '../apps/api/src/modules/onboarding/utils/password.util';
import { OrderItemEntity } from '../apps/api/src/modules/orders/entities/order-item.entity';
import { OrderEntity } from '../apps/api/src/modules/orders/entities/order.entity';
import { PaymentEntity } from '../apps/api/src/modules/payments/entities/payment.entity';
import { RefundEntity } from '../apps/api/src/modules/payments/entities/refund.entity';
import { PurchaseOrderEntity } from '../apps/api/src/modules/procurement/entities/purchase-order.entity';
import { SupplierItemEntity } from '../apps/api/src/modules/procurement/entities/supplier-item.entity';
import { SupplierEntity } from '../apps/api/src/modules/procurement/entities/supplier.entity';
import { ReplenishmentActionEntity } from '../apps/api/src/modules/replenishment/entities/replenishment-action.entity';
import { ReplenishmentRuleEntity } from '../apps/api/src/modules/replenishment/entities/replenishment-rule.entity';
import { RoutingDecisionEntity } from '../apps/api/src/modules/routing/entities/routing-decision.entity';
import { LocationEntity } from '../apps/api/src/modules/tenants/entities/location.entity';
import { TenantEntity } from '../apps/api/src/modules/tenants/entities/tenant.entity';

type CredentialGroup =
  | 'Super admin'
  | 'Tenant admin'
  | 'Manager'
  | 'Staff'
  | 'Driver'
  | 'Supplier';

type UserSeed = {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string | null;
  password: string;
  roleId: string;
  credentialGroup: Exclude<CredentialGroup, 'Supplier'>;
};

type SupplierSeed = {
  id: string;
  tenantId: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  portalUserEmail: string;
  portalPassword: string;
};

const ids = {
  tenants: {
    platform: '10000000-0000-4000-8000-000000000001',
    bella: '10000000-0000-4000-8000-000000000002',
    urban: '10000000-0000-4000-8000-000000000003',
  },
  locations: {
    bellaSoho: '20000000-0000-4000-8000-000000000001',
    bellaCanaryWharf: '20000000-0000-4000-8000-000000000002',
    urbanManchester: '20000000-0000-4000-8000-000000000003',
  },
  roles: {
    platformSuperAdmin: '30000000-0000-4000-8000-000000000001',
    bellaOwner: '30000000-0000-4000-8000-000000000002',
    bellaManager: '30000000-0000-4000-8000-000000000003',
    bellaStaff: '30000000-0000-4000-8000-000000000004',
    bellaDriver: '30000000-0000-4000-8000-000000000005',
    urbanOwner: '30000000-0000-4000-8000-000000000006',
    urbanManager: '30000000-0000-4000-8000-000000000007',
    urbanStaff: '30000000-0000-4000-8000-000000000008',
    urbanDriver: '30000000-0000-4000-8000-000000000009',
  },
  users: {
    superAdmin: '40000000-0000-4000-8000-000000000001',
    bellaAdmin: '40000000-0000-4000-8000-000000000002',
    bellaManager: '40000000-0000-4000-8000-000000000003',
    bellaStaff: '40000000-0000-4000-8000-000000000004',
    bellaDriver: '40000000-0000-4000-8000-000000000005',
    urbanAdmin: '40000000-0000-4000-8000-000000000006',
    urbanManager: '40000000-0000-4000-8000-000000000007',
    urbanStaff: '40000000-0000-4000-8000-000000000008',
    urbanDriver: '40000000-0000-4000-8000-000000000009',
  },
  memberships: {
    superAdmin: '50000000-0000-4000-8000-000000000001',
    bellaAdmin: '50000000-0000-4000-8000-000000000002',
    bellaManager: '50000000-0000-4000-8000-000000000003',
    bellaStaff: '50000000-0000-4000-8000-000000000004',
    bellaDriver: '50000000-0000-4000-8000-000000000005',
    urbanAdmin: '50000000-0000-4000-8000-000000000006',
    urbanManager: '50000000-0000-4000-8000-000000000007',
    urbanStaff: '50000000-0000-4000-8000-000000000008',
    urbanDriver: '50000000-0000-4000-8000-000000000009',
  },
  customers: {
    bellaMaya: '60000000-0000-4000-8000-000000000001',
    bellaNoah: '60000000-0000-4000-8000-000000000002',
    urbanAmelia: '60000000-0000-4000-8000-000000000003',
  },
  suppliers: {
    freshFarm: '70000000-0000-4000-8000-000000000001',
    bakeryDirect: '70000000-0000-4000-8000-000000000002',
    northProduce: '70000000-0000-4000-8000-000000000003',
  },
  categories: {
    bellaMains: '80000000-0000-4000-8000-000000000001',
    bellaDrinks: '80000000-0000-4000-8000-000000000002',
    urbanBowls: '80000000-0000-4000-8000-000000000003',
    urbanDrinks: '80000000-0000-4000-8000-000000000004',
  },
  products: {
    bellaMargherita: '90000000-0000-4000-8000-000000000001',
    bellaTiramisu: '90000000-0000-4000-8000-000000000002',
    bellaLemonade: '90000000-0000-4000-8000-000000000003',
    urbanProteinBowl: '90000000-0000-4000-8000-000000000004',
    urbanFalafelWrap: '90000000-0000-4000-8000-000000000005',
    urbanIcedTea: '90000000-0000-4000-8000-000000000006',
  },
  bundles: {
    bellaLunch: 'a0000000-0000-4000-8000-000000000001',
    urbanMealDeal: 'a0000000-0000-4000-8000-000000000002',
  },
  supplierItems: {
    freshFarmMozzarella: 'b0000000-0000-4000-8000-000000000001',
    bakeryTiramisu: 'b0000000-0000-4000-8000-000000000002',
    northQuinoa: 'b0000000-0000-4000-8000-000000000003',
  },
  stockItems: {
    bellaMozzarellaSoho: 'c0000000-0000-4000-8000-000000000001',
    bellaTiramisuSoho: 'c0000000-0000-4000-8000-000000000002',
    bellaLemonadeCanary: 'c0000000-0000-4000-8000-000000000003',
    urbanQuinoaManchester: 'c0000000-0000-4000-8000-000000000004',
    urbanIcedTeaManchester: 'c0000000-0000-4000-8000-000000000005',
  },
  orders: {
    bellaDelivery: 'd0000000-0000-4000-8000-000000000001',
    urbanPickup: 'd0000000-0000-4000-8000-000000000002',
  },
  orderItems: {
    bellaPizza: 'e0000000-0000-4000-8000-000000000001',
    bellaDrink: 'e0000000-0000-4000-8000-000000000002',
    urbanBowl: 'e0000000-0000-4000-8000-000000000003',
  },
  payments: {
    bellaCard: 'f0000000-0000-4000-8000-000000000001',
    urbanCard: 'f0000000-0000-4000-8000-000000000002',
  },
  refunds: {
    urbanPartial: '11000000-0000-4000-8000-000000000001',
  },
  loyaltyTransactions: {
    bellaEarn: '12000000-0000-4000-8000-000000000001',
    urbanRefundAdjust: '12000000-0000-4000-8000-000000000002',
  },
  drivers: {
    bellaRavi: '13000000-0000-4000-8000-000000000001',
    urbanSam: '13000000-0000-4000-8000-000000000002',
  },
  deliveryTasks: {
    bellaDelivery: '14000000-0000-4000-8000-000000000001',
    urbanPickupReady: '14000000-0000-4000-8000-000000000002',
  },
  routingDecisions: {
    bellaRoute: '15000000-0000-4000-8000-000000000001',
    urbanRoute: '15000000-0000-4000-8000-000000000002',
  },
  purchaseOrders: {
    bellaFreshFarm: '16000000-0000-4000-8000-000000000001',
    urbanNorthProduce: '16000000-0000-4000-8000-000000000002',
  },
  replenishmentRules: {
    bellaMozzarella: '17000000-0000-4000-8000-000000000001',
    urbanQuinoa: '17000000-0000-4000-8000-000000000002',
  },
  replenishmentActions: {
    bellaMozzarellaPo: '18000000-0000-4000-8000-000000000001',
    urbanQuinoaPo: '18000000-0000-4000-8000-000000000002',
  },
  forecastSnapshots: {
    bellaDemand: '19000000-0000-4000-8000-000000000001',
    urbanInventory: '19000000-0000-4000-8000-000000000002',
  },
};

const ordellaSeed: {
  tenants: Array<Record<string, unknown>>;
  tenantOnboarding: Array<Record<string, unknown>>;
  locations: Array<Record<string, unknown>>;
  users: UserSeed[];
  roles: Array<Record<string, unknown>>;
  tenantMemberships: Array<Record<string, unknown>>;
  customers: Array<Record<string, unknown>>;
  suppliers: SupplierSeed[];
  categories: Array<Record<string, unknown>>;
  products: Array<Record<string, unknown>>;
  bundles: Array<Record<string, unknown>>;
  supplierItems: Array<Record<string, unknown>>;
  stockItems: Array<Record<string, unknown>>;
  orders: Array<Record<string, unknown>>;
  orderItems: Array<Record<string, unknown>>;
  payments: Array<Record<string, unknown>>;
  refunds: Array<Record<string, unknown>>;
  loyaltyTransactions: Array<Record<string, unknown>>;
  drivers: Array<Record<string, unknown>>;
  deliveryTasks: Array<Record<string, unknown>>;
  routingDecisions: Array<Record<string, unknown>>;
  purchaseOrders: Array<Record<string, unknown>>;
  replenishmentRules: Array<Record<string, unknown>>;
  replenishmentActions: Array<Record<string, unknown>>;
  forecastSnapshots: Array<Record<string, unknown>>;
} = {
  tenants: [
    {
      id: ids.tenants.platform,
      name: 'Ordella Platform',
      status: 'active',
      slug: 'ordella-platform',
      subdomain: 'platform',
      parentTenantId: null,
      tenantType: 'hq',
      brandGroupId: null,
      brandName: 'Ordella',
      brandLogo: null,
      brandThemeId: null,
    },
    {
      id: ids.tenants.bella,
      name: 'Bella Kitchen',
      status: 'active',
      slug: 'bella-kitchen',
      subdomain: 'bella',
      parentTenantId: null,
      tenantType: 'single-location',
      brandGroupId: null,
      brandName: 'Bella Kitchen',
      brandLogo: null,
      brandThemeId: null,
    },
    {
      id: ids.tenants.urban,
      name: 'Urban Bowl Co.',
      status: 'active',
      slug: 'urban-bowl-co',
      subdomain: 'urban-bowl',
      parentTenantId: null,
      tenantType: 'single-location',
      brandGroupId: null,
      brandName: 'Urban Bowl Co.',
      brandLogo: null,
      brandThemeId: null,
    },
  ],
  tenantOnboarding: [
    ids.tenants.platform,
    ids.tenants.bella,
    ids.tenants.urban,
  ].map((tenantId) => ({
    tenantId,
    currentStep: OnboardingStep.COMPLETED,
    completedSteps: ONBOARDING_WIZARD_STEP_ORDER,
    isComplete: true,
    completedAt: new Date('2026-05-26T00:00:00.000Z'),
  })),
  locations: [
    {
      id: ids.locations.bellaSoho,
      tenantId: ids.tenants.bella,
      storeId: null,
      name: 'Bella Kitchen Soho',
      address: '41 Dean Street, London W1D 4PY',
      timezone: 'Europe/London',
      status: 'open',
      locationType: 'store',
      fulfillmentMode: 'storefront',
      deliveryZones: [{ postcodePrefix: 'W1', radiusMiles: 3 }],
      routingPriority: 10,
      fulfillmentCapacity: 35,
      supportsDelivery: true,
      supportsPickup: true,
    },
    {
      id: ids.locations.bellaCanaryWharf,
      tenantId: ids.tenants.bella,
      storeId: null,
      name: 'Bella Kitchen Canary Wharf',
      address: '2 Montgomery Square, London E14 5JJ',
      timezone: 'Europe/London',
      status: 'busy',
      locationType: 'dark_store',
      fulfillmentMode: 'dark_store',
      deliveryZones: [{ postcodePrefix: 'E14', radiusMiles: 4 }],
      routingPriority: 20,
      fulfillmentCapacity: 50,
      supportsDelivery: true,
      supportsPickup: false,
    },
    {
      id: ids.locations.urbanManchester,
      tenantId: ids.tenants.urban,
      storeId: null,
      name: 'Urban Bowl Manchester',
      address: '18 King Street, Manchester M2 6AG',
      timezone: 'Europe/London',
      status: 'open',
      locationType: 'store',
      fulfillmentMode: 'pos',
      deliveryZones: [{ postcodePrefix: 'M2', radiusMiles: 5 }],
      routingPriority: 15,
      fulfillmentCapacity: 30,
      supportsDelivery: true,
      supportsPickup: true,
    },
  ],
  users: [
    {
      id: ids.users.superAdmin,
      tenantId: ids.tenants.platform,
      name: 'Sofia Platform',
      email: 'super.admin@ordella.test',
      phone: '+447700900001',
      password: 'OrdellaDemo!2026',
      roleId: ids.roles.platformSuperAdmin,
      credentialGroup: 'Super admin',
    },
    {
      id: ids.users.bellaAdmin,
      tenantId: ids.tenants.bella,
      name: 'Amara Rossi',
      email: 'admin@bella-kitchen.test',
      phone: '+447700900101',
      password: 'BellaAdmin!2026',
      roleId: ids.roles.bellaOwner,
      credentialGroup: 'Tenant admin',
    },
    {
      id: ids.users.bellaManager,
      tenantId: ids.tenants.bella,
      name: 'Leo Marino',
      email: 'manager@bella-kitchen.test',
      phone: '+447700900102',
      password: 'BellaManager!2026',
      roleId: ids.roles.bellaManager,
      credentialGroup: 'Manager',
    },
    {
      id: ids.users.bellaStaff,
      tenantId: ids.tenants.bella,
      name: 'Nina Patel',
      email: 'staff@bella-kitchen.test',
      phone: '+447700900103',
      password: 'BellaStaff!2026',
      roleId: ids.roles.bellaStaff,
      credentialGroup: 'Staff',
    },
    {
      id: ids.users.bellaDriver,
      tenantId: ids.tenants.bella,
      name: 'Ravi Singh',
      email: 'driver@bella-kitchen.test',
      phone: '+447700900104',
      password: 'BellaDriver!2026',
      roleId: ids.roles.bellaDriver,
      credentialGroup: 'Driver',
    },
    {
      id: ids.users.urbanAdmin,
      tenantId: ids.tenants.urban,
      name: 'Maya Green',
      email: 'admin@urban-bowl.test',
      phone: '+447700900201',
      password: 'UrbanAdmin!2026',
      roleId: ids.roles.urbanOwner,
      credentialGroup: 'Tenant admin',
    },
    {
      id: ids.users.urbanManager,
      tenantId: ids.tenants.urban,
      name: 'Owen Clarke',
      email: 'manager@urban-bowl.test',
      phone: '+447700900202',
      password: 'UrbanManager!2026',
      roleId: ids.roles.urbanManager,
      credentialGroup: 'Manager',
    },
    {
      id: ids.users.urbanStaff,
      tenantId: ids.tenants.urban,
      name: 'Priya Shah',
      email: 'staff@urban-bowl.test',
      phone: '+447700900203',
      password: 'UrbanStaff!2026',
      roleId: ids.roles.urbanStaff,
      credentialGroup: 'Staff',
    },
    {
      id: ids.users.urbanDriver,
      tenantId: ids.tenants.urban,
      name: 'Sam Taylor',
      email: 'driver@urban-bowl.test',
      phone: '+447700900204',
      password: 'UrbanDriver!2026',
      roleId: ids.roles.urbanDriver,
      credentialGroup: 'Driver',
    },
  ],
  roles: [
    {
      id: ids.roles.platformSuperAdmin,
      tenantId: ids.tenants.platform,
      name: 'super_admin',
      description: 'Full Ordella platform administration',
    },
    {
      id: ids.roles.bellaOwner,
      tenantId: ids.tenants.bella,
      name: 'owner',
      description: 'Bella Kitchen tenant administrator',
    },
    {
      id: ids.roles.bellaManager,
      tenantId: ids.tenants.bella,
      name: 'manager',
      description: 'Bella Kitchen store manager',
    },
    {
      id: ids.roles.bellaStaff,
      tenantId: ids.tenants.bella,
      name: 'staff',
      description: 'Bella Kitchen POS and KDS staff',
    },
    {
      id: ids.roles.bellaDriver,
      tenantId: ids.tenants.bella,
      name: 'driver',
      description: 'Bella Kitchen delivery driver',
    },
    {
      id: ids.roles.urbanOwner,
      tenantId: ids.tenants.urban,
      name: 'owner',
      description: 'Urban Bowl Co. tenant administrator',
    },
    {
      id: ids.roles.urbanManager,
      tenantId: ids.tenants.urban,
      name: 'manager',
      description: 'Urban Bowl Co. store manager',
    },
    {
      id: ids.roles.urbanStaff,
      tenantId: ids.tenants.urban,
      name: 'staff',
      description: 'Urban Bowl Co. POS and KDS staff',
    },
    {
      id: ids.roles.urbanDriver,
      tenantId: ids.tenants.urban,
      name: 'driver',
      description: 'Urban Bowl Co. delivery driver',
    },
  ],
  tenantMemberships: [
    {
      id: ids.memberships.superAdmin,
      tenantId: ids.tenants.platform,
      userId: ids.users.superAdmin,
      roleId: ids.roles.platformSuperAdmin,
      isActive: true,
    },
    {
      id: ids.memberships.bellaAdmin,
      tenantId: ids.tenants.bella,
      userId: ids.users.bellaAdmin,
      roleId: ids.roles.bellaOwner,
      isActive: true,
    },
    {
      id: ids.memberships.bellaManager,
      tenantId: ids.tenants.bella,
      userId: ids.users.bellaManager,
      roleId: ids.roles.bellaManager,
      isActive: true,
    },
    {
      id: ids.memberships.bellaStaff,
      tenantId: ids.tenants.bella,
      userId: ids.users.bellaStaff,
      roleId: ids.roles.bellaStaff,
      isActive: true,
    },
    {
      id: ids.memberships.bellaDriver,
      tenantId: ids.tenants.bella,
      userId: ids.users.bellaDriver,
      roleId: ids.roles.bellaDriver,
      isActive: true,
    },
    {
      id: ids.memberships.urbanAdmin,
      tenantId: ids.tenants.urban,
      userId: ids.users.urbanAdmin,
      roleId: ids.roles.urbanOwner,
      isActive: true,
    },
    {
      id: ids.memberships.urbanManager,
      tenantId: ids.tenants.urban,
      userId: ids.users.urbanManager,
      roleId: ids.roles.urbanManager,
      isActive: true,
    },
    {
      id: ids.memberships.urbanStaff,
      tenantId: ids.tenants.urban,
      userId: ids.users.urbanStaff,
      roleId: ids.roles.urbanStaff,
      isActive: true,
    },
    {
      id: ids.memberships.urbanDriver,
      tenantId: ids.tenants.urban,
      userId: ids.users.urbanDriver,
      roleId: ids.roles.urbanDriver,
      isActive: true,
    },
  ],
  customers: [
    {
      id: ids.customers.bellaMaya,
      tenantId: ids.tenants.bella,
      name: 'Maya Thompson',
      email: 'maya.thompson@example.test',
      phone: '+447700910101',
      passwordHash: null,
      pointsBalance: 180,
      storeCreditBalance: '0.00',
      defaultAddressId: null,
      lifetimeValue: '248.80',
      totalOrders: 12,
      avgOrderValue: '20.73',
      firstOrderAt: new Date('2026-04-05T18:30:00.000Z'),
      lastOrderAt: new Date('2026-05-24T19:15:00.000Z'),
      preferredLocationId: ids.locations.bellaSoho,
      tags: ['vip', 'delivery'],
      segments: ['frequent-diners'],
      staffNotes: 'Prefers contactless delivery.',
      lastLoginAt: null,
      marketingEmailOptIn: true,
      marketingSmsOptIn: false,
    },
    {
      id: ids.customers.bellaNoah,
      tenantId: ids.tenants.bella,
      name: 'Noah Wilson',
      email: 'noah.wilson@example.test',
      phone: '+447700910102',
      passwordHash: null,
      pointsBalance: 40,
      storeCreditBalance: '5.00',
      defaultAddressId: null,
      lifetimeValue: '62.40',
      totalOrders: 3,
      avgOrderValue: '20.80',
      firstOrderAt: new Date('2026-05-01T12:10:00.000Z'),
      lastOrderAt: new Date('2026-05-22T12:45:00.000Z'),
      preferredLocationId: ids.locations.bellaCanaryWharf,
      tags: ['pickup'],
      segments: ['lunch'],
      staffNotes: null,
      lastLoginAt: null,
      marketingEmailOptIn: true,
      marketingSmsOptIn: true,
    },
    {
      id: ids.customers.urbanAmelia,
      tenantId: ids.tenants.urban,
      name: 'Amelia Brooks',
      email: 'amelia.brooks@example.test',
      phone: '+447700910201',
      passwordHash: null,
      pointsBalance: 95,
      storeCreditBalance: '0.00',
      defaultAddressId: null,
      lifetimeValue: '136.50',
      totalOrders: 7,
      avgOrderValue: '19.50',
      firstOrderAt: new Date('2026-03-20T13:00:00.000Z'),
      lastOrderAt: new Date('2026-05-25T13:20:00.000Z'),
      preferredLocationId: ids.locations.urbanManchester,
      tags: ['office-catering'],
      segments: ['weekday-lunch'],
      staffNotes: 'Usually orders before noon.',
      lastLoginAt: null,
      marketingEmailOptIn: true,
      marketingSmsOptIn: false,
    },
  ],
  suppliers: [
    {
      id: ids.suppliers.freshFarm,
      tenantId: ids.tenants.bella,
      name: 'Fresh Farm Foods',
      contactName: 'Elena Wood',
      email: 'orders@freshfarmfoods.test',
      phone: '+442071110001',
      address: 'Unit 4, Market Yard, London',
      notes: 'Primary produce and dairy supplier.',
      portalUserEmail: 'supplier@freshfarmfoods.test',
      portalPassword: 'FreshFarm!2026',
    },
    {
      id: ids.suppliers.bakeryDirect,
      tenantId: ids.tenants.bella,
      name: 'Bakery Direct',
      contactName: 'Marco Bell',
      email: 'orders@bakerydirect.test',
      phone: '+442071110002',
      address: '12 Baker Lane, London',
      notes: 'Desserts and fresh baked goods.',
      portalUserEmail: 'supplier@bakerydirect.test',
      portalPassword: 'BakeryDirect!2026',
    },
    {
      id: ids.suppliers.northProduce,
      tenantId: ids.tenants.urban,
      name: 'North Produce Co.',
      contactName: 'Grace Moore',
      email: 'orders@northproduce.test',
      phone: '+441611110003',
      address: '88 Deansgate, Manchester',
      notes: 'Bulk grains, salads, and drinks.',
      portalUserEmail: 'supplier@northproduce.test',
      portalPassword: 'NorthProduce!2026',
    },
  ],
  categories: [
    {
      id: ids.categories.bellaMains,
      tenantId: ids.tenants.bella,
      name: 'Mains',
      description: 'Pizza, pasta, and house favourites',
      sortOrder: 10,
      isActive: true,
      globalCategoryId: null,
    },
    {
      id: ids.categories.bellaDrinks,
      tenantId: ids.tenants.bella,
      name: 'Drinks',
      description: 'Soft drinks and seasonal specials',
      sortOrder: 20,
      isActive: true,
      globalCategoryId: null,
    },
    {
      id: ids.categories.urbanBowls,
      tenantId: ids.tenants.urban,
      name: 'Bowls & Wraps',
      description: 'Fresh bowls, wraps, and proteins',
      sortOrder: 10,
      isActive: true,
      globalCategoryId: null,
    },
    {
      id: ids.categories.urbanDrinks,
      tenantId: ids.tenants.urban,
      name: 'Drinks',
      description: 'Iced teas, juices, and water',
      sortOrder: 20,
      isActive: true,
      globalCategoryId: null,
    },
  ],
  products: [
    {
      id: ids.products.bellaMargherita,
      tenantId: ids.tenants.bella,
      name: 'Margherita Pizza',
      description: 'San Marzano tomato, mozzarella, and basil',
      categoryId: ids.categories.bellaMains,
      price: '12.50',
      status: 'active',
      sortOrder: 10,
      channelVisibility: { pos: true, online: true, whatsapp: true },
      sku: 'BEL-MAR-PIZZA',
      barcode: '500000000001',
      imageUrl: null,
      inventoryTrackingEnabled: true,
      stockLevel: 48,
      taxCategoryId: null,
      globalItemId: null,
      overridePrice: null,
      overrideName: null,
      overrideDescription: null,
      overrideAttributes: {},
    },
    {
      id: ids.products.bellaTiramisu,
      tenantId: ids.tenants.bella,
      name: 'Classic Tiramisu',
      description: 'Espresso-soaked sponge with mascarpone cream',
      categoryId: ids.categories.bellaMains,
      price: '6.20',
      status: 'active',
      sortOrder: 20,
      channelVisibility: { pos: true, online: true, whatsapp: true },
      sku: 'BEL-TIRAMISU',
      barcode: '500000000002',
      imageUrl: null,
      inventoryTrackingEnabled: true,
      stockLevel: 22,
      taxCategoryId: null,
      globalItemId: null,
      overridePrice: null,
      overrideName: null,
      overrideDescription: null,
      overrideAttributes: {},
    },
    {
      id: ids.products.bellaLemonade,
      tenantId: ids.tenants.bella,
      name: 'Sicilian Lemonade',
      description: 'Sparkling lemon and mint',
      categoryId: ids.categories.bellaDrinks,
      price: '3.40',
      status: 'active',
      sortOrder: 30,
      channelVisibility: { pos: true, online: true, whatsapp: false },
      sku: 'BEL-LEMONADE',
      barcode: '500000000003',
      imageUrl: null,
      inventoryTrackingEnabled: true,
      stockLevel: 60,
      taxCategoryId: null,
      globalItemId: null,
      overridePrice: null,
      overrideName: null,
      overrideDescription: null,
      overrideAttributes: {},
    },
    {
      id: ids.products.urbanProteinBowl,
      tenantId: ids.tenants.urban,
      name: 'Green Protein Bowl',
      description: 'Quinoa, greens, roasted veg, and tahini dressing',
      categoryId: ids.categories.urbanBowls,
      price: '10.90',
      status: 'active',
      sortOrder: 10,
      channelVisibility: { pos: true, online: true, whatsapp: true },
      sku: 'URB-GREEN-BOWL',
      barcode: '510000000001',
      imageUrl: null,
      inventoryTrackingEnabled: true,
      stockLevel: 35,
      taxCategoryId: null,
      globalItemId: null,
      overridePrice: null,
      overrideName: null,
      overrideDescription: null,
      overrideAttributes: {},
    },
    {
      id: ids.products.urbanFalafelWrap,
      tenantId: ids.tenants.urban,
      name: 'Falafel Wrap',
      description: 'Herb falafel, pickles, salad, and garlic sauce',
      categoryId: ids.categories.urbanBowls,
      price: '8.70',
      status: 'active',
      sortOrder: 20,
      channelVisibility: { pos: true, online: true, whatsapp: true },
      sku: 'URB-FALAFEL-WRAP',
      barcode: '510000000002',
      imageUrl: null,
      inventoryTrackingEnabled: true,
      stockLevel: 42,
      taxCategoryId: null,
      globalItemId: null,
      overridePrice: null,
      overrideName: null,
      overrideDescription: null,
      overrideAttributes: {},
    },
    {
      id: ids.products.urbanIcedTea,
      tenantId: ids.tenants.urban,
      name: 'Peach Iced Tea',
      description: 'House brewed black tea with peach',
      categoryId: ids.categories.urbanDrinks,
      price: '3.10',
      status: 'active',
      sortOrder: 30,
      channelVisibility: { pos: true, online: true, whatsapp: false },
      sku: 'URB-ICED-TEA',
      barcode: '510000000003',
      imageUrl: null,
      inventoryTrackingEnabled: true,
      stockLevel: 58,
      taxCategoryId: null,
      globalItemId: null,
      overridePrice: null,
      overrideName: null,
      overrideDescription: null,
      overrideAttributes: {},
    },
  ],
  bundles: [
    {
      id: ids.bundles.bellaLunch,
      tenantId: ids.tenants.bella,
      locationId: ids.locations.bellaSoho,
      name: 'Bella Lunch Duo',
      description: 'Pizza and drink lunch offer',
      priceType: 'fixed',
      fixedPrice: '14.50',
      discountAmount: null,
      discountPercent: null,
      isActive: true,
    },
    {
      id: ids.bundles.urbanMealDeal,
      tenantId: ids.tenants.urban,
      locationId: ids.locations.urbanManchester,
      name: 'Urban Meal Deal',
      description: 'Bowl or wrap with a drink',
      priceType: 'discounted',
      fixedPrice: null,
      discountAmount: '1.50',
      discountPercent: null,
      isActive: true,
    },
  ],
  supplierItems: [
    {
      id: ids.supplierItems.freshFarmMozzarella,
      supplierId: ids.suppliers.freshFarm,
      itemId: ids.products.bellaMargherita,
      costPrice: '4.10',
      sku: 'FF-MOZZ-PIZZA-KIT',
      leadTimeDays: 2,
      minOrderQty: 12,
    },
    {
      id: ids.supplierItems.bakeryTiramisu,
      supplierId: ids.suppliers.bakeryDirect,
      itemId: ids.products.bellaTiramisu,
      costPrice: '2.30',
      sku: 'BD-TIRAMISU-TRAY',
      leadTimeDays: 1,
      minOrderQty: 8,
    },
    {
      id: ids.supplierItems.northQuinoa,
      supplierId: ids.suppliers.northProduce,
      itemId: ids.products.urbanProteinBowl,
      costPrice: '3.25',
      sku: 'NP-QUINOA-BOWL-KIT',
      leadTimeDays: 3,
      minOrderQty: 10,
    },
  ],
  stockItems: [
    {
      id: ids.stockItems.bellaMozzarellaSoho,
      tenantId: ids.tenants.bella,
      locationId: ids.locations.bellaSoho,
      name: 'Margherita Pizza Kit',
      sku: 'BEL-MAR-PIZZA',
      unit: 'each',
      quantityOnHand: '48.0000',
      quantityReserved: '6.0000',
      productId: ids.products.bellaMargherita,
      reorderLevel: '20.0000',
      syncSource: 'store',
      lastSyncedAt: new Date('2026-05-25T08:00:00.000Z'),
      safetyStockLevel: '15.0000',
      reorderPoint: '20.0000',
      isActive: true,
      lastReceivedAt: new Date('2026-05-24T09:00:00.000Z'),
    },
    {
      id: ids.stockItems.bellaTiramisuSoho,
      tenantId: ids.tenants.bella,
      locationId: ids.locations.bellaSoho,
      name: 'Classic Tiramisu',
      sku: 'BEL-TIRAMISU',
      unit: 'each',
      quantityOnHand: '22.0000',
      quantityReserved: '2.0000',
      productId: ids.products.bellaTiramisu,
      reorderLevel: '12.0000',
      syncSource: 'store',
      lastSyncedAt: new Date('2026-05-25T08:00:00.000Z'),
      safetyStockLevel: '8.0000',
      reorderPoint: '12.0000',
      isActive: true,
      lastReceivedAt: new Date('2026-05-23T09:00:00.000Z'),
    },
    {
      id: ids.stockItems.bellaLemonadeCanary,
      tenantId: ids.tenants.bella,
      locationId: ids.locations.bellaCanaryWharf,
      name: 'Sicilian Lemonade',
      sku: 'BEL-LEMONADE',
      unit: 'bottle',
      quantityOnHand: '60.0000',
      quantityReserved: '4.0000',
      productId: ids.products.bellaLemonade,
      reorderLevel: '24.0000',
      syncSource: 'warehouse',
      lastSyncedAt: new Date('2026-05-25T08:00:00.000Z'),
      safetyStockLevel: '18.0000',
      reorderPoint: '24.0000',
      isActive: true,
      lastReceivedAt: new Date('2026-05-24T11:30:00.000Z'),
    },
    {
      id: ids.stockItems.urbanQuinoaManchester,
      tenantId: ids.tenants.urban,
      locationId: ids.locations.urbanManchester,
      name: 'Green Protein Bowl Kit',
      sku: 'URB-GREEN-BOWL',
      unit: 'each',
      quantityOnHand: '35.0000',
      quantityReserved: '5.0000',
      productId: ids.products.urbanProteinBowl,
      reorderLevel: '18.0000',
      syncSource: 'store',
      lastSyncedAt: new Date('2026-05-25T08:00:00.000Z'),
      safetyStockLevel: '12.0000',
      reorderPoint: '18.0000',
      isActive: true,
      lastReceivedAt: new Date('2026-05-24T10:00:00.000Z'),
    },
    {
      id: ids.stockItems.urbanIcedTeaManchester,
      tenantId: ids.tenants.urban,
      locationId: ids.locations.urbanManchester,
      name: 'Peach Iced Tea',
      sku: 'URB-ICED-TEA',
      unit: 'bottle',
      quantityOnHand: '58.0000',
      quantityReserved: '3.0000',
      productId: ids.products.urbanIcedTea,
      reorderLevel: '20.0000',
      syncSource: 'store',
      lastSyncedAt: new Date('2026-05-25T08:00:00.000Z'),
      safetyStockLevel: '14.0000',
      reorderPoint: '20.0000',
      isActive: true,
      lastReceivedAt: new Date('2026-05-23T15:00:00.000Z'),
    },
  ],
  orders: [
    {
      id: ids.orders.bellaDelivery,
      tenantId: ids.tenants.bella,
      locationId: ids.locations.bellaSoho,
      customerId: ids.customers.bellaMaya,
      orderType: 'delivery',
      status: 'out_for_delivery',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      subtotal: '15.90',
      tax: '0.00',
      total: '18.40',
      discountTotal: '1.00',
      promotionIds: [],
      appliedPromotions: [{ promotionId: 'demo-lunch-offer', code: 'LUNCH', discountAmount: '1.00' }],
      orderNumber: 'BEL-1001',
      deliveryDetails: {
        address: '12 Greek Street, London W1D 4DL',
        notes: 'Leave with reception.',
        deliveryFee: '2.50',
      },
    },
    {
      id: ids.orders.urbanPickup,
      tenantId: ids.tenants.urban,
      locationId: ids.locations.urbanManchester,
      customerId: ids.customers.urbanAmelia,
      orderType: 'pickup',
      status: 'completed',
      paymentStatus: 'refunded',
      paymentMethod: 'card',
      subtotal: '10.90',
      tax: '0.00',
      total: '10.90',
      discountTotal: '0.00',
      promotionIds: [],
      appliedPromotions: [],
      orderNumber: 'URB-2001',
      deliveryDetails: null,
    },
  ],
  orderItems: [
    {
      id: ids.orderItems.bellaPizza,
      orderId: ids.orders.bellaDelivery,
      productId: ids.products.bellaMargherita,
      variantId: null,
      bundleId: ids.bundles.bellaLunch,
      quantity: 1,
      price: '12.50',
      taxCategoryId: null,
      notes: 'Extra basil',
    },
    {
      id: ids.orderItems.bellaDrink,
      orderId: ids.orders.bellaDelivery,
      productId: ids.products.bellaLemonade,
      variantId: null,
      bundleId: ids.bundles.bellaLunch,
      quantity: 1,
      price: '3.40',
      taxCategoryId: null,
      notes: null,
    },
    {
      id: ids.orderItems.urbanBowl,
      orderId: ids.orders.urbanPickup,
      productId: ids.products.urbanProteinBowl,
      variantId: null,
      bundleId: null,
      quantity: 1,
      price: '10.90',
      taxCategoryId: null,
      notes: 'Dressing on the side',
    },
  ],
  payments: [
    {
      id: ids.payments.bellaCard,
      tenantId: ids.tenants.bella,
      orderId: ids.orders.bellaDelivery,
      provider: 'stripe',
      method: 'card',
      amount: '18.40',
      currency: 'GBP',
      status: 'captured',
      providerPaymentId: 'pi_ordella_demo_bella_1001',
      metadata: { cardBrand: 'visa', last4: '4242' },
      paymentMethodId: null,
    },
    {
      id: ids.payments.urbanCard,
      tenantId: ids.tenants.urban,
      orderId: ids.orders.urbanPickup,
      provider: 'stripe',
      method: 'card',
      amount: '10.90',
      currency: 'GBP',
      status: 'partially_refunded',
      providerPaymentId: 'pi_ordella_demo_urban_2001',
      metadata: { cardBrand: 'mastercard', last4: '5555' },
      paymentMethodId: null,
    },
  ],
  refunds: [
    {
      id: ids.refunds.urbanPartial,
      paymentId: ids.payments.urbanCard,
      amount: '4.00',
      reason: 'Customer reported missing drink',
      status: 'succeeded',
      providerRefundId: 're_ordella_demo_urban_2001',
    },
  ],
  loyaltyTransactions: [
    {
      id: ids.loyaltyTransactions.bellaEarn,
      tenantId: ids.tenants.bella,
      customerId: ids.customers.bellaMaya,
      points: 18,
      type: 'earn',
      orderId: ids.orders.bellaDelivery,
    },
    {
      id: ids.loyaltyTransactions.urbanRefundAdjust,
      tenantId: ids.tenants.urban,
      customerId: ids.customers.urbanAmelia,
      points: -4,
      type: 'adjustment',
      orderId: ids.orders.urbanPickup,
    },
  ],
  drivers: [
    {
      id: ids.drivers.bellaRavi,
      tenantId: ids.tenants.bella,
      userId: ids.users.bellaDriver,
      name: 'Ravi Singh',
      phone: '+447700900104',
      status: 'on_delivery',
      active: true,
      vehicleType: 'bike',
    },
    {
      id: ids.drivers.urbanSam,
      tenantId: ids.tenants.urban,
      userId: ids.users.urbanDriver,
      name: 'Sam Taylor',
      phone: '+447700900204',
      status: 'active',
      active: true,
      vehicleType: 'scooter',
    },
  ],
  deliveryTasks: [
    {
      id: ids.deliveryTasks.bellaDelivery,
      tenantId: ids.tenants.bella,
      orderId: ids.orders.bellaDelivery,
      driverId: ids.drivers.bellaRavi,
      status: 'en_route',
      eta: new Date('2026-05-26T12:35:00.000Z'),
      startedAt: new Date('2026-05-26T12:05:00.000Z'),
      completedAt: null,
      deliveryFee: '2.50',
      notes: 'Reception drop-off.',
      metadata: { route: 'soho-loop', distanceMiles: 1.8 },
    },
    {
      id: ids.deliveryTasks.urbanPickupReady,
      tenantId: ids.tenants.urban,
      orderId: ids.orders.urbanPickup,
      driverId: null,
      status: 'delivered',
      eta: null,
      startedAt: new Date('2026-05-25T13:05:00.000Z'),
      completedAt: new Date('2026-05-25T13:18:00.000Z'),
      deliveryFee: null,
      notes: 'Pickup completed at counter.',
      metadata: { pickupShelf: 'A2' },
    },
  ],
  routingDecisions: [
    {
      id: ids.routingDecisions.bellaRoute,
      tenantId: ids.tenants.bella,
      orderId: ids.orders.bellaDelivery,
      fromLocationId: ids.locations.bellaCanaryWharf,
      toLocationId: ids.locations.bellaSoho,
      reason: 'Soho has nearest driver and sufficient pizza inventory.',
      estimatedDeliveryMinutes: 28,
      fallbackOptions: [
        {
          locationId: ids.locations.bellaCanaryWharf,
          reason: 'Higher capacity but longer travel time',
        },
      ],
      inputSnapshot: {
        orderTotal: '18.40',
        requestedFulfillment: 'delivery',
        postcode: 'W1D',
      },
    },
    {
      id: ids.routingDecisions.urbanRoute,
      tenantId: ids.tenants.urban,
      orderId: ids.orders.urbanPickup,
      fromLocationId: null,
      toLocationId: ids.locations.urbanManchester,
      reason: 'Only active Urban Bowl location for customer pickup.',
      estimatedDeliveryMinutes: null,
      fallbackOptions: [],
      inputSnapshot: {
        orderTotal: '10.90',
        requestedFulfillment: 'pickup',
      },
    },
  ],
  purchaseOrders: [
    {
      id: ids.purchaseOrders.bellaFreshFarm,
      tenantId: ids.tenants.bella,
      supplierId: ids.suppliers.freshFarm,
      locationId: ids.locations.bellaSoho,
      status: 'sent',
      supplierStatus: 'confirmed',
      totalCost: '184.50',
      expectedDeliveryDate: '2026-05-28',
      supplierExpectedDeliveryDate: '2026-05-28',
      supplierNotes: 'Morning delivery confirmed.',
      sentAt: new Date('2026-05-25T09:30:00.000Z'),
      receivedAt: null,
    },
    {
      id: ids.purchaseOrders.urbanNorthProduce,
      tenantId: ids.tenants.urban,
      supplierId: ids.suppliers.northProduce,
      locationId: ids.locations.urbanManchester,
      status: 'draft',
      supplierStatus: 'pending',
      totalCost: '96.00',
      expectedDeliveryDate: '2026-05-29',
      supplierExpectedDeliveryDate: null,
      supplierNotes: null,
      sentAt: null,
      receivedAt: null,
    },
  ],
  replenishmentRules: [
    {
      id: ids.replenishmentRules.bellaMozzarella,
      tenantId: ids.tenants.bella,
      locationId: ids.locations.bellaSoho,
      itemId: ids.products.bellaMargherita,
      ruleType: 'min_max',
      minLevel: '20.0000',
      maxLevel: '80.0000',
      safetyStock: '15.0000',
      reorderMultiple: '12.0000',
      supplierId: ids.suppliers.freshFarm,
      sourceLocationId: ids.locations.bellaCanaryWharf,
      isActive: true,
    },
    {
      id: ids.replenishmentRules.urbanQuinoa,
      tenantId: ids.tenants.urban,
      locationId: ids.locations.urbanManchester,
      itemId: ids.products.urbanProteinBowl,
      ruleType: 'forecast_based',
      minLevel: '18.0000',
      maxLevel: '70.0000',
      safetyStock: '12.0000',
      reorderMultiple: '10.0000',
      supplierId: ids.suppliers.northProduce,
      sourceLocationId: null,
      isActive: true,
    },
  ],
  replenishmentActions: [
    {
      id: ids.replenishmentActions.bellaMozzarellaPo,
      tenantId: ids.tenants.bella,
      ruleId: ids.replenishmentRules.bellaMozzarella,
      locationId: ids.locations.bellaSoho,
      itemId: ids.products.bellaMargherita,
      stockItemId: ids.stockItems.bellaMozzarellaSoho,
      actionType: 'create_po',
      quantity: '36.0000',
      sourceLocationId: ids.locations.bellaCanaryWharf,
      supplierId: ids.suppliers.freshFarm,
      status: 'completed',
      purchaseOrderId: ids.purchaseOrders.bellaFreshFarm,
      stockTransferId: null,
      pickTaskId: null,
      reason: 'Projected inventory below reorder point within 48 hours.',
      metadata: { forecastDemand: 32, currentOnHand: 48 },
      error: null,
    },
    {
      id: ids.replenishmentActions.urbanQuinoaPo,
      tenantId: ids.tenants.urban,
      ruleId: ids.replenishmentRules.urbanQuinoa,
      locationId: ids.locations.urbanManchester,
      itemId: ids.products.urbanProteinBowl,
      stockItemId: ids.stockItems.urbanQuinoaManchester,
      actionType: 'create_po',
      quantity: '30.0000',
      sourceLocationId: null,
      supplierId: ids.suppliers.northProduce,
      status: 'pending',
      purchaseOrderId: ids.purchaseOrders.urbanNorthProduce,
      stockTransferId: null,
      pickTaskId: null,
      reason: 'Forecasted weekday lunch demand requires replenishment.',
      metadata: { forecastDemand: 45, currentOnHand: 35 },
      error: null,
    },
  ],
  forecastSnapshots: [
    {
      id: ids.forecastSnapshots.bellaDemand,
      tenantId: ids.tenants.bella,
      forecastType: 'demand',
      locationId: ids.locations.bellaSoho,
      horizonDays: 7,
      cacheKey: 'demo:bella:demand:2026-05-26:7',
      payload: {
        expectedOrders: 420,
        topItems: [
          { productId: ids.products.bellaMargherita, units: 160 },
          { productId: ids.products.bellaLemonade, units: 120 },
        ],
      },
      generatedForDate: '2026-05-26',
      confidence: '0.8425',
    },
    {
      id: ids.forecastSnapshots.urbanInventory,
      tenantId: ids.tenants.urban,
      forecastType: 'inventory',
      locationId: ids.locations.urbanManchester,
      horizonDays: 7,
      cacheKey: 'demo:urban:inventory:2026-05-26:7',
      payload: {
        stockRisks: [
          {
            productId: ids.products.urbanProteinBowl,
            projectedOnHand: 8,
            recommendedOrderQuantity: 30,
          },
        ],
      },
      generatedForDate: '2026-05-26',
      confidence: '0.7810',
    },
  ],
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function buildUsers() {
  return Promise.all(
    ordellaSeed.users.map(async (user) => ({
      id: user.id,
      tenantId: user.tenantId,
      name: user.name,
      email: normalizeEmail(user.email),
      phone: user.phone,
      passwordHash: await hashPassword(user.password),
      pinHash: null,
      roleId: user.roleId,
      mfaEnabled: false,
      externalId: null,
      federatedRoles: [],
      lastLoginAt: null,
      status: UserStatus.ACTIVE,
    })),
  );
}

async function buildSuppliers() {
  return Promise.all(
    ordellaSeed.suppliers.map(async (supplier) => ({
      id: supplier.id,
      tenantId: supplier.tenantId,
      name: supplier.name,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      notes: supplier.notes,
      portalUserEmail: normalizeEmail(supplier.portalUserEmail),
      portalPasswordHash: await hashPassword(supplier.portalPassword),
      lastLoginAt: null,
      isActive: true,
    })),
  );
}

function credentialSortOrder(group: CredentialGroup): number {
  return ['Super admin', 'Tenant admin', 'Manager', 'Staff', 'Driver', 'Supplier'].indexOf(group);
}

function printCredentials(): void {
  const userCredentials = ordellaSeed.users.map((user) => ({
    group: user.credentialGroup,
    name: user.name,
    tenant: tenantName(user.tenantId),
    email: normalizeEmail(user.email),
    password: user.password,
  }));
  const supplierCredentials = ordellaSeed.suppliers.map((supplier) => ({
    group: 'Supplier' as const,
    name: supplier.name,
    tenant: tenantName(supplier.tenantId),
    email: normalizeEmail(supplier.portalUserEmail),
    password: supplier.portalPassword,
  }));
  const credentials = [...userCredentials, ...supplierCredentials].sort(
    (left, right) => credentialSortOrder(left.group) - credentialSortOrder(right.group),
  );

  console.log('\nOrdella demo login credentials');
  console.log('================================');
  for (const credential of credentials) {
    console.log(
      `${credential.group}: ${credential.name} (${credential.tenant}) -> ${credential.email} / ${credential.password}`,
    );
  }
  console.log('');
}

function tenantName(tenantId: string): string {
  const tenant = ordellaSeed.tenants.find((row) => row.id === tenantId);
  return typeof tenant?.name === 'string' ? tenant.name : tenantId;
}

async function executeOrdellaSeed(): Promise<void> {
  if (!db.isInitialized) {
    await db.initialize();
  }

  const users = await buildUsers();
  const suppliers = await buildSuppliers();

  await db.transaction(async (manager) => {
    await manager.getRepository(TenantEntity).upsert(ordellaSeed.tenants, ['id']);
    await manager.getRepository(TenantOnboardingEntity).upsert(ordellaSeed.tenantOnboarding, ['tenantId']);
    await manager.getRepository(LocationEntity).upsert(ordellaSeed.locations, ['id']);

    // Users require role_id, so roles are inserted before user rows.
    await manager.getRepository(RoleEntity).upsert(ordellaSeed.roles, ['id']);
    await manager.getRepository(UserEntity).upsert(users, ['id']);
    await manager.getRepository(TenantMembershipEntity).upsert(ordellaSeed.tenantMemberships, ['id']);

    await manager.getRepository(CustomerEntity).upsert(ordellaSeed.customers, ['id']);
    await manager.getRepository(SupplierEntity).upsert(suppliers, ['id']);
    await manager.getRepository(CategoryEntity).upsert(ordellaSeed.categories, ['id']);
    await manager.getRepository(ProductEntity).upsert(ordellaSeed.products, ['id']);
    await manager.getRepository(BundleEntity).upsert(ordellaSeed.bundles, ['id']);
    await manager.getRepository(SupplierItemEntity).upsert(ordellaSeed.supplierItems, ['id']);
    await manager.getRepository(StockItemEntity).upsert(ordellaSeed.stockItems, ['id']);

    await manager.getRepository(OrderEntity).upsert(ordellaSeed.orders, ['id']);
    await manager.getRepository(OrderItemEntity).upsert(ordellaSeed.orderItems, ['id']);
    await manager.getRepository(PaymentEntity).upsert(ordellaSeed.payments, ['id']);
    await manager.getRepository(RefundEntity).upsert(ordellaSeed.refunds, ['id']);
    await manager.getRepository(LoyaltyTransactionEntity).upsert(ordellaSeed.loyaltyTransactions, ['id']);

    await manager.getRepository(DriverProfileEntity).upsert(ordellaSeed.drivers, ['id']);
    await manager.getRepository(DeliveryTaskEntity).upsert(ordellaSeed.deliveryTasks, ['id']);
    await manager.getRepository(RoutingDecisionEntity).upsert(ordellaSeed.routingDecisions, ['id']);
    await manager.getRepository(PurchaseOrderEntity).upsert(ordellaSeed.purchaseOrders, ['id']);
    await manager.getRepository(ReplenishmentRuleEntity).upsert(ordellaSeed.replenishmentRules, ['id']);
    await manager.getRepository(ReplenishmentActionEntity).upsert(ordellaSeed.replenishmentActions, ['id']);
    await manager.getRepository(ForecastSnapshotEntity).upsert(ordellaSeed.forecastSnapshots, ['id']);
  });

  printCredentials();
}

executeOrdellaSeed()
  .then(async () => {
    console.log('Ordella demo seed completed successfully.');
    await db.destroy();
  })
  .catch(async (error: unknown) => {
    console.error('Ordella demo seed failed.');
    console.error(error);
    if (db.isInitialized) {
      await db.destroy();
    }
    process.exitCode = 1;
  });
