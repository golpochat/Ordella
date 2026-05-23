# 📘 **BUNDLE 5 — API SPECIFICATION v1.0**

### **PDF‑Ready Consolidated Version (Clean Enterprise Style)**

### **Part 1 of 4**

_(Paste this into your Notion page — the final PDF will be one unified document.)_

# --

# **1. Authentication & Users API**

<details>
<summary><strong>Click to expand Section 1</strong></summary>

# **1. Authentication & Users API**

This section defines all endpoints related to authentication, session management, user accounts, roles, and permissions.

## **1.1 Authentication Overview**

The platform uses:

- **JWT tokens**
- **Short‑lived access tokens**
- **Long‑lived refresh tokens**
- **Optional MFA**
- **Role‑based access control (RBAC)**

## **1.2 POST /api/v1/auth/login**

**Request**

json

`{
  "email": "user@example.com",
  "password": "secret123"
}`

**Response**

json

`{
  "success": true,
  "data": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": 3600
  }
}`

## **1.3 POST /api/v1/auth/refresh**

Refreshes the access token.

## **1.4 POST /api/v1/auth/logout**

Invalidates the session.

## **1.5 POST /api/v1/auth/mfa/verify**

Used when MFA is enabled.

# **1.6 Users API**

### **GET /api/v1/users**

List all users.

### **POST /api/v1/users**

Create a new user.

### **GET /api/v1/users/{id}**

Retrieve a user.

### **PATCH /api/v1/users/{id}**

Update a user.

### **DELETE /api/v1/users/{id}**

Delete a user.

# **1.7 Roles & Permissions**

### **GET /api/v1/roles**

List roles.

### **POST /api/v1/roles**

Create role.

### **GET /api/v1/permissions**

List permissions.

### **POST /api/v1/roles/{id}/assign**

Assign permissions to a role.

# **1.8 Sessions API**

### **GET /api/v1/sessions**

List active sessions.

### **DELETE /api/v1/sessions/{id}**

Terminate a session.

</details>

# --

# **2. Tenants & Locations API**

<details>
<summary><strong>Click to expand Section 2</strong></summary>

# **2. Tenants & Locations API**

This section defines multi‑tenant management, location management, and configuration.

# **2.1 Tenants API**

### **GET /api/v1/tenants**

List all tenants.

### **POST /api/v1/tenants**

Create a tenant.

### **GET /api/v1/tenants/{id}**

Retrieve tenant details.

### **PATCH /api/v1/tenants/{id}**

Update tenant.

### **DELETE /api/v1/tenants/{id}**

Delete tenant.

# **2.2 Locations API**

### **GET /api/v1/locations**

List all locations.

### **POST /api/v1/locations**

Create a location.

### **GET /api/v1/locations/{id}**

Retrieve location.

### **PATCH /api/v1/locations/{id}**

Update location.

### **DELETE /api/v1/locations/{id}**

Delete location.

# **2.3 Location Settings**

### **GET /api/v1/locations/{id}/settings**

Retrieve settings.

### **PATCH /api/v1/locations/{id}/settings**

Update settings.

# **2.4 Opening Hours**

### **GET /api/v1/locations/{id}/hours**

Retrieve opening hours.

### **PATCH /api/v1/locations/{id}/hours**

Update opening hours.

# **2.5 Location Status**

### **PATCH /api/v1/locations/{id}/status**

Update status (open/closed/busy).

</details>

# --

# **3. Catalog API (Products, Variants, Modifiers, Addons)**

<details>
<summary><strong>Click to expand Section 3</strong></summary>

# **3. Catalog API**

This section defines all catalog‑related endpoints including products, variants, modifiers, and addons.

# **3.1 Products API**

### **GET /api/v1/products**

List products.

### **POST /api/v1/products**

Create product.

### **GET /api/v1/products/{id}**

Retrieve product.

### **PATCH /api/v1/products/{id}**

Update product.

### **DELETE /api/v1/products/{id}**

Delete product.

# **3.2 Variants API**

### **GET /api/v1/variants**

List variants.

### **POST /api/v1/variants**

Create variant.

### **GET /api/v1/variants/{id}**

Retrieve variant.

### **PATCH /api/v1/variants/{id}**

Update variant.

### **DELETE /api/v1/variants/{id}**

Delete variant.

# **3.3 Modifiers API**

### **GET /api/v1/modifiers**

List modifiers.

### **POST /api/v1/modifiers**

Create modifier.

### **GET /api/v1/modifiers/{id}**

Retrieve modifier.

