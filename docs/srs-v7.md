# **1. Authentication & Access**

### **1.1 Overview**

The Authentication module manages user login, session management, password handling, PIN login, and multi‑tenant access. It ensures secure access to all OmniOrder applications including POS, DOP, KDS, Admin, Online Ordering, and Delivery.

### **1.2 Features**

- Email + password login
- PIN login for POS
- Role‑based access control
- Multi‑tenant authentication
- Session management
- Token refresh
- Logout
- Device registration
- Terminal‑level authentication
- Two‑factor authentication (future)

### **1.3 Requirements**

- JWT access tokens
- Refresh tokens
- Tenant isolation
- Password hashing
- PIN hashing
- Session expiration
- Device binding
- Audit logging for login events

# **2. Organizations, Stores & Locations**

### **2.1 Overview**

Defines the multi‑tenant structure of OmniOrder. A tenant can have multiple stores, and each store can have multiple physical locations.

### **2.2 Entities**

- Tenant
- Store
- Location
- Terminal
- Device

### **2.3 Features**

- Create tenant
- Create store
- Create location
- Assign terminals
- Configure store settings
- Configure taxes
- Configure opening hours
- Configure delivery zones
- Configure payment methods

### **2.4 Requirements**

- Strict tenant isolation
- Store‑level configuration
- Location‑level overrides
- Terminal registration
- Terminal activation/deactivation

# **3. Products & Catalog**

### **3.1 Overview**

Manages all product data including categories, variants, modifiers, add‑ons, pricing, and availability.

### **3.2 Entities**

- Product
- Category
- Variant
- Add‑on
- Modifier group
- Price
- Tax class
- Availability schedule

### **3.3 Features**

- Create/edit products
- Assign categories
- Add variants
- Add modifiers
- Add add‑ons
- Manage pricing
- Manage tax rules
- Manage availability
- Manage images
- Manage tags
- Manage product visibility per channel (POS, Online, WhatsApp)

### **3.4 Requirements**

- Multi‑channel visibility
- Variant‑level pricing
- Add‑on pricing
- Modifier rules
- Category sorting
- Product sorting
- Searchable catalog
- Bulk import/export

# **4. Inventory & Stock**

### **4.1 Overview**

Tracks stock levels, stock movements, wastage, transfers, and real‑time availability across locations.

### **4.2 Entities**

- Stock item
- Stock movement
- Stock adjustment
- Stock transfer
- Stock reservation
- Wastage record

### **4.3 Features**

- Real‑time stock updates
- Deduct stock on order
- Reserve stock on checkout
- Manual adjustments
- Wastage logging
- Transfers between locations
- Low‑stock alerts
- Out‑of‑stock rules
- Stock forecasting (future)

### **4.4 Requirements**

- Atomic stock updates
- Multi‑location stock
- FIFO or simple deduction
- Stock audit logs
- Offline stock sync for POS

# **5. Point of Sale (POS)**

### **5.1 Overview**

The POS is the primary interface for staff to create orders, take payments, print receipts, and manage tables (if dine‑in).

### **5.2 Features**

- Product browsing
- Add to cart
- Modifiers and add‑ons
- Discounts
- Notes
- Suspend/resume
- Split bill
- Multiple payment methods
- Refunds
- Reprint receipts
- Offline mode
- Sync queue
- Cash drawer management
- End‑of‑day reports

### **5.3 Requirements**

- Must work fully offline
- Sync queue for offline operations
- Fast product loading
- Instant cart updates
- Local caching
- Printer integration
- Terminal‑level authentication
- Real‑time order sync to KDS

# **6. Dine‑In Order Pad (DOP)**

### **6.1 Overview**

The DOP is used by waiters to manage dine‑in orders, tables, courses, and sending items to the kitchen.

### **6.2 Features**

- Table selection
- Seat assignment
- Add items
- Add notes
- Add modifiers
- Course management
- Fire items to kitchen
- Move items between seats
- Merge tables
- Transfer tables
- Split bill
- View order history
- Reopen orders

### **6.3 Requirements**

- Real‑time sync with POS
- Real‑time sync with KDS
- Offline caching
- Multi‑device support
- Table state management
- Course sequencing

# **7. Kitchen Display System (KDS)**

### **7.1 Overview**

Displays kitchen tickets, organizes items by station, and tracks preparation progress.

### **7.2 Features**

- New tickets
- Cooking view
- Ready view
- Completed view
- Reject items
- Bump items
- Bump entire ticket
- Station routing
- Color coding
- Sound alerts
- Ticket timers
- Order aging
- Auto‑bump (optional)

### **7.3 Requirements**

- Real‑time updates
- Station‑level filtering
- Offline caching
- Printer fallback
- Ticket grouping by course
- Multi‑screen support

# **8. Tables**

### **8.1 Overview**

Manages dine‑in table layout, table states, and seating.

### **8.2 Features**

- Table layout
- Table status (open, seated, ordered, paid)
- Seat assignment
- Merge tables
- Transfer tables
- Table notes
- Table timers
- Table capacity

