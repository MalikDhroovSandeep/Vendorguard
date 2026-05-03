Schema Design


1. ER Diagram Overview

The VendorGuard database uses PostgreSQL with Prisma ORM. The schema consists of 16 tables and 20 enumerated types, organised into four functional domains:

- User and Authentication (User, PasswordResetToken)
- Vendor Management (Vendor, VendorContact, VendorKYC)
- Procurement Lifecycle (PurchaseOrder, PurchaseOrderItem, Invoice, Dispute, Return, ReturnItem, CreditNote)
- AI and Analytics (VendorRiskScore, VendorPerformancePrediction, AnomalyAlert)
- System (AuditLog, Notification)


2. Entity-Relationship Summary

2.1 User and Authentication

User (users)
├── 1:1 → Vendor (a VENDOR-role user owns one vendor profile)
├── 1:N → PurchaseOrder (created orders)
├── 1:N → Dispute (raised and resolved disputes)
├── 1:N → VendorKYC (reviewed KYC applications)
├── 1:N → AnomalyAlert (investigated alerts)
├── 1:N → AuditLog (user activity trail)
├── 1:N → Notification (user notifications)
├── 1:N → PasswordResetToken (password reset requests)
└── 1:N → Return (created and approved returns)

2.2 Vendor Management

Vendor (vendors)
├── 1:1 ← User (linked user account)
├── 1:1 → VendorContact (contact details)
├── 1:1 → VendorKYC (KYC submission)
├── 1:N → PurchaseOrder (received orders)
├── 1:N → Invoice (submitted invoices)
├── 1:N → Dispute (associated disputes)
├── 1:N → Return (return requests)
├── 1:N → CreditNote (issued credit notes)
├── 1:N → VendorRiskScore (risk score history)
├── 1:N → VendorPerformancePrediction (ML predictions)
└── 1:N → AnomalyAlert (flagged anomalies)

2.3 Procurement Lifecycle

PurchaseOrder (purchase_orders)
├── N:1 → Vendor
├── N:1 → User (creator)
├── 1:N → PurchaseOrderItem (line items)
├── 1:N → Invoice (linked invoices)
├── 1:N → Dispute (raised disputes)
└── 1:N → Return (return requests)

Invoice (invoices)
├── N:1 → PurchaseOrder (optional)
├── N:1 → Vendor
└── 1:N → Dispute

Dispute (disputes)
├── N:1 → PurchaseOrder (optional)
├── N:1 → Invoice (optional)
├── N:1 → Vendor
├── N:1 → User (raiser)
└── N:1 → User (resolver, optional)

Return (returns)
├── N:1 → PurchaseOrder
├── N:1 → Vendor
├── N:1 → User (creator)
├── N:1 → User (approver, optional)
├── 1:N → ReturnItem (line items)
└── 1:1 → CreditNote (issued on approval)


3. Table Schemas

3.1 users

| Column | Data Type | Constraints |
|--------|-----------|-------------|
| id | UUID | PK, default: uuid() |
| email | VARCHAR | NOT NULL, UNIQUE |
| password | VARCHAR | NOT NULL |
| name | VARCHAR | NOT NULL |
| role | ENUM(UserRole) | NOT NULL |
| status | ENUM(UserStatus) | NOT NULL, default: ACTIVE |
| phone | VARCHAR | NULLABLE |
| department | VARCHAR | NULLABLE |
| preferences | JSON | NULLABLE |
| createdAt | TIMESTAMP | NOT NULL, default: now() |
| updatedAt | TIMESTAMP | NOT NULL, auto-updated |

3.2 password_reset_tokens

| Column | Data Type | Constraints |
|--------|-----------|-------------|
| id | UUID | PK, default: uuid() |
| token | VARCHAR | NOT NULL, UNIQUE |
| userId | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE |
| expiresAt | TIMESTAMP | NOT NULL |
| used | BOOLEAN | NOT NULL, default: false |
| createdAt | TIMESTAMP | NOT NULL, default: now() |

3.3 vendors

| Column | Data Type | Constraints |
|--------|-----------|-------------|
| id | UUID | PK, default: uuid() |
| userId | UUID | NOT NULL, UNIQUE, FK → users(id) ON DELETE CASCADE |
| businessName | VARCHAR | NOT NULL |
| businessType | ENUM(BusinessType) | NOT NULL |
| industryCategory | VARCHAR | NOT NULL |
| businessDescription | TEXT | NULLABLE |
| yearEstablished | INTEGER | NULLABLE |
| kycStatus | ENUM(KYCStatus) | NOT NULL, default: PENDING |
| riskScore | DECIMAL(5,2) | NULLABLE |
| riskCategory | ENUM(RiskCategory) | NULLABLE |
| status | ENUM(VendorStatus) | NOT NULL, default: ACTIVE |
| createdAt | TIMESTAMP | NOT NULL, default: now() |
| updatedAt | TIMESTAMP | NOT NULL, auto-updated |