### **PATCH /api/v1/modifiers/{id}**

Update modifier.

### **DELETE /api/v1/modifiers/{id}**

Delete modifier.

# **3.4 Addons API**

### **GET /api/v1/addons**

List addons.

### **POST /api/v1/addons**

Create addon.

### **GET /api/v1/addons/{id}**

Retrieve addon.

### **PATCH /api/v1/addons/{id}**

Update addon.

### **DELETE /api/v1/addons/{id}**

Delete addon.

# **3.5 Categories API**

### **GET /api/v1/categories**

List categories.

### **POST /api/v1/categories**

Create category.

### **GET /api/v1/categories/{id}**

Retrieve category.

### **PATCH /api/v1/categories/{id}**

Update category.

### **DELETE /api/v1/categories/{id}**

Delete category.

</details>

# --

# **4. Stock API (Items, Movements, Transfers)**

<details>
<summary><strong>Click to expand Section 4</strong></summary>

# **4. Stock API**

This section defines stock items, stock movements, and stock transfers.

# **4.1 Stock Items API**

### **GET /api/v1/stock-items**

List stock items.

### **POST /api/v1/stock-items**

Create stock item.

### **GET /api/v1/stock-items/{id}**

Retrieve stock item.

### **PATCH /api/v1/stock-items/{id}**

Update stock item.

### **DELETE /api/v1/stock-items/{id}**

Delete stock item.

# **4.2 Stock Movements API**

### **GET /api/v1/stock-movements**

List movements.

### **POST /api/v1/stock-movements**

Create movement.

### **GET /api/v1/stock-movements/{id}**

Retrieve movement.

# **4.3 Stock Transfers API**

### **GET /api/v1/stock-transfers**

List transfers.

### **POST /api/v1/stock-transfers**

Create transfer.

### **GET /api/v1/stock-transfers/{id}**

Retrieve transfer.

### **PATCH /api/v1/stock-transfers/{id}**

Update transfer.

</details>

### **Part 2 of 4**

_(Sections 5 to 9 — Orders, Payments, Delivery, Customers, Promotions)_

# --

# **5. Orders API**

<details>
<summary><strong>Click to expand Section 5</strong></summary>

# **5. Orders API**

This section defines the full order lifecycle, including order creation, items, modifiers, addons, notes, and events.

# **5.1 Orders API**

### **GET /api/v1/orders**

List all orders.

### **POST /api/v1/orders**

Create a new order.

**Request Example**

json

`{
  "customer_id": "uuid",
  "location_id": "uuid",
  "order_type": "delivery",
  "items": [
    {
      "product_id": "uuid",
      "variant_id": "uuid",
      "quantity": 2
    }
  ]
}`

### **GET /api/v1/orders/{id}**

Retrieve order details.

### **PATCH /api/v1/orders/{id}**

Update order.

### **DELETE /api/v1/orders/{id}**

Cancel order.

# **5.2 Order Items API**

### **POST /api/v1/order-items**

Add item to order.

### **PATCH /api/v1/order-items/{id}**

Update item.

### **DELETE /api/v1/order-items/{id}**

Remove item.

# **5.3 Order Item Modifiers**

### **POST /api/v1/order-item-modifiers**

Add modifier.

### **DELETE /api/v1/order-item-modifiers/{id}**

Remove modifier.

# **5.4 Order Item Addons**

### **POST /api/v1/order-item-addons**

Add addon.

### **DELETE /api/v1/order-item-addons/{id}**

Remove addon.

# **5.5 Order Notes**

### **POST /api/v1/orders/{id}/notes**

Add note.

### **GET /api/v1/orders/{id}/notes**

List notes.

# **5.6 Order Events**

### **GET /api/v1/orders/{id}/events**

List order events (status changes, system events, etc.)

# **5.7 Order Status Flow**

Statuses include:

- pending
- accepted
- preparing
- ready
- dispatched
- delivered
- cancelled
- failed

</details>

# --

# **6. Payments API**

<details>
<summary><strong>Click to expand Section 6</strong></summary>

# **6. Payments API**

This section defines payment processing, refunds, and provider integrations.

# **6.1 Payments API**

### **GET /api/v1/payments**

List payments.

### **POST /api/v1/payments**

Create payment.

**Request Example**

json

`{
  "order_id": "uuid",
  "amount": 2499,
  "provider": "stripe",
  "method": "card"
}`

### **GET /api/v1/payments/{id}**

Retrieve payment.

### **PATCH /api/v1/payments/{id}**

Update payment.

# **6.2 Refunds API**