### **8.3 Requirements**

- Real‑time sync with POS and DOP
- Table state persistence
- Multi‑floor support (future)

# **9. Transactions & Payments**

### **9.1 Overview**

Handles all payment processing, refunds, and transaction records.

### **9.2 Features**

- Cash payments
- Card payments
- Split payments
- Partial payments
- Tips
- Refunds
- Voids
- Payment reconciliation
- Payment history
- Payment receipts
- Payment webhooks

### **9.3 Requirements**

- PCI‑compliant handling
- Offline cash payments
- Online card payments
- Payment gateway integration
- Transaction audit logs
- Multi‑currency support
- Rounding rules

# **10. Waiter Tasks**

### **10.1 Overview**

Defines tasks performed by waiters during dine‑in service.

### **10.2 Features**

- Take orders
- Modify orders
- Fire courses
- Transfer tables
- Add notes
- Handle split bills
- Process payments
- Manage tips
- Reopen orders
- Print bills
- Print kitchen tickets (fallback)

### **10.3 Requirements**

- Real‑time sync
- Offline caching
- Role‑based permissions
- Task audit logs

# **11. Customers & Loyalty**

## **11.1 Overview**

Manages customer profiles, loyalty points, visit history, and communication preferences.

## **11.2 Features**

- Create customer profile
- Edit customer details
- Customer search
- Customer tags
- Loyalty points
- Loyalty tiers
- Visit history
- Order history
- Marketing opt‑in
- Customer notes
- Merge duplicate customers

## **11.3 Requirements**

- Unique customer ID
- Phone/email lookup
- Loyalty rules engine
- Points accrual and redemption
- GDPR‑compliant data handling
- Customer deletion/anonymization

# **12. Promotions & Pricing**

## **12.1 Overview**

Handles discounts, coupons, automatic promotions, and price overrides.

## **12.2 Features**

- Percentage discounts
- Fixed amount discounts
- Buy X Get Y
- Happy hour pricing
- Category‑level discounts
- Product‑level discounts
- Coupon codes
- Auto‑apply promotions
- Staff override
- Manager approval
- Promotion scheduling

## **12.3 Requirements**

- Multi‑channel compatibility
- Promotion stacking rules
- Eligibility rules
- Usage limits
- Audit logs for overrides
- Real‑time price recalculation

# **13. Returns**

## **13.1 Overview**

Manages product returns, refunds, and stock adjustments.

## **13.2 Features**

- Return items
- Partial returns
- Full returns
- Refund to original payment method
- Refund to store credit
- Return notes
- Return reason codes
- Auto stock adjustment
- Manual stock adjustment override

## **13.3 Requirements**

- Return audit logs
- Manager approval for high‑value returns
- Stock reconciliation
- Refund receipts
- Multi‑channel return support

# **14. Reporting & Analytics**

## **14.1 Overview**

Provides insights into sales, products, staff performance, inventory, and customer behavior.

## **14.2 Features**

- Sales reports
- Product performance
- Category performance
- Staff performance
- Payment reports
- Tax reports
- Inventory reports
- Wastage reports
- Delivery reports
- Customer insights
- Export to CSV
- Scheduled reports (future)

## **14.3 Requirements**

- Real‑time data
- Multi‑tenant isolation
- Date range filtering
- Location filtering
- Channel filtering
- Aggregated metrics
- Drill‑down capability

# **15. VAT**

## **15.1 Overview**

Manages VAT configuration, tax classes, and tax calculation rules.

## **15.2 Features**

- VAT classes
- VAT rates
- Product‑level VAT
- Location‑level VAT
- Inclusive/exclusive pricing
- VAT on delivery fees
- VAT on service charges
- VAT reports
- VAT rounding rules

## **15.3 Requirements**

- Accurate tax calculation
- Multi‑rate support
- Historical VAT rate handling
- VAT breakdown on receipts
- VAT audit logs

# **16. Receipts & Printing**

## **16.1 Overview**

Handles printing of receipts, kitchen tickets, order summaries, and delivery slips.

## **16.2 Features**

- Customer receipt
- Kitchen ticket
- Reprint receipt
- Print preview
- Print on order
- Print on payment
- Print on fire
- Delivery slip
- QR codes
- Custom receipt footer
- Logo printing
- Multi‑printer routing

## **16.3 Requirements**

- ESC/POS support
- Network printers
- Bluetooth printers
- USB printers
- Printer fallback
- Print queue
- Offline printing
- Multi‑station routing

# **17. Barcodes & Labels**

## **17.1 Overview**

Manages barcode generation, scanning, and label printing.

## **17.2 Features**

- Generate barcodes
- Print labels
- Scan barcodes
- Product lookup
- Variant lookup
- Price labels
- Shelf labels
- QR codes
- SKU management

## **17.3 Requirements**

- Barcode formats (EAN‑13, UPC, Code128)
- Label templates
- Printer compatibility
- Offline scanning
- Fast lookup

# **18. Users, Roles & Permissions**

