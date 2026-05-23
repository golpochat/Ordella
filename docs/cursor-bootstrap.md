# --------------------------------------------------------

# 🟩 **3. CURSOR AI — BOOTSTRAP INSTRUCTIONS**

_(Paste into: OmniOrder — Documentation → Cursor AI — Bootstrap Instructions)_

# --------------------------------------------------------

This is the **exact document** Cursor AI needs to scaffold the entire system.

# # **Cursor AI — Bootstrap Instructions for OmniOrder**

## **Project Type**

Multi‑tenant SaaS
Backend: Node.js (NestJS) or Laravel
Frontend: Next.js
Database: PostgreSQL
Cache: Redis
Queue: RabbitMQ
Storage: S3

# ## **Folder Structure**

Code

`/apps
  /api
  /admin
  /pos
  /driver-app
  /customer-app
/packages
  /shared
  /ui
  /types
  /config`

# ## **Backend Structure (NestJS)**

Code

`/src
  /modules
    /auth
    /tenants
    /locations
    /catalog
    /orders
    /payments
    /delivery
    /customers
    /promotions
    /notifications
    /reports
    /integrations
    /audit
  /common
  /config
  /database`

# ## **Cursor Instructions**

### **1. Generate database models**

Use the ERD provided.

### **2. Generate controllers, services, repositories**

Follow the API Specification v1.0.

### **3. Implement multi‑tenant middleware**

Tenant ID must be resolved from:

- subdomain
- API key
- JWT

### **4. Implement RBAC**

Use roles + permissions tables.

### **5. Implement event bus**

Publish events for all order + payment + delivery changes.

### **6. Implement webhooks**

For payments + delivery partners.

### **7. Implement rate limiting**

Use Redis.

### **8. Implement audit logs**

Log every sensitive action.

### **9. Implement API versioning**

Prefix: /api/v1

### **10. Implement error envelope**

Use the standard format:

Code

`{
  success: false,
  error: { ... }
}`

# ## **Frontend Instructions (Next.js)**

### **Apps to generate**

- Admin Dashboard
- POS Interface
- Customer Web Ordering
- Driver App (web or mobile)

### **Use shared UI components**

Located in `/packages/ui`.

# ## **Deployment Instructions**

### **Local**

Docker Compose

### **Production**

- Docker
- Load balancer
- Auto‑scaling
- S3 for assets
- CDN for static files