3.4 vendor_contacts

| Column | Data Type | Constraints |
|--------|-----------|-------------|
| id | UUID | PK, default: uuid() |
| vendorId | UUID | NOT NULL, UNIQUE, FK → vendors(id) ON DELETE CASCADE |
| contactName | VARCHAR | NOT NULL |
| designation | VARCHAR | NULLABLE |
| email | VARCHAR | NOT NULL |
| phone | VARCHAR | NOT NULL |
| address | VARCHAR | NOT NULL |
| city | VARCHAR | NOT NULL |
| state | VARCHAR | NOT NULL |
| pinCode | VARCHAR | NOT NULL |
| createdAt | TIMESTAMP | NOT NULL, default: now() |
| updatedAt | TIMESTAMP | NOT NULL, auto-updated |

3.5 vendor_kyc

| Column | Data Type | Constraints |
|--------|-----------|-------------|
| id | UUID | PK, default: uuid() |
| vendorId | UUID | NOT NULL, UNIQUE, FK → vendors(id) ON DELETE CASCADE |
| gstNumber | VARCHAR | NULLABLE |
| panNumber | VARCHAR | NULLABLE |
| businessDocType | ENUM(BusinessDocType) | NULLABLE |
| businessDocNumber | VARCHAR | NULLABLE |
| businessDocAuthority | VARCHAR | NULLABLE |
| businessDocIssueDate | TIMESTAMP | NULLABLE |
| submittedAt | TIMESTAMP | NULLABLE |
| reviewedAt | TIMESTAMP | NULLABLE |
| reviewedById | UUID | NULLABLE, FK → users(id) |
| rejectionReason | TEXT | NULLABLE |
| gstDocument | VARCHAR | NULLABLE (Cloudinary URL) |
| panDocument | VARCHAR | NULLABLE (Cloudinary URL) |
| businessDocument | VARCHAR | NULLABLE (Cloudinary URL) |
| createdAt | TIMESTAMP | NOT NULL, default: now() |
| updatedAt | TIMESTAMP | NOT NULL, auto-updated |

3.6 purchase_orders

| Column | Data Type | Constraints |
|--------|-----------|-------------|
| id | UUID | PK, default: uuid() |
| orderNumber | VARCHAR | NOT NULL, UNIQUE |
| vendorId | UUID | NOT NULL, FK → vendors(id) |
| createdById | UUID | NOT NULL, FK → users(id) |
| title | VARCHAR | NOT NULL |
| description | TEXT | NULLABLE |
| amount | DECIMAL(15,2) | NOT NULL |
| currency | VARCHAR | NOT NULL, default: INR |
| status | ENUM(OrderStatus) | NOT NULL, default: DRAFT |
| expectedDelivery | TIMESTAMP | NULLABLE |
| actualDelivery | TIMESTAMP | NULLABLE |
| deliveryStatus | ENUM(DeliveryStatus) | NOT NULL, default: PENDING |
| createdAt | TIMESTAMP | NOT NULL, default: now() |
| updatedAt | TIMESTAMP | NOT NULL, auto-updated |

3.7 purchase_order_items

| Column | Data Type | Constraints |
|--------|-----------|-------------|
| id | UUID | PK, default: uuid() |
| orderId | UUID | NOT NULL, FK → purchase_orders(id) ON DELETE CASCADE |
| itemName | VARCHAR | NOT NULL |
| quantity | INTEGER | NOT NULL |
| unitPrice | DECIMAL(15,2) | NOT NULL |
| totalPrice | DECIMAL(15,2) | NOT NULL |
| createdAt | TIMESTAMP | NOT NULL, default: now() |

3.8 invoices

| Column | Data Type | Constraints |
|--------|-----------|-------------|
| id | UUID | PK, default: uuid() |
| invoiceNumber | VARCHAR | NOT NULL, UNIQUE |
| orderId | UUID | NULLABLE, FK → purchase_orders(id) |
| vendorId | UUID | NOT NULL, FK → vendors(id) |
| amount | DECIMAL(15,2) | NOT NULL |
| taxAmount | DECIMAL(15,2) | NOT NULL, default: 0 |
| totalAmount | DECIMAL(15,2) | NOT NULL |
| status | ENUM(InvoiceStatus) | NOT NULL, default: PENDING |
| dueDate | TIMESTAMP | NULLABLE |
| paidDate | TIMESTAMP | NULLABLE |
| createdAt | TIMESTAMP | NOT NULL, default: now() |
| updatedAt | TIMESTAMP | NOT NULL, auto-updated |