## **18.1 Overview**

Defines user accounts, roles, and granular permissions across all OmniOrder applications.

## **18.2 Features**

- Create user
- Assign role
- Custom roles
- Permission groups
- Terminal‑level permissions
- Staff PINs
- Staff activity logs
- Staff performance metrics
- Role‑based UI visibility

## **18.3 Requirements**

- RBAC enforcement
- Multi‑tenant isolation
- Permission inheritance
- Audit logs
- Password/PIN policies
- Session tracking

# **19. Subscription & Billing**

## **19.1 Overview**

Handles tenant subscription plans, billing cycles, invoices, and payment methods.

## **19.2 Features**

- Subscription plans
- Monthly/annual billing
- Add‑ons
- Usage‑based billing
- Invoices
- Payment methods
- Billing history
- Trial periods
- Grace periods
- Automatic suspension
- Reactivation

## **19.3 Requirements**

- Stripe integration
- Webhooks
- Invoice generation
- Tax handling
- Proration
- Multi‑currency support
- Billing notifications

# **20. Terminals**

## **20.1 Overview**

Manages POS terminals, device registration, and terminal‑level settings.

## **20.2 Features**

- Register terminal
- Activate/deactivate terminal
- Terminal name
- Terminal type (POS, KDS, DOP, Delivery)
- Terminal settings
- Printer assignment
- Cash drawer assignment
- Terminal logs
- Terminal sync status

## **20.3 Requirements**

- Device binding
- Terminal authentication
- Offline mode
- Terminal‑level configuration
- Terminal heartbeat
- Terminal audit logs

# **21. Offline & Sync**

## **21.1 Overview**

Ensures POS, DOP, and KDS can operate during network outages and sync data when connectivity is restored.

## **21.2 Features**

- Offline product catalog
- Offline cart
- Offline order creation
- Offline payments (cash only)
- Offline printing
- Sync queue
- Conflict resolution
- Retry logic
- Sync status indicators
- Local storage encryption

## **21.3 Requirements**

- Must support full POS operation offline
- Sync queue must persist across app restarts
- Automatic retry with exponential backoff
- Conflict resolution rules (server wins or merge)
- Offline audit logs
- Local data encryption
- Sync progress tracking

# **22. Notifications**

## **22.1 Overview**

Handles system notifications across channels including email, SMS, WhatsApp, push notifications, and in‑app alerts.

## **22.2 Features**

- Order status notifications
- Delivery updates
- Low stock alerts
- Payment alerts
- Subscription alerts
- Staff notifications
- Customer notifications
- In‑app notifications
- Notification templates
- Notification scheduling

## **22.3 Requirements**

- Multi‑channel delivery
- Retry logic
- Notification logs
- Template versioning
- Opt‑in/opt‑out
- Multi‑tenant isolation
- Rate limiting

# **23. Settings**

## **23.1 Overview**

Centralized configuration for tenant, store, location, and terminal settings.

## **23.2 Features**

- General settings
- Tax settings
- Payment settings
- Printer settings
- KDS settings
- DOP settings
- Delivery settings
- Online ordering settings
- WhatsApp settings
- Loyalty settings
- Promotion settings
- Staff settings
- Receipt settings
- Theme settings

## **23.3 Requirements**

- Hierarchical configuration (tenant → store → location → terminal)
- Override rules
- Versioned settings
- Audit logs
- Real‑time propagation
- Validation rules

# **24. Security & Platform**

## **24.1 Overview**

Defines platform‑wide security, encryption, access control, and compliance requirements.

## **24.2 Features**

- JWT authentication
- RBAC
- API gateway security
- Rate limiting
- IP allow/deny lists
- Data encryption
- Audit logs
- Session management
- Password policies
- PIN policies
- Device binding
- Multi‑tenant isolation

## **24.3 Requirements**

- TLS 1.2+
- AES‑256 encryption at rest
- Secure password hashing
- Token rotation
- Audit logging
- GDPR compliance
- PCI‑DSS compliance
- No cross‑tenant data leakage
- Secure API gateway

# **25. Landing & Marketing**

## **25.1 Overview**

Public‑facing website and marketing pages for OmniOrder.

## **25.2 Features**

- Landing page
- Pricing page
- Features page
- Blog
- Documentation
- Contact form
- Demo request
- Signup page
- Marketing analytics
- SEO optimization

## **25.3 Requirements**

- Fast loading
- SEO‑friendly
- Mobile responsive
- Secure forms
- Multi‑language support (future)

# **26. WhatsApp Ordering**

## **26.1 Overview**

Allows customers to place orders via WhatsApp using automated flows.

## **26.2 Features**

- WhatsApp chatbot
- Product browsing
- Add to cart
- Modify cart
- Checkout
- Payment link
- Order confirmation
- Order tracking
- Customer profile lookup
- Loyalty integration
- Abandoned cart recovery
- WhatsApp templates
- Conversation history

## **26.3 Requirements**