### **POST /api/v1/refunds**

Create refund.

### **GET /api/v1/refunds/{id}**

Retrieve refund.

# **6.3 Payment Providers**

### **GET /api/v1/payments/providers**

List supported providers.

# **6.4 Payment Webhooks**

### **POST /api/v1/webhooks/payments**

Receive provider webhook events.

Headers include:

Code

`X-Signature: <HMAC>
X-Provider: stripe
X-Timestamp: 1705759200`

</details>

# --

# **7. Delivery API**

<details>
<summary><strong>Click to expand Section 7</strong></summary>

# **7. Delivery API**

This section defines delivery management, drivers, tracking, and auto‑assignment.

# **7.1 Deliveries API**

### **GET /api/v1/deliveries**

List deliveries.

### **POST /api/v1/deliveries**

Create delivery.

### **GET /api/v1/deliveries/{id}**

Retrieve delivery.

### **PATCH /api/v1/deliveries/{id}**

Update delivery.

# **7.2 Delivery Tracking**

### **GET /api/v1/deliveries/{id}/tracking**

Retrieve tracking updates.

# **7.3 Auto‑Assignment**

### **POST /api/v1/deliveries/{id}/auto-assign**

Trigger driver assignment algorithm.

# **7.4 Drivers API**

### **GET /api/v1/drivers**

List drivers.

### **POST /api/v1/drivers**

Create driver.

### **GET /api/v1/drivers/{id}**

Retrieve driver.

### **PATCH /api/v1/drivers/{id}**

Update driver.

### **DELETE /api/v1/drivers/{id}**

Delete driver.

</details>

# --

# **8. Customers API**

<details>
<summary><strong>Click to expand Section 8</strong></summary>

# **8. Customers API**

This section defines customer profiles, loyalty, addresses, and sessions.

# **8.1 Customers API**

### **GET /api/v1/customers**

List customers.

### **POST /api/v1/customers**

Create customer.

### **GET /api/v1/customers/{id}**

Retrieve customer.

### **PATCH /api/v1/customers/{id}**

Update customer.

### **DELETE /api/v1/customers/{id}**

Delete customer.

# **8.2 Customer Addresses**

### **GET /api/v1/customers/{id}/addresses**

List addresses.

### **POST /api/v1/customers/{id}/addresses**

Add address.

### **PATCH /api/v1/customers/{id}/addresses/{address_id}**

Update address.

### **DELETE /api/v1/customers/{id}/addresses/{address_id}**

Delete address.

# **8.3 Loyalty API**

### **GET /api/v1/customers/{id}/loyalty**

Retrieve loyalty profile.

### **POST /api/v1/customers/{id}/loyalty/earn**

Add points.

### **POST /api/v1/customers/{id}/loyalty/redeem**

Redeem points.

# **8.4 Customer Sessions**

### **GET /api/v1/sessions**

List sessions.

### **DELETE /api/v1/sessions/{id}**

Terminate session.

</details>

# --

# **9. Promotions API**

<details>
<summary><strong>Click to expand Section 9</strong></summary>

# **9. Promotions API**

This section defines promotions, coupons, and loyalty rewards.

# **9.1 Promotions API**

### **GET /api/v1/promotions**

List promotions.

### **POST /api/v1/promotions**

Create promotion.

### **GET /api/v1/promotions/{id}**

Retrieve promotion.

### **PATCH /api/v1/promotions/{id}**

Update promotion.

### **DELETE /api/v1/promotions/{id}**

Delete promotion.

# **9.2 Coupons API**

### **GET /api/v1/coupons**

List coupons.

### **POST /api/v1/coupons**

Create coupon.

### **GET /api/v1/coupons/{id}**

Retrieve coupon.

### **PATCH /api/v1/coupons/{id}**

Update coupon.

### **DELETE /api/v1/coupons/{id}**

Delete coupon.

# **9.3 Loyalty Rewards**

### **GET /api/v1/loyalty/rewards**

List rewards.

### **POST /api/v1/loyalty/rewards**

Create reward.

### **PATCH /api/v1/loyalty/rewards/{id}**

Update reward.

### **DELETE /api/v1/loyalty/rewards/{id}**

Delete reward.

</details>

### **Part 3 of 4**

_(Sections 10 to 14 — Notifications, Settings, Analytics, Integrations, Security & Compliance)_

# --

# **10. Notifications & Messaging API**

<details>
<summary><strong>Click to expand Section 10</strong></summary>

# **10. Notifications & Messaging API**

This section defines system notifications, email/SMS/push messaging, templates, and delivery logs.