3.9 disputes

| Column | Data Type | Constraints |
|--------|-----------|-------------|
| id | UUID | PK, default: uuid() |
| disputeNumber | VARCHAR | NOT NULL, UNIQUE |
| orderId | UUID | NULLABLE, FK → purchase_orders(id) |
| invoiceId | UUID | NULLABLE, FK → invoices(id) |
| vendorId | UUID | NOT NULL, FK → vendors(id) |
| raisedById | UUID | NOT NULL, FK → users(id) |
| category | ENUM(DisputeCategory) | NOT NULL |
| priority | ENUM(DisputePriority) | NOT NULL, default: MEDIUM |
| subject | VARCHAR | NOT NULL |
| description | TEXT | NULLABLE |
| amount | DECIMAL(15,2) | NULLABLE |
| status | ENUM(DisputeStatus) | NOT NULL, default: OPEN |
| resolution | TEXT | NULLABLE |
| resolvedById | UUID | NULLABLE, FK → users(id) |
| resolvedAt | TIMESTAMP | NULLABLE |
| vendorResponse | TEXT | NULLABLE |
| vendorRespondedAt | TIMESTAMP | NULLABLE |
| createdAt | TIMESTAMP | NOT NULL, default: now() |
| updatedAt | TIMESTAMP | NOT NULL, auto-updated |

3.10 vendor_risk_scores

| Column | Data Type | Constraints |
|--------|-----------|-------------|
| id | UUID | PK, default: uuid() |
| vendorId | UUID | NOT NULL, FK → vendors(id) ON DELETE CASCADE |
| riskScore | DECIMAL(5,2) | NOT NULL |
| riskCategory | ENUM(RiskCategory) | NOT NULL |
| deliveryScore | DECIMAL(5,2) | NULLABLE |
| disputeScore | DECIMAL(5,2) | NULLABLE |
| paymentScore | DECIMAL(5,2) | NULLABLE |
| fulfillmentScore | DECIMAL(5,2) | NULLABLE |
| calculatedAt | TIMESTAMP | NOT NULL, default: now() |
| createdAt | TIMESTAMP | NOT NULL, default: now() |

3.11 vendor_performance_predictions

| Column | Data Type | Constraints |
|--------|-----------|-------------|
| id | UUID | PK, default: uuid() |
| vendorId | UUID | NOT NULL, FK → vendors(id) ON DELETE CASCADE |
| predictionType | ENUM(PredictionType) | NOT NULL |
| probability | DECIMAL(5,2) | NOT NULL |
| predictionPeriod | VARCHAR | NOT NULL |
| details | TEXT | NULLABLE |
| predictedAt | TIMESTAMP | NOT NULL, default: now() |
| createdAt | TIMESTAMP | NOT NULL, default: now() |

3.12 anomaly_alerts

| Column | Data Type | Constraints |
|--------|-----------|-------------|
| id | UUID | PK, default: uuid() |
| vendorId | UUID | NOT NULL, FK → vendors(id) ON DELETE CASCADE |
| alertType | ENUM(AlertType) | NOT NULL |
| severity | ENUM(AlertSeverity) | NOT NULL |
| title | VARCHAR | NOT NULL |
| description | TEXT | NULLABLE |
| status | ENUM(AlertStatus) | NOT NULL, default: NEW |
| investigatedById | UUID | NULLABLE, FK → users(id) |
| investigatedAt | TIMESTAMP | NULLABLE |
| notes | TEXT | NULLABLE |
| createdAt | TIMESTAMP | NOT NULL, default: now() |
| updatedAt | TIMESTAMP | NOT NULL, auto-updated |

3.13 audit_logs

| Column | Data Type | Constraints |
|--------|-----------|-------------|
| id | UUID | PK, default: uuid() |
| userId | UUID | NULLABLE, FK → users(id) |
| action | VARCHAR | NOT NULL |
| entityType | VARCHAR | NOT NULL |
| entityId | UUID | NULLABLE |
| oldValues | JSON | NULLABLE |
| newValues | JSON | NULLABLE |
| ipAddress | VARCHAR | NULLABLE |
| userAgent | VARCHAR | NULLABLE |
| createdAt | TIMESTAMP | NOT NULL, default: now() |