- WhatsApp Business API integration
- Template approval
- Session management
- Rate limiting
- Multi‑language support
- Real‑time sync with Order Service
- Real‑time stock updates
- Payment gateway integration
- Conversation flow engine

# **27. Online Ordering (Web/PWA)**

## **27.1 Overview**

Customer‑facing online ordering website and PWA.

## **27.2 Features**

- Product browsing
- Category filtering
- Search
- Add to cart
- Modifiers
- Add‑ons
- Checkout
- Payment
- Order confirmation
- Order tracking
- Delivery/collection selection
- Tips
- Promo codes
- Customer login
- Guest checkout
- Loyalty integration
- Storefront theming
- Multi‑language support
- PWA installation

## **27.3 Requirements**

- Fast loading
- SEO‑friendly
- Mobile‑first
- Real‑time stock updates
- Real‑time order sync
- Payment gateway integration
- Multi‑tenant theming
- Caching
- Offline fallback (PWA)

# **28. Delivery Management**

## **28.1 Overview**

Manages delivery orders, driver assignment, routing, and tracking.

## **28.2 Features**

- Delivery zones
- Delivery fees
- Driver assignment
- Driver app
- Live driver tracking
- Delivery status updates
- Proof of delivery
- Delivery notes
- Delivery time estimates
- Auto‑assignment rules
- Manual assignment
- Driver performance metrics

## **28.3 Requirements**

- Real‑time location tracking
- Driver authentication
- Delivery workflow
- Push notifications
- Delivery audit logs
- Multi‑zone support
- Distance‑based fees
- Time‑based fees
- Order → Driver sync

# **29. Multi‑Channel Sync**

## **29.1 Overview**

Ensures all channels (POS, DOP, KDS, Online, WhatsApp, Delivery) stay synchronized.

## **29.2 Features**

- Real‑time order sync
- Real‑time stock sync
- Real‑time menu sync
- Real‑time table sync
- Real‑time payment sync
- Conflict resolution
- Channel‑specific visibility
- Channel‑specific pricing
- Channel‑specific availability

## **29.3 Requirements**

- Event‑driven architecture
- Guaranteed delivery
- Idempotent events
- Multi‑channel consistency
- Low latency
- Retry logic
- Channel isolation

# **30. Event Bus**

## **30.1 Overview**

Central event streaming system for real‑time communication between microservices.

## **30.2 Features**

- Publish/subscribe
- Event topics
- Event versioning
- Event replay
- Dead‑letter queue
- Event logs
- Event tracing
- Event filtering
- Event retention policies

## **30.3 Requirements**

- High throughput
- Low latency
- At‑least‑once delivery
- Idempotent consumers
- Schema registry
- Multi‑tenant isolation
- Horizontal scalability
- Monitoring and metrics

# **31. Multi‑Tenant SaaS Extensions**

## **31.1 Overview**

Defines the multi‑tenant architecture, tenant isolation, and tenant‑level configuration for OmniOrder.

## **31.2 Features**

- Tenant creation
- Tenant onboarding
- Tenant configuration
- Tenant‑level themes
- Tenant‑level settings
- Tenant‑level billing
- Tenant‑level data isolation
- Tenant suspension
- Tenant deletion
- Tenant audit logs

## **31.3 Requirements**

- Strict tenant isolation
- Tenant ID propagation across all services
- No cross‑tenant data leakage
- Tenant‑scoped API keys
- Tenant‑scoped events
- Tenant‑scoped storage
- Tenant‑scoped rate limits
- Tenant‑scoped analytics
- Tenant‑scoped backups

# **32. Customer Portal**

## **32.1 Overview**

A self‑service portal for customers to view their orders, loyalty points, and profile.

## **32.2 Features**

- Customer login
- Order history
- Order details
- Reorder
- Loyalty points
- Loyalty tiers
- Profile management
- Address book
- Saved payment methods
- Notification preferences
- Delete account (GDPR)

## **32.3 Requirements**

- Secure authentication
- GDPR compliance
- Real‑time order sync
- Multi‑tenant theming
- Mobile‑friendly design

# **33. Advanced Analytics**

## **33.1 Overview**

Provides advanced dashboards, insights, and predictive analytics.

## **33.2 Features**

- Sales forecasting
- Inventory forecasting
- Customer segmentation
- Heatmaps
- Funnel analysis
- Cohort analysis
- Staff performance analytics
- Delivery performance analytics
- Menu engineering insights
- Profitability analysis

## **33.3 Requirements**

- Data warehouse
- ETL pipelines
- Aggregated metrics
- Historical data retention
- Multi‑tenant isolation
- Scheduled jobs
- Export to CSV/Excel

# **34. Theming & Branding**

## **34.1 Overview**

Allows tenants to customize the look and feel of their online storefront and customer‑facing interfaces.

## **34.2 Features**

- Theme colors
- Typography
- Logo upload
- Banner images
- Button styles
- Layout options
- Custom CSS (optional)
- Theme presets
- Theme versioning
- Live preview
- Publish/unpublish themes

## **34.3 Requirements**