# **10.1 Notifications API**

### **GET /api/v1/notifications**

List notifications.

### **POST /api/v1/notifications**

Create notification.

### **GET /api/v1/notifications/{id}**

Retrieve notification.

# **10.2 Notification Templates**

### **GET /api/v1/notification-templates**

List templates.

### **POST /api/v1/notification-templates**

Create template.

### **PATCH /api/v1/notification-templates/{id}**

Update template.

# **10.3 Email API**

### **POST /api/v1/email/send**

Send email.

**Request Example**

json

`{
  "to": "customer@example.com",
  "template_id": "uuid",
  "data": {
    "order_id": "12345"
  }
}`

# **10.4 SMS API**

### **POST /api/v1/sms/send**

Send SMS.

# **10.5 Push Notifications**

### **POST /api/v1/push/send**

Send push notification.

# **10.6 Notification Logs**

### **GET /api/v1/notifications/logs**

List logs.

</details>

# --

# **11. Settings & Configuration API**

<details>
<summary><strong>Click to expand Section 11</strong></summary>

# **11. Settings & Configuration API**

This section defines system‑wide settings, location settings, feature flags, and configuration management.

# **11.1 System Settings**

### **GET /api/v1/settings**

Retrieve settings.

### **PATCH /api/v1/settings**

Update settings.

# **11.2 Feature Flags**

### **GET /api/v1/feature-flags**

List flags.

### **POST /api/v1/feature-flags**

Create flag.

### **PATCH /api/v1/feature-flags/{id}**

Update flag.

# **11.3 Location Configuration**

### **GET /api/v1/locations/{id}/config**

Retrieve config.

### **PATCH /api/v1/locations/{id}/config**

Update config.

# **11.4 Tax Settings**

### **GET /api/v1/taxes**

List tax rules.

### **POST /api/v1/taxes**

Create tax rule.

### **PATCH /api/v1/taxes/{id}**

Update tax rule.

# **11.5 Payment Settings**

### **GET /api/v1/payment-settings**

Retrieve settings.

### **PATCH /api/v1/payment-settings**

Update settings.

</details>

# --

# **12. Analytics & Reports API**

<details>
<summary><strong>Click to expand Section 12</strong></summary>

# **12. Analytics & Reports API**

This section defines reporting endpoints, dashboards, KPIs, and export tools.

# **12.1 Sales Reports**

### **GET /api/v1/reports/sales**

Retrieve sales report.

**Query Params**

- `from`
- `to`
- `location_id`

# **12.2 Order Reports**

### **GET /api/v1/reports/orders**

Retrieve order report.

# **12.3 Customer Reports**

### **GET /api/v1/reports/customers**

Retrieve customer analytics.

# **12.4 Inventory Reports**

### **GET /api/v1/reports/inventory**

Retrieve stock analytics.

# **12.5 Export API**

### **POST /api/v1/reports/export**

Generate CSV/PDF export.

</details>

# --

# **13. Integrations & Partner APIs**

<details>
<summary><strong>Click to expand Section 13</strong></summary>

# **13. Integrations & Partner APIs**

This section defines external integrations such as delivery partners, payment providers, POS systems, and webhooks.

# **13.1 Delivery Partner Integrations**

### **POST /api/v1/integrations/delivery/webhook**

Receive delivery partner updates.

# **13.2 Payment Provider Integrations**

### **POST /api/v1/integrations/payments/webhook**

Receive payment provider events.

# **13.3 POS Integrations**

### **POST /api/v1/integrations/pos/webhook**

Receive POS events.

# **13.4 Third‑Party Apps**

### **GET /api/v1/integrations/apps**

List connected apps.

### **POST /api/v1/integrations/apps**

Connect app.

# **13.5 API Keys**

### **GET /api/v1/api-keys**

List API keys.

### **POST /api/v1/api-keys**

Create API key.

### **DELETE /api/v1/api-keys/{id}**

Delete API key.

</details>

# --

# **14. Audit, Security & Compliance API**

<details>
<summary><strong>Click to expand Section 14</strong></summary>

# **14. Audit, Security & Compliance API**

This section defines audit logs, security events, compliance endpoints, and data governance.

# **14.1 Audit Logs**

### **GET /api/v1/audit-logs**

List audit logs.

**Filters**

- user_id
- event_type
- from
- to

# **14.2 Security Events**

### **GET /api/v1/security/events**

List security events.

# **14.3 Data Export**

### **POST /api/v1/data/export**

Export user data (GDPR).

