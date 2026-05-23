# --------------------------------------------------------

# 🟩 **1. FULL DATABASE SCHEMA (ERD)**

_(Paste into: OmniOrder — Documentation → Database Schema (ERD))_

# --------------------------------------------------------

Below is the **complete relational schema** for OmniOrder v1.0.

I’m giving it to you in a **clean, enterprise‑grade, implementation‑ready** format.

# ## **1.1 Core Tables**

### **tenants**

- id (uuid, pk)
- name
- status
- created_at
- updated_at

### **locations**

- id
- tenant_id (fk → tenants)
- name
- address
- timezone
- status
- created_at
- updated_at

### **users**

- id
- tenant_id
- name
- email
- password_hash
- role_id
- mfa_enabled
- created_at
- updated_at

### **roles**

- id
- tenant_id
- name
- created_at

### **permissions**

- id
- key
- description

### **role_permissions**

- role_id
- permission_id

# ## **1.2 Catalog Tables**

### **products**

- id
- tenant_id
- name
- description
- category_id
- price
- status
- created_at

### **variants**

- id
- product_id
- name
- price_delta
- sku
- created_at

### **modifiers**

- id
- tenant_id
- name
- type (single/multiple)
- required (bool)

### **modifier_options**

- id
- modifier_id
- name
- price_delta

### **addons**

- id
- tenant_id
- name
- price

### **categories**

- id
- tenant_id
- name

# ## **1.3 Stock Tables**

### **stock_items**

- id
- tenant_id
- name
- sku
- unit
- created_at

### **stock_movements**

- id
- stock_item_id
- type (in/out/adjustment)
- quantity
- reference_type
- reference_id
- created_at

### **stock_transfers**

- id
- from_location_id
- to_location_id
- status
- created_at

# ## **1.4 Orders Tables**

### **orders**

- id
- tenant_id
- location_id
- customer_id
- order_type
- status
- subtotal
- tax
- total
- created_at

### **order_items**

- id
- order_id
- product_id
- variant_id
- quantity
- price
- created_at

### **order_item_modifiers**

- id
- order_item_id
- modifier_option_id
- price_delta

### **order_item_addons**

- id
- order_item_id
- addon_id
- price

### **order_notes**

- id
- order_id
- user_id
- note
- created_at

### **order_events**

- id
- order_id
- event_type
- metadata (json)
- created_at

# ## **1.5 Payments Tables**

### **payments**

- id
- order_id
- provider
- method
- amount
- status
- created_at

### **refunds**

- id
- payment_id
- amount
- reason
- created_at

# ## **1.6 Delivery Tables**

### **deliveries**

- id
- order_id
- driver_id
- status
- eta
- created_at

### **drivers**

- id
- tenant_id
- name
- phone
- status

### **delivery_tracking**

- id
- delivery_id
- lat
- lng
- timestamp

# ## **1.7 Customers Tables**

### **customers**

- id
- tenant_id
- name
- phone
- email
- created_at

### **customer_addresses**

- id
- customer_id
- label
- address
- lat
- lng

### **loyalty**

- id
- customer_id
- points

# ## **1.8 Promotions Tables**

### **promotions**

- id
- tenant_id
- name
- type
- value
- start_date
- end_date

### **coupons**

- id
- tenant_id
- code
- discount_type
- discount_value
- usage_limit

# ## **1.9 Notifications Tables**

### **notifications**

- id
- tenant_id
- type
- user_id
- payload (json)
- status
- created_at

### **notification_templates**

- id
- tenant_id
- name
- channel
- content (json)

# ## **1.10 Audit & Security Tables**

### **audit_logs**

- id
- tenant_id
- user_id
- event_type
- metadata (json)
- created_at

### **security_events**

- id
- tenant_id
- event_type
- metadata (json)
- created_at