- Multi‑tenant theme isolation
- Real‑time theme updates
- CDN caching
- Safe CSS sandboxing
- Theme rollback

# **35. API Gateway / BFF**

## **35.1 Overview**

Central gateway for routing, authentication, rate limiting, and request aggregation.

## **35.2 Features**

- Routing
- Authentication
- Rate limiting
- Request validation
- Response transformation
- Caching
- API keys
- Webhooks
- GraphQL (optional)
- BFF (Backend for Frontend) for POS, DOP, KDS, Online, Delivery

## **35.3 Requirements**

- High throughput
- Low latency
- Multi‑tenant routing
- JWT validation
- API key validation
- Request logging
- Error handling
- Circuit breaker
- Retry logic
- Canary deployments

# **36. DevOps & Infrastructure**

## **36.1 Overview**

Defines the infrastructure, CI/CD pipelines, deployment strategy, and operational tooling.

## **36.2 Features**

- CI/CD pipelines
- Automated testing
- Automated deployments
- Blue‑green deployments
- Canary releases
- Infrastructure as code
- Secrets management
- Monitoring
- Logging
- Alerting
- Auto‑scaling
- Backups
- Disaster recovery

## **36.3 Requirements**

- Kubernetes
- Docker
- Terraform
- GitHub Actions or GitLab CI
- Centralized logging
- Metrics dashboards
- Health checks
- Horizontal Pod Autoscaling
- Multi‑region support (future)

# **37. Database Schema**

## **37.1 Overview**

Defines the relational database schema for all core entities.

## **37.2 Requirements**

- PostgreSQL
- Strict foreign key constraints
- Soft deletes
- Audit fields (created_at, updated_at, deleted_at)
- Tenant ID on all tables
- Indexing strategy
- Partitioning for large tables
- Read replicas
- Backup strategy

## **37.3 Core Tables (High‑Level List)**

- tenants
- stores
- locations
- terminals
- users
- roles
- permissions
- products
- categories
- variants
- modifiers
- add_ons
- stock_items
- stock_movements
- orders
- order_items
- payments
- customers
- promotions
- subscriptions
- invoices
- events (event log)

# **38. Microservice Architecture**

## **38.1 Overview**

Defines the microservices that make up OmniOrder.

## **38.2 Services**

- Auth Service
- Tenant Service
- Product Service
- Inventory Service
- Order Service
- Payment Service
- Customer Service
- Promotion Service
- Reporting Service
- Notification Service
- Delivery Service
- Online Ordering Service
- WhatsApp Service
- KDS Service
- POS Sync Service
- Settings Service
- Subscription Service
- Event Bus Service
- API Gateway

## **38.3 Requirements**

- Stateless services
- Horizontal scaling
- Event‑driven communication
- REST + WebSockets
- Idempotent operations
- Circuit breakers
- Retry logic
- Service discovery
- Health checks

# **39. API Specification Outline**

## **39.1 Overview**

Defines the structure and conventions for all API endpoints.

## **39.2 Requirements**

- RESTful conventions
- JSON responses
- Consistent error format
- Pagination
- Filtering
- Sorting
- Rate limiting
- API versioning
- Tenant‑scoped endpoints
- Authentication required for all non‑public endpoints

## **39.3 Example Endpoint Structure**

- GET /v1/products
- POST /v1/orders
- PATCH /v1/orders/{id}
- GET /v1/customers/{id}
- POST /v1/payments
- GET /v1/reports/sales

# **40. Event Definitions**

## **40.1 Overview**

Defines all events published across the system.

## **40.2 Event Categories**

- Order events
- Payment events
- Inventory events
- Customer events
- Promotion events
- Delivery events
- Notification events
- Subscription events
- System events

## **40.3 Example Events**

- order.created
- order.updated
- order.completed
- order.cancelled
- payment.success
- payment.failed
- stock.updated
- customer.created
- customer.updated
- delivery.assigned
- delivery.completed
- subscription.renewed
- subscription.expired

## **40.4 Requirements**

- Event versioning
- Schema registry
- Idempotent consumers
- Dead‑letter queue
- Event retention
- Event replay
- Multi‑tenant isolation

# **41. System Flows**

## **41.1 Overview**

Defines the high‑level flows that connect all modules across OmniOrder.

## **41.2 Core Flows**

- Order lifecycle
- Payment lifecycle
- Delivery lifecycle
- Stock lifecycle
- Customer lifecycle
- Promotion lifecycle
- Notification lifecycle
- Subscription lifecycle
- Terminal sync lifecycle
- Offline sync lifecycle

## **41.3 Requirements**

- Event‑driven flows
- Retry support
- Idempotency
- Multi‑tenant isolation
- Observability (logs, metrics, traces)

# **42. Order Lifecycle**

## **42.1 Overview**

Defines the complete lifecycle of an order from creation to completion.

## **42.2 Stages**

1. Cart created
2. Order created
3. Order accepted
4. Items sent to kitchen
5. Items prepared
6. Items ready
7. Order ready for pickup/delivery
8. Order delivered/collected
9. Order completed
10. Order refunded (optional)
11. Order cancelled (optional)