# **14.4 Data Deletion**

### **POST /api/v1/data/delete**

Request deletion.

# **14.5 Compliance Status**

### **GET /api/v1/compliance/status**

Retrieve compliance status.

</details>

### **Part 4 of 4**

_(Sections 15 to 17 + Final Notes)_

# --

# **15. Developer Tools & Sandbox API**

<details>
<summary><strong>Click to expand Section 15</strong></summary>

# **15. Developer Tools & Sandbox API**

This section defines tools for developers, including sandbox environments, test data, API consoles, and mock services.

# **15.1 Sandbox Environment**

### **GET /api/v1/sandbox/reset**

Reset sandbox data.

### **POST /api/v1/sandbox/seed**

Seed test data.

# **15.2 API Console**

### **GET /api/v1/dev/console**

Retrieve console metadata.

# **15.3 Mock Services**

### **POST /api/v1/mock/payments**

Simulate payment provider responses.

### **POST /api/v1/mock/delivery**

Simulate delivery partner events.

# **15.4 Webhook Tester**

### **POST /api/v1/dev/webhook-test**

Send test webhook payload.

# **15.5 Rate Limits**

Default limits:

- 100 requests/minute per API key
- 1000 requests/hour per tenant
- Burst limit: 20 requests/second

</details>

# --

# **16. System Architecture & Internal APIs**

<details>
<summary><strong>Click to expand Section 16</strong></summary>

# **16. System Architecture & Internal APIs**

This section defines internal microservices, event buses, queues, and system‑level APIs not exposed publicly.

# **16.1 Internal Microservices**

- Authentication Service
- Catalog Service
- Orders Service
- Payments Service
- Delivery Service
- Notifications Service
- Reporting Service
- Integrations Service

# **16.2 Event Bus**

Events include:

- `order.created`
- `order.accepted`
- `order.preparing`
- `order.ready`
- `order.dispatched`
- `order.delivered`
- `payment.success`
- `payment.failed`
- `delivery.assigned`
- `delivery.completed`

# **16.3 Queue Workers**

Workers include:

- Notification worker
- Payment worker
- Delivery assignment worker
- Reporting worker

# **16.4 Internal APIs**

### **GET /internal/health**

Health check.

### **GET /internal/metrics**

Prometheus metrics.

### **POST /internal/events**

Publish internal event.

# **16.5 System Dependencies**

- Redis
- PostgreSQL
- Kafka / RabbitMQ
- S3 storage
- CDN
- Load balancer

</details>

# --

# **17. API Index, Naming Conventions, Versioning, Standards**

<details>
<summary><strong>Click to expand Section 17</strong></summary>

# **17. API Index, Naming Conventions, Versioning, Standards**

This section defines the global rules for API structure, naming, versioning, and formatting.

# **17.1 Naming Conventions**

### **Resources**

- Use **snake_case** for JSON keys
- Use **kebab-case** for URLs
- Use **lowercase** for endpoints

### **Examples**

Code

`/api/v1/order-items
/api/v1/stock-transfers`

# **17.2 Versioning**

Current version: **v1**

Rules:

- Breaking changes → increment major version
- Additive changes → remain in v1
- Deprecated endpoints must remain for 6 months

# **17.3 Error Format**

Standard error response:

json

`{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "The provided data is invalid.",
    "details": {}
  }
}`

# **17.4 Pagination Standard**

Query params:

- `page`
- `limit`
- `sort`
- `filter`

Response:

json

`{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 120
  }
}`

# **17.5 Rate Limit Headers**

Code

`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1705762800`

# **17.6 Webhook Signature Standard**

Headers:

Code

`X-Signature: <HMAC>
X-Timestamp: <unix>`

# **17.7 API Response Envelope**

All responses follow:

json

`{
  "success": true,
  "data": {}
}`

</details>

# --

# 🎉 **FINAL NOTES (Include at the bottom of your Notion page)**

<details>
<summary><strong>Click to expand Final Notes</strong></summary>

# **API Specification v1.0 — Final Notes**

This consolidated document represents the **complete Bundle 5 API Specification**, including:

- 17 API sections
- Standardized formatting
- Naming conventions
- Versioning rules
- Error standards
- Pagination
- Webhooks
- Internal APIs
- Developer tools
- Architecture references

This is the **official, investor‑ready, partner‑ready, engineer‑ready** version of the OmniOrder API.

You may now:

- Export this page as **PDF**
- Share with partners
- Share with investors
- Use for onboarding
- Use for compliance audits

This is your **canonical API Specification v1.0**.

</details>