3.14 notifications

| Column | Data Type | Constraints |
|--------|-----------|-------------|
| id | UUID | PK, default: uuid() |
| userId | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE |
| type | ENUM(NotificationType) | NOT NULL |
| title | VARCHAR | NOT NULL |
| message | TEXT | NOT NULL |
| link | VARCHAR | NULLABLE |
| isRead | BOOLEAN | NOT NULL, default: false |
| createdAt | TIMESTAMP | NOT NULL, default: now() |

3.15 returns

| Column | Data Type | Constraints |
|--------|-----------|-------------|
| id | UUID | PK, default: uuid() |
| returnNumber | VARCHAR | NOT NULL, UNIQUE |
| orderId | UUID | NOT NULL, FK → purchase_orders(id) |
| vendorId | UUID | NOT NULL, FK → vendors(id) |
| createdById | UUID | NOT NULL, FK → users(id) |
| reason | ENUM(ReturnReason) | NOT NULL |
| status | ENUM(ReturnStatus) | NOT NULL, default: PENDING |
| description | TEXT | NULLABLE |
| totalQuantity | INTEGER | NOT NULL |
| totalAmount | DECIMAL(15,2) | NOT NULL |
| vendorResponse | TEXT | NULLABLE |
| vendorRespondedAt | TIMESTAMP | NULLABLE |
| claimType | ENUM(ClaimType) | NULLABLE |
| approvedAmount | DECIMAL(15,2) | NULLABLE |
| approvedById | UUID | NULLABLE, FK → users(id) |
| approvedAt | TIMESTAMP | NULLABLE |
| rejectionReason | TEXT | NULLABLE |
| createdAt | TIMESTAMP | NOT NULL, default: now() |
| updatedAt | TIMESTAMP | NOT NULL, auto-updated |

3.16 return_items

| Column | Data Type | Constraints |
|--------|-----------|-------------|
| id | UUID | PK, default: uuid() |
| returnId | UUID | NOT NULL, FK → returns(id) ON DELETE CASCADE |
| itemName | VARCHAR | NOT NULL |
| quantity | INTEGER | NOT NULL |
| unitPrice | DECIMAL(15,2) | NOT NULL |
| totalPrice | DECIMAL(15,2) | NOT NULL |
| reason | ENUM(ReturnReason) | NOT NULL |
| description | TEXT | NULLABLE |
| createdAt | TIMESTAMP | NOT NULL, default: now() |

3.17 credit_notes

| Column | Data Type | Constraints |
|--------|-----------|-------------|
| id | UUID | PK, default: uuid() |
| creditNumber | VARCHAR | NOT NULL, UNIQUE |
| returnId | UUID | NOT NULL, UNIQUE, FK → returns(id) |
| vendorId | UUID | NOT NULL, FK → vendors(id) |
| amount | DECIMAL(15,2) | NOT NULL |
| notes | TEXT | NULLABLE |
| issuedAt | TIMESTAMP | NOT NULL, default: now() |


4. Enumerated Types

| Enum Name | Values |
|-----------|--------|
| UserRole | ADMIN, INTERNAL_USER, VENDOR |
| UserStatus | ACTIVE, INACTIVE, SUSPENDED |
| BusinessType | INDIVIDUAL, PARTNERSHIP, PVT_LTD, LLP |
| KYCStatus | PENDING, SUBMITTED, UNDER_REVIEW, VERIFIED, REJECTED |
| VendorStatus | ACTIVE, INACTIVE, BLACKLISTED |
| RiskCategory | LOW, MEDIUM, HIGH |
| OrderStatus | DRAFT, PENDING, APPROVED, IN_PROGRESS, DELIVERED, COMPLETED, CANCELLED |
| DeliveryStatus | PENDING, PARTIAL, COMPLETED, DELAYED |
| InvoiceStatus | PENDING, APPROVED, PAID, REJECTED, OVERDUE |
| DisputeCategory | DELIVERY, QUALITY, PAYMENT, PRICING, OTHER |
| DisputePriority | LOW, MEDIUM, HIGH, CRITICAL |
| DisputeStatus | OPEN, UNDER_REVIEW, ESCALATED, RESOLVED, CLOSED |
| BusinessDocType | REGISTRATION_CERT, TRADE_LICENSE, UDYAM |
| PredictionType | DELIVERY_DELAY, DISPUTE_RISK, QUALITY_ISSUE |
| AlertType | INVOICE_ANOMALY, DELIVERY_PATTERN, DISPUTE_PATTERN, FRAUD_SUSPECTED |
| AlertSeverity | LOW, MEDIUM, HIGH, CRITICAL |
| AlertStatus | NEW, UNDER_INVESTIGATION, DISMISSED, CONFIRMED |
| NotificationType | KYC_SUBMITTED, KYC_APPROVED, KYC_REJECTED, ORDER_CREATED, ORDER_APPROVED, ORDER_DELIVERED, INVOICE_SUBMITTED, INVOICE_APPROVED, INVOICE_PAID, INVOICE_REJECTED, DISPUTE_CREATED, DISPUTE_RESOLVED, SYSTEM_ALERT, RETURN_CREATED, RETURN_APPROVED, RETURN_REJECTED, CREDIT_NOTE_ISSUED |
| ReturnReason | DEFECTIVE, DAMAGED_IN_TRANSIT, WRONG_ITEM, QUALITY_ISSUE, QUANTITY_MISMATCH, EXPIRED, NOT_AS_DESCRIBED, OTHER |
| ReturnStatus | PENDING, VENDOR_REVIEW, APPROVED, REJECTED, IN_TRANSIT, RECEIVED, CREDIT_ISSUED, CLOSED |
| ClaimType | REFUND, REPLACEMENT, CREDIT_NOTE, PARTIAL_REFUND |