## **42.3 Requirements**

- Real‑time sync across all channels
- Event‑driven updates
- Order state machine
- Audit logs
- Payment integration
- Delivery integration

# **43. Payment Lifecycle**

## **43.1 Overview**

Defines the flow of payments from initiation to settlement.

## **43.2 Stages**

1. Payment initiated
2. Payment authorized
3. Payment captured
4. Payment confirmed
5. Receipt generated
6. Payment reconciled
7. Refund initiated (optional)
8. Refund completed (optional)
9. Payment failed (optional)

## **43.3 Requirements**

- PCI‑compliant handling
- Gateway integration
- Webhook validation
- Transaction logs
- Multi‑currency support
- Offline cash support
- Idempotent operations

# **44. Delivery Lifecycle**

## **44.1 Overview**

Defines the flow of delivery orders from creation to completion.

## **44.2 Stages**

1. Delivery order created
2. Delivery fee calculated
3. Driver assigned
4. Driver accepts job
5. Driver en route to store
6. Driver picks up order
7. Driver en route to customer
8. Order delivered
9. Proof of delivery
10. Delivery completed
11. Delivery failed (optional)

## **44.3 Requirements**

- Real‑time driver tracking
- Push notifications
- Delivery audit logs
- Distance/time fee calculation
- Driver authentication

# **45. Stock Lifecycle**

## **45.1 Overview**

Defines how stock is updated across the system.

## **45.2 Stages**

1. Stock added
2. Stock deducted (order)
3. Stock reserved (checkout)
4. Stock released (cancelled order)
5. Stock adjusted (manual)
6. Stock transferred
7. Stock wasted
8. Stock reconciled

## **45.3 Requirements**

- Atomic stock updates
- Multi‑location stock
- Real‑time stock sync
- Stock audit logs
- Offline stock sync
- Low‑stock alerts

# **46. Customer Lifecycle**

## **46.1 Overview**

Defines how customer data evolves over time.

## **46.2 Stages**

1. Customer created
2. Customer updated
3. Customer places order
4. Loyalty points added
5. Loyalty points redeemed
6. Customer receives notifications
7. Customer updates preferences
8. Customer requests deletion (GDPR)

## **46.3 Requirements**

- GDPR compliance
- Customer audit logs
- Loyalty rules engine
- Multi‑channel customer sync
- Customer merge logic

# **47. Promotion Lifecycle**

## **47.1 Overview**

Defines how promotions are created, applied, and tracked.

## **47.2 Stages**

1. Promotion created
2. Promotion scheduled
3. Promotion activated
4. Promotion applied to cart
5. Promotion redeemed
6. Promotion expired
7. Promotion deactivated
8. Promotion audited

## **47.3 Requirements**

- Promotion rules engine
- Eligibility checks
- Stacking rules
- Usage limits
- Audit logs
- Multi‑channel compatibility

# **48. Notification Lifecycle**

## **48.1 Overview**

Defines how notifications are generated and delivered.

## **48.2 Stages**

1. Event triggered
2. Template selected
3. Notification generated
4. Notification queued
5. Notification sent
6. Notification delivered
7. Notification failed (retry)
8. Notification logged

## **48.3 Requirements**

- Multi‑channel delivery
- Retry logic
- Template versioning
- Notification logs
- Opt‑in/opt‑out
- Rate limiting

# **49. Subscription Lifecycle**

## **49.1 Overview**

Defines how tenant subscriptions are managed.

## **49.2 Stages**

1. Tenant subscribes
2. Trial starts
3. Trial ends
4. Billing cycle starts
5. Invoice generated
6. Payment collected
7. Subscription renewed
8. Subscription failed
9. Grace period
10. Suspension
11. Reactivation
12. Cancellation

## **49.3 Requirements**

- Stripe integration
- Webhooks
- Proration
- Multi‑currency support
- Subscription audit logs
- Automatic suspension logic

# **50. Terminal Sync Lifecycle**

## **50.1 Overview**

Defines how terminals (POS, DOP, KDS, Delivery) stay synchronized.

## **50.2 Stages**

1. Terminal registers
2. Terminal authenticates
3. Terminal downloads initial data
4. Terminal subscribes to events
5. Terminal receives updates
6. Terminal sends updates
7. Terminal goes offline
8. Terminal syncs queue
9. Terminal reconnects
10. Terminal heartbeat

## **50.3 Requirements**

- WebSockets
- Offline queue
- Retry logic
- Terminal audit logs
- Device binding
- Real‑time updates

# **51. KDS Flows**

## **51.1 Overview**

Defines how kitchen tickets and items flow through the Kitchen Display System.

## **51.2 Ticket Flow**

1. Order created
2. Items routed to stations
3. Ticket appears in “New”
4. Chef taps **Start** → moves to **Cooking**
5. Chef taps **Ready** → moves to **Ready**
6. Runner collects items
7. Runner taps **Done** → moves to **Completed**
8. Auto‑bump (optional)

## **51.3 Item Flow**

- Each item has its own lifecycle
- Items can be bumped individually
- Items can be rejected
- Items can be re‑fired
- Items can be moved between stations

## **51.4 Requirements**

- Real‑time updates
- Station routing rules
- Ticket timers
- Color coding
- Sound alerts
- Multi‑screen support
- Offline fallback

# **52. WhatsApp Flows**

## **52.1 Overview**

Defines the conversational flow for WhatsApp ordering.

## **52.2 Customer Flow**

1. Customer sends message
2. Bot greets customer
3. Customer browses menu
4. Customer adds items
5. Customer reviews cart
6. Customer checks out
7. Payment link sent
8. Payment confirmed
9. Order created
10. Order updates sent
11. Delivery tracking (if applicable)

## **52.3 Bot Logic**

- Intent detection
- Menu navigation
- Cart management
- Payment link generation
- Order confirmation
- Error handling
- Fallback messages
- Human handover (optional)

## **52.4 Requirements**

- WhatsApp Business API
- Template approval
- Session management
- Multi‑language support
- Real‑time stock sync
- Payment integration

# **53. Online Ordering Flows**

## **53.1 Overview**

Defines the customer journey on the online ordering website/PWA.

## **53.2 Customer Flow**

1. Customer lands on storefront
2. Customer selects location
3. Customer browses menu
4. Customer adds items
5. Customer views cart
6. Customer logs in or checks out as guest
7. Customer selects delivery/collection
8. Customer enters address (delivery)
9. Customer applies promo code
10. Customer pays
11. Order created
12. Order tracking page
13. Order completed

## **53.3 Requirements**

- Real‑time stock
- Real‑time pricing
- Real‑time order updates
- Multi‑tenant theming
- SEO optimization
- PWA support
- Payment gateway integration

# **54. Delivery Flows**

## **54.1 Overview**

Defines the flow for delivery orders and driver interactions.

## **54.2 Driver App Flow**

1. Driver logs in
2. Driver goes online
3. Driver receives assignment
4. Driver accepts/rejects
5. Driver navigates to store
6. Driver picks up order
7. Driver navigates to customer
8. Driver delivers order
9. Driver uploads proof of delivery
10. Delivery completed

## **54.3 Dispatcher Flow**

- Auto‑assignment
- Manual assignment
- Reassignment
- Driver tracking
- Delivery status monitoring
- Delivery performance metrics

## **54.4 Requirements**

- GPS tracking
- Push notifications
- Delivery audit logs
- Distance/time fee calculation
- Driver authentication

# **55. POS Flows**

## **55.1 Overview**

Defines the flow of operations inside the POS.

## **55.2 Cashier Flow**

1. Login
2. Select terminal
3. Browse products
4. Add items
5. Apply modifiers
6. Apply discounts
7. Add notes
8. Take payment
9. Print receipt
10. Order sent to KDS
11. Logout

## **55.3 Manager Flow**

- Override discounts
- Approve returns
- Approve voids
- Manage cash drawer
- End‑of‑day report
- Terminal settings
- Staff management

## **55.4 Requirements**

- Offline support
- Fast product loading
- Real‑time sync
- Printer integration
- Terminal authentication

# **56. DOP Flows**

## **56.1 Overview**

Defines the flow for waiters using the Dine‑In Order Pad.

## **56.2 Waiter Flow**

1. Login
2. Select table
3. Add items
4. Assign seats
5. Add notes
6. Fire courses
7. Modify items
8. Move items
9. Transfer table
10. Print bill
11. Take payment
12. Close table

## **56.3 Requirements**

- Real‑time sync with POS
- Real‑time sync with KDS
- Table state management
- Offline caching
- Multi‑device support

# **57. KDS Station Routing**

## **57.1 Overview**

Defines how items are routed to kitchen stations.

## **57.2 Routing Rules**

- Category‑based routing
- Product‑level routing
- Modifier‑level routing
- Multi‑station routing
- Priority routing
- Course‑based routing

## **57.3 Requirements**

- Real‑time routing
- Station configuration
- Routing overrides
- Routing logs
- Multi‑station support

# **58. Order Routing**

## **58.1 Overview**

Defines how orders are routed across channels and services.

## **58.2 Routing Types**

- POS → KDS
- DOP → KDS
- Online → KDS
- WhatsApp → KDS
- Delivery → Driver
- Delivery → KDS
- Delivery → POS
- POS → Delivery

## **58.3 Requirements**

- Event‑driven routing
- Retry logic
- Routing logs
- Multi‑channel compatibility
- Real‑time updates

# **59. Order Status Mapping**

## **59.1 Overview**

Defines the unified order status model across all channels.

## **59.2 Statuses**

- Pending
- Accepted
- Preparing
- Ready
- Out for delivery
- Delivered
- Completed
- Cancelled
- Refunded
- Failed

## **59.3 Requirements**