5. Foreign Key Relationships Summary

| Source Table | Column | References | On Delete |
|-------------|--------|-----------|-----------|
| password_reset_tokens | userId | users(id) | CASCADE |
| vendors | userId | users(id) | CASCADE |
| vendor_contacts | vendorId | vendors(id) | CASCADE |
| vendor_kyc | vendorId | vendors(id) | CASCADE |
| vendor_kyc | reviewedById | users(id) | SET NULL |
| purchase_orders | vendorId | vendors(id) | RESTRICT |
| purchase_orders | createdById | users(id) | RESTRICT |
| purchase_order_items | orderId | purchase_orders(id) | CASCADE |
| invoices | orderId | purchase_orders(id) | SET NULL |
| invoices | vendorId | vendors(id) | RESTRICT |
| disputes | orderId | purchase_orders(id) | SET NULL |
| disputes | invoiceId | invoices(id) | SET NULL |
| disputes | vendorId | vendors(id) | RESTRICT |
| disputes | raisedById | users(id) | RESTRICT |
| disputes | resolvedById | users(id) | SET NULL |
| vendor_risk_scores | vendorId | vendors(id) | CASCADE |
| vendor_performance_predictions | vendorId | vendors(id) | CASCADE |
| anomaly_alerts | vendorId | vendors(id) | CASCADE |
| anomaly_alerts | investigatedById | users(id) | SET NULL |
| audit_logs | userId | users(id) | SET NULL |
| notifications | userId | users(id) | CASCADE |
| returns | orderId | purchase_orders(id) | RESTRICT |
| returns | vendorId | vendors(id) | RESTRICT |
| returns | createdById | users(id) | RESTRICT |
| returns | approvedById | users(id) | SET NULL |
| return_items | returnId | returns(id) | CASCADE |
| credit_notes | returnId | returns(id) | RESTRICT |
| credit_notes | vendorId | vendors(id) | RESTRICT |


6. Design Decisions

6.1 UUID Primary Keys
All tables use UUID primary keys instead of auto-incrementing integers. This prevents enumeration attacks and simplifies distributed data handling.

6.2 Soft Delete via Status Enums
Entities use status enums (ACTIVE / INACTIVE / SUSPENDED / BLACKLISTED) instead of hard deletes, preserving audit trails and historical records.

6.3 Cascade Deletion Strategy
- CASCADE: Child records that have no meaning without the parent (e.g., order items, return items, contact details, notifications, password reset tokens, risk score history).
- RESTRICT / SET NULL: Records that should be preserved for audit purposes even if the parent is removed (e.g., disputes reference to users, invoices reference to orders).

6.4 Decimal Precision
Monetary fields use DECIMAL(15,2) to support values up to 9,999,999,999,999.99 without floating-point rounding errors. Score fields use DECIMAL(5,2) for range 0.00–999.99 (typically 0–100).

6.5 JSON Fields
Used sparingly for semi-structured data (user notification preferences, audit log old/new values) where a strict relational schema would add unnecessary complexity.

6.6 Normalisation Level
The schema follows Third Normal Form (3NF). Vendor contact details and KYC data are separated into dedicated tables to avoid null-heavy rows in the main vendors table and to support independent update cycles.