- Status mapping per channel
- Status mapping per service
- Status mapping per integration
- Real‑time updates
- Status audit logs

# **60. Payment Status Mapping**

## **60.1 Overview**

Defines the unified payment status model across all channels.

## **60.2 Statuses**

- Pending
- Authorized
- Captured
- Confirmed
- Refunded
- Failed
- Cancelled

## **60.3 Requirements**

- Gateway‑agnostic mapping
- Webhook validation
- Retry logic
- Payment audit logs
- Multi‑currency support

# **61. Receipt & Printing Flows**

## **61.1 Overview**

Defines how receipts, kitchen tickets, and delivery slips are generated and printed.

## **61.2 Receipt Flow**

1. Order created
2. Payment initiated
3. Payment confirmed
4. Receipt generated
5. Receipt printed
6. Receipt stored in history
7. Receipt reprint (optional)

## **61.3 Kitchen Ticket Flow**

1. Order created
2. Items routed to stations
3. Ticket generated
4. Ticket printed (if printer mode enabled)
5. Ticket logged

## **61.4 Delivery Slip Flow**

1. Delivery order created
2. Delivery details added
3. Slip generated
4. Slip printed
5. Slip logged

## **61.5 Requirements**

- ESC/POS support
- Network/Bluetooth/USB printers
- Print queue
- Retry logic
- Offline printing
- Multi‑station routing
- Customizable templates

# **62. Audit Logs**

## **62.1 Overview**

Tracks all critical actions across the system for security, compliance, and debugging.

## **62.2 Logged Actions**

- Login/logout
- Failed login attempts
- Order creation
- Order updates
- Payment events
- Refunds
- Voids
- Stock adjustments
- Promotion changes
- Settings changes
- Terminal registration
- User role changes
- Subscription changes

## **62.3 Requirements**

- Immutable logs
- Timestamped entries
- User ID
- Terminal ID
- Tenant ID
- IP address
- Event type
- Event payload
- Export capability
- Retention policies

# **63. Error Handling & Retry Logic**

## **63.1 Overview**

Defines how the system handles errors, retries, and fallback behavior.

## **63.2 Error Types**

- Validation errors
- Authentication errors
- Authorization errors
- Network errors
- Timeout errors
- Gateway errors
- Payment errors
- Stock errors
- Sync errors
- Printer errors

## **63.3 Retry Logic**

- Exponential backoff
- Max retry limits
- Dead‑letter queue
- Manual retry (admin)
- Automatic retry (system)

## **63.4 Requirements**

- Consistent error format
- Error codes
- Error messages
- Error logs
- Graceful degradation
- Offline fallback
- Circuit breaker patterns

# **64. System Constraints**

## **64.1 Performance Constraints**

- POS must load products in under 1 second
- KDS must update tickets in under 200ms
- Online ordering must load in under 2 seconds
- API must respond within 300ms (average)
- Event bus must deliver events within 100ms (average)

## **64.2 Scalability Constraints**

- Must support thousands of tenants
- Must support millions of orders
- Must support hundreds of concurrent terminals
- Must support high‑volume event streaming
- Must support horizontal scaling

## **64.3 Security Constraints**

- PCI‑DSS compliance for payments
- GDPR compliance for customer data
- AES‑256 encryption at rest
- TLS 1.2+ encryption in transit
- Strict RBAC
- Tenant isolation
- Secure password/PIN hashing

## **64.4 Reliability Constraints**

- 99.9% uptime
- Automatic failover
- Multi‑region support (future)
- Daily backups
- Disaster recovery plan
- Health checks
- Auto‑scaling

# **65. Glossary**

## **65.1 Terms**

- **Tenant** — A business using OmniOrder.
- **Store** — A physical or virtual location under a tenant.
- **Location** — A specific operational site (e.g., branch).
- **Terminal** — A POS, KDS, DOP, or Delivery device.
- **POS** — Point of Sale system.
- **DOP** — Dine‑In Order Pad.
- **KDS** — Kitchen Display System.
- **PWA** — Progressive Web App.
- **SKU** — Stock Keeping Unit.
- **RBAC** — Role‑Based Access Control.
- **API** — Application Programming Interface.
- **BFF** — Backend for Frontend.
- **ETL** — Extract, Transform, Load.
- **FIFO** — First In, First Out.
- **POD** — Proof of Delivery.
- **JWT** — JSON Web Token.
- **DLQ** — Dead‑Letter Queue.
- **CI/CD** — Continuous Integration / Continuous Deployment.
- **ESC/POS** — Printer command protocol.
- **GDPR** — General Data Protection Regulation.
- **PCI‑DSS** — Payment Card Industry Data Security Standard.

## **65.2 Channels**

- POS
- DOP
- KDS
- Online Ordering
- WhatsApp Ordering
- Delivery App
- Admin Dashboard

## **65.3 Order Types**

- Dine‑in
- Takeaway
- Delivery
- Collection
- Scheduled orders

## **65.4 Payment Types**

- Cash
- Card
- Wallet
- Online payment
- Split payment
- Partial payment
