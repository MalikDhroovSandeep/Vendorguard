# VendorGuard - Project Documentation

## Chapter 5: Program Listing

---

## 5.1 Cost Estimation

### 5.1.1 Project Overview

**Project Name:** VendorGuard - AI-Powered Vendor Risk Management System  
**Project Type:** Enterprise Web Application  
**Development Period:** December 2025 - January 2026  
**Technology Stack:** Next.js 16, React 19, TypeScript, PostgreSQL, Prisma ORM, Tailwind CSS

---

### 5.1.2 Function Point Analysis

Function Point (FP) Analysis is used to measure the functional size of the software based on user requirements. The VendorGuard system is analyzed using the standard Function Point calculation methodology.

---

#### Domain Characteristics Table

| **MEASUREMENT PARAMETER** | **COUNT** | **WEIGHTING FACTOR** |
|---------------------------|-----------|---------------------|
| | **(value >= 0)** | **Simple** \| **Average** \| **Complex** |
| Number of User Inputs | 38 | ○ | ● | ○ |
| Number of User Outputs | 26 | ○ | ● | ○ |
| Number of User Inquiries | 32 | ○ | ● | ○ |
| Number of Files | 12 | ○ | ● | ○ |
| Number of External Interfaces | 5 | ○ | ● | ○ |

**Weighting Factor Values:**
| Parameter | Simple | Average | Complex |
|-----------|--------|---------|---------|
| User Inputs | 3 | 4 | 6 |
| User Outputs | 4 | 5 | 7 |
| User Inquiries | 3 | 4 | 6 |
| Files | 7 | 10 | 15 |
| External Interfaces | 5 | 7 | 10 |

**Unadjusted Function Point Calculation:**

| Measurement Parameter | Count | Weighting Factor | Result |
|-----------------------|-------|------------------|--------|
| Number of User Inputs | 38 | × 4 (Average) | 152 |
| Number of User Outputs | 26 | × 5 (Average) | 130 |
| Number of User Inquiries | 32 | × 4 (Average) | 128 |
| Number of Files | 12 | × 10 (Average) | 120 |
| Number of External Interfaces | 5 | × 7 (Average) | 35 |
| **Unadjusted Function Points (UFP)** | | | **565** |

---

#### Complexity Adjustment Table

| **ITEM** | **COMPLEXITY ADJUSTMENT QUESTIONS** | **SCALE (0-5)** |
|----------|-------------------------------------|-----------------|
| | | *0 = No influence, 5 = Essential* |
| 1 | Does the system require reliable backup and recovery? | 3 |
| 2 | Are data communications required? | 5 |
| 3 | Are there distributed processing functions? | 4 |
| 4 | Is performance critical? | 4 |
| 5 | Will the system run in an existing, heavily utilized operational environment? | 3 |
| 6 | Does the system require on-line data entry? | 5 |
| 7 | Does the on-line data entry require the input transaction to be built over multiple screens or operations? | 4 |
| 8 | Are the master files updated on-line? | 5 |
| 9 | Are the inputs, outputs, files or inquiries complex? | 4 |
| 10 | Is the internal processing complex? | 4 |
| 11 | Is the code to be designed reusable? | 4 |
| 12 | Are conversion and installation included in the design? | 3 |
| 13 | Is the system designed for multiple installations in different organizations? | 3 |
| 14 | Is the application designed to facilitate change and ease of use by the user? | 4 |
| | **Total Degree of Influence (TDI)** | **55** |

---

#### Function Point Calculation

**Step 1: Calculate Value Adjustment Factor (VAF)**
```
VAF = 0.65 + (0.01 × TDI)
VAF = 0.65 + (0.01 × 55)
VAF = 0.65 + 0.55
VAF = 1.20
```

**Step 2: Calculate Adjusted Function Points (AFP)**
```
AFP = UFP × VAF
AFP = 565 × 1.20
AFP = 678.0
```

---

### **RESULT**

| | |
|---|---|
| **PROJECT FUNCTION POINTS** | **678.0** |

---

### 5.1.3 Effort Estimation from Function Points

Using industry standard productivity rates for web application development:

| Language/Technology | Hours per FP | FP Count | Total Hours |
|---------------------|-------------|----------|-------------|
| TypeScript/React (Experienced) | 8 | 678 | 5,424 |
| TypeScript/React (Average) | 12 | 678 | 8,136 |

**Selected Rate:** 10 hours/FP (considering mixed experience team)

```
Total Effort = 678 FP × 10 hours/FP = 6,780 hours
Person-Days = 6,780 / 8 = 847.5 ≈ 848 Person-Days
Person-Months = 848 / 22 = 38.5 ≈ 39 Person-Months
```

**With a team of 2 developers (accelerated delivery):**
```
Development Duration = 39 / 2 = 19.5 months (theoretical)
Actual Duration (with parallel work) = ~2.5-3 months (accelerated delivery with overtime)
```

---

### 5.1.4 Function Point Summary

| Metric | Value |
|--------|-------|
| **Unadjusted Function Points (UFP)** | 565 FP |
| **Total Degree of Influence (TDI)** | 55 |
| **Value Adjustment Factor (VAF)** | 1.20 |
| **Adjusted Function Points (AFP)** | 678 FP |
| **Effort (Hours)** | 6,780 hours |
| **Effort (Person-Days)** | 848 days |
| **Effort (Person-Months)** | 39 months |
| **Team Size** | 2 developers |
| **Actual Duration** | ~2.5-3 months |

---

### 5.1.5 Resource Cost Estimation

Based on the Function Point analysis, the resource requirements are:

| Resource | Rate (₹/Month) | Duration | Total Cost (₹) |
|----------|----------------|----------|----------------|
| Senior Developer (1) | 60,000 | 3 months | 1,80,000 |
| Junior Developer (1) | 35,000 | 3 months | 1,05,000 |
| UI/UX Designer (Part-time) | 25,000 | 1 month | 25,000 |
| Project Manager (Part-time) | 40,000 | 1 month | 40,000 |
| **Subtotal (Human Resources)** | | | **3,50,000** |

### 5.1.6 Infrastructure Cost Estimation

| Infrastructure | Monthly Cost (₹) | Duration | Total Cost (₹) |
|----------------|------------------|----------|----------------|
| PostgreSQL Database (Neon/Supabase) | 1,500 | 3 months | 4,500 |
| Vercel Hosting (Pro) | 1,600 | 3 months | 4,800 |
| Domain & SSL Certificate | 1,000 | 1 year | 1,000 |
| Development Tools & Licenses | 2,000 | One-time | 2,000 |
| **Subtotal (Infrastructure)** | | | **12,300** |

### 5.1.7 Total Project Cost Summary

| Category | Cost (₹) |
|----------|----------|
| Human Resources | 3,50,000 |
| Infrastructure | 12,300 |
| Contingency (10%) | 36,230 |
| **Grand Total** | **3,98,530** |

### 5.1.8 Cost per Function Point

```
Cost per FP = Total Cost / AFP
Cost per FP = ₹3,98,530 / 678 FP
Cost per FP = ₹587.66 per Function Point
```

This is within the industry standard range of ₹500 - ₹1,500 per FP for web applications in India.

---

## 5.2 Schema Design

### 5.2.1 Overview

The **VendorGuard** database schema is designed to support a comprehensive AI-powered vendor risk management system. The schema follows a relational database model implemented using **PostgreSQL** with **Prisma ORM** for type-safe database access.

#### Design Principles

1. **Normalization**: Tables are normalized to 3NF to minimize data redundancy
2. **Referential Integrity**: Foreign key constraints ensure data consistency
3. **Audit Trail**: Timestamps and audit logs track all changes
4. **Scalability**: UUID primary keys and indexed columns for performance
5. **Flexibility**: JSONB fields for extensible metadata storage

#### Schema Statistics

| Metric | Count |
|--------|-------|
| Total Tables | 12 |
| Enumeration Types | 16 |
| Foreign Key Relationships | 18 |
| Unique Constraints | 8 |

---

### 5.2.2 Entity-Relationship Diagram

```
                                    ┌─────────────────────┐
                                    │       USER          │
                                    │  (Authentication)   │
                                    └──────────┬──────────┘
                                               │ 1:1
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
         ┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
         │     VENDOR       │       │   AUDIT_LOG      │       │   ANOMALY_ALERT  │
         │  (Core Entity)   │       │   (Tracking)     │       │   (AI Alerts)    │
         └────────┬─────────┘       └──────────────────┘       └──────────────────┘
                  │
    ┌─────────────┼─────────────┬─────────────────────┐
    │             │             │                     │
    ▼             ▼             ▼                     ▼
┌─────────┐ ┌──────────┐ ┌──────────────┐   ┌─────────────────┐
│ VENDOR  │ │ VENDOR   │ │  PURCHASE    │   │ VENDOR_RISK     │
│ CONTACT │ │  KYC     │ │   ORDER      │   │   SCORE         │
└─────────┘ └──────────┘ └──────┬───────┘   └─────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌───────────┐    ┌───────────┐    ┌───────────────────┐
       │ PO_ITEM   │    │  INVOICE  │    │     DISPUTE       │
       └───────────┘    └───────────┘    └───────────────────┘
```

---

### 5.2.3 Table Descriptions with Purpose and Attributes

---

#### **Table 1: User**

**Purpose:** Stores authentication and profile information for all system users including Admins, Internal Users, and Vendors. This is the central identity table that controls access to the system.

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid | Unique identifier for each user |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User's email address for login |
| `password` | VARCHAR(255) | NOT NULL | Bcrypt-hashed password |
| `name` | VARCHAR(255) | NOT NULL | Full name of the user |
| `role` | ENUM(UserRole) | NOT NULL | Role: ADMIN, INTERNAL_USER, or VENDOR |
| `status` | ENUM(UserStatus) | DEFAULT 'ACTIVE' | Account status: ACTIVE, INACTIVE, SUSPENDED |
| `phone` | VARCHAR(20) | NULLABLE | Contact phone number |
| `department` | VARCHAR(100) | NULLABLE | Department (for internal users) |
| `preferences` | JSONB | NULLABLE | User preferences (notifications, AI settings) |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| `updatedAt` | TIMESTAMP | AUTO UPDATE | Last modification timestamp |

**Relationships:**
- One-to-One with `Vendor` (if role is VENDOR)
- One-to-Many with `PurchaseOrder` (as creator)
- One-to-Many with `Dispute` (as raiser/resolver)
- One-to-Many with `AuditLog` (activity tracking)

---

#### **Table 2: Vendor**

**Purpose:** Stores business profile information for vendor organizations. This table links vendor users to their business details and tracks their verification status and risk profile.

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid | Unique vendor identifier |
| `userId` | UUID | FOREIGN KEY, UNIQUE | Reference to User table |
| `businessName` | VARCHAR(255) | NOT NULL | Registered business name |
| `businessType` | ENUM(BusinessType) | NOT NULL | Type: INDIVIDUAL, PARTNERSHIP, PVT_LTD, LLP |
| `industryCategory` | VARCHAR(100) | NOT NULL | Industry sector (IT, Manufacturing, etc.) |
| `businessDescription` | TEXT | NULLABLE | Detailed business description |
| `yearEstablished` | INTEGER | NULLABLE | Year the business was founded |
| `kycStatus` | ENUM(KYCStatus) | DEFAULT 'PENDING' | KYC verification status |
| `riskScore` | DECIMAL(5,2) | NULLABLE | AI-calculated risk score (0-100) |
| `riskCategory` | ENUM(RiskCategory) | NULLABLE | Risk level: LOW, MEDIUM, HIGH |
| `status` | ENUM(VendorStatus) | DEFAULT 'ACTIVE' | Operational status |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Registration timestamp |
| `updatedAt` | TIMESTAMP | AUTO UPDATE | Last update timestamp |

**Relationships:**
- One-to-One with `User` (vendor owner)
- One-to-One with `VendorContact`
- One-to-One with `VendorKYC`
- One-to-Many with `PurchaseOrder`
- One-to-Many with `Invoice`
- One-to-Many with `Dispute`
- One-to-Many with `VendorRiskScore`

---

#### **Table 3: VendorContact**

**Purpose:** Stores contact person details and physical address information for each vendor. Separated from the Vendor table to allow for potential multiple contacts in future and maintain data organization.

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid | Unique contact record ID |
| `vendorId` | UUID | FOREIGN KEY, UNIQUE | Reference to Vendor table |
| `contactName` | VARCHAR(255) | NOT NULL | Primary contact person name |
| `designation` | VARCHAR(100) | NULLABLE | Job title/designation |
| `email` | VARCHAR(255) | NOT NULL | Contact email address |
| `phone` | VARCHAR(20) | NOT NULL | Contact phone number |
| `address` | TEXT | NOT NULL | Street address |
| `city` | VARCHAR(100) | NOT NULL | City name |
| `state` | VARCHAR(100) | NOT NULL | State/Province |
| `pinCode` | VARCHAR(10) | NOT NULL | Postal/ZIP code |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Record creation time |
| `updatedAt` | TIMESTAMP | AUTO UPDATE | Last modification time |

**Relationships:**
- One-to-One with `Vendor`

---

#### **Table 4: VendorKYC**

**Purpose:** Stores Know Your Customer (KYC) verification documents and status for vendors. This table maintains tax registration details and business documents required for vendor verification.

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid | Unique KYC record ID |
| `vendorId` | UUID | FOREIGN KEY, UNIQUE | Reference to Vendor table |
| `gstNumber` | VARCHAR(15) | NULLABLE | GST registration number |
| `panNumber` | VARCHAR(10) | NULLABLE | PAN card number |
| `businessDocType` | ENUM(BusinessDocType) | NULLABLE | Document type: REGISTRATION_CERT, TRADE_LICENSE, UDYAM |
| `businessDocNumber` | VARCHAR(50) | NULLABLE | Document registration number |
| `businessDocAuthority` | VARCHAR(100) | NULLABLE | Issuing authority name |
| `businessDocIssueDate` | DATE | NULLABLE | Document issue date |
| `submittedAt` | TIMESTAMP | NULLABLE | KYC submission timestamp |
| `reviewedAt` | TIMESTAMP | NULLABLE | Admin review timestamp |
| `reviewedById` | UUID | FOREIGN KEY, NULLABLE | Admin who reviewed |
| `rejectionReason` | TEXT | NULLABLE | Reason if KYC was rejected |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Record creation time |
| `updatedAt` | TIMESTAMP | AUTO UPDATE | Last update time |

**Relationships:**
- One-to-One with `Vendor`
- Many-to-One with `User` (reviewer)

---

#### **Table 5: PurchaseOrder**

**Purpose:** Stores purchase order information created by internal users for vendors. This is a core transactional table that tracks orders from creation through delivery.

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid | Unique order identifier |
| `orderNumber` | VARCHAR(50) | UNIQUE, NOT NULL | Human-readable order number |
| `vendorId` | UUID | FOREIGN KEY | Reference to Vendor |
| `createdById` | UUID | FOREIGN KEY | User who created the order |
| `title` | VARCHAR(255) | NOT NULL | Order title/summary |
| `description` | TEXT | NULLABLE | Detailed order description |
| `amount` | DECIMAL(15,2) | NOT NULL | Total order value |
| `currency` | VARCHAR(3) | DEFAULT 'INR' | Currency code |
| `status` | ENUM(OrderStatus) | DEFAULT 'DRAFT' | Order lifecycle status |
| `expectedDelivery` | TIMESTAMP | NULLABLE | Expected delivery date |
| `actualDelivery` | TIMESTAMP | NULLABLE | Actual delivery date |
| `deliveryStatus` | ENUM(DeliveryStatus) | DEFAULT 'PENDING' | Delivery tracking status |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Order creation time |
| `updatedAt` | TIMESTAMP | AUTO UPDATE | Last modification time |

**Relationships:**
- Many-to-One with `Vendor`
- Many-to-One with `User` (creator)
- One-to-Many with `PurchaseOrderItem`
- One-to-Many with `Invoice`
- One-to-Many with `Dispute`

---

#### **Table 6: PurchaseOrderItem**

**Purpose:** Stores individual line items within a purchase order. This allows orders to contain multiple products/services with separate quantities and pricing.

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid | Unique item identifier |
| `orderId` | UUID | FOREIGN KEY | Reference to PurchaseOrder |
| `itemName` | VARCHAR(255) | NOT NULL | Product/service name |
| `quantity` | INTEGER | NOT NULL | Quantity ordered |
| `unitPrice` | DECIMAL(15,2) | NOT NULL | Price per unit |
| `totalPrice` | DECIMAL(15,2) | NOT NULL | Calculated total (qty × price) |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Item creation time |

**Relationships:**
- Many-to-One with `PurchaseOrder`

---

#### **Table 7: Invoice**

**Purpose:** Stores invoice information submitted by vendors for payment. Invoices may be linked to purchase orders and go through an approval workflow.

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid | Unique invoice identifier |
| `invoiceNumber` | VARCHAR(50) | UNIQUE, NOT NULL | Vendor's invoice number |
| `orderId` | UUID | FOREIGN KEY, NULLABLE | Linked purchase order (optional) |
| `vendorId` | UUID | FOREIGN KEY | Vendor who submitted |
| `amount` | DECIMAL(15,2) | NOT NULL | Base invoice amount |
| `taxAmount` | DECIMAL(15,2) | DEFAULT 0 | Tax amount (GST, etc.) |
| `totalAmount` | DECIMAL(15,2) | NOT NULL | Total = amount + tax |
| `status` | ENUM(InvoiceStatus) | DEFAULT 'PENDING' | Approval/payment status |
| `dueDate` | DATE | NULLABLE | Payment due date |
| `paidDate` | DATE | NULLABLE | Actual payment date |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Invoice submission time |
| `updatedAt` | TIMESTAMP | AUTO UPDATE | Last update time |

**Relationships:**
- Many-to-One with `PurchaseOrder` (optional)
- Many-to-One with `Vendor`
- One-to-Many with `Dispute`

---

#### **Table 8: Dispute**

**Purpose:** Stores dispute/complaint records raised against vendors or orders. Disputes go through a resolution workflow with vendor responses and admin decisions.

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid | Unique dispute identifier |
| `disputeNumber` | VARCHAR(50) | UNIQUE, NOT NULL | Human-readable dispute ID |
| `orderId` | UUID | FOREIGN KEY, NULLABLE | Related order (optional) |
| `invoiceId` | UUID | FOREIGN KEY, NULLABLE | Related invoice (optional) |
| `vendorId` | UUID | FOREIGN KEY | Vendor involved |
| `raisedById` | UUID | FOREIGN KEY | User who raised dispute |
| `category` | ENUM(DisputeCategory) | NOT NULL | Type: DELIVERY, QUALITY, PAYMENT, PRICING, OTHER |
| `priority` | ENUM(DisputePriority) | DEFAULT 'MEDIUM' | Urgency level |
| `subject` | VARCHAR(255) | NOT NULL | Brief dispute title |
| `description` | TEXT | NULLABLE | Detailed issue description |
| `amount` | DECIMAL(15,2) | NULLABLE | Disputed amount (if applicable) |
| `status` | ENUM(DisputeStatus) | DEFAULT 'OPEN' | Resolution status |
| `resolution` | TEXT | NULLABLE | Final resolution notes |
| `resolvedById` | UUID | FOREIGN KEY, NULLABLE | Admin who resolved |
| `resolvedAt` | TIMESTAMP | NULLABLE | Resolution timestamp |
| `vendorResponse` | TEXT | NULLABLE | Vendor's response |
| `vendorRespondedAt` | TIMESTAMP | NULLABLE | When vendor responded |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Dispute creation time |
| `updatedAt` | TIMESTAMP | AUTO UPDATE | Last update time |

**Relationships:**
- Many-to-One with `PurchaseOrder` (optional)
- Many-to-One with `Invoice` (optional)
- Many-to-One with `Vendor`
- Many-to-One with `User` (raiser)
- Many-to-One with `User` (resolver)

---

#### **Table 9: VendorRiskScore**

**Purpose:** Stores historical risk score calculations for vendors. This allows tracking of risk trends over time and provides data for AI analytics.

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid | Unique score record ID |
| `vendorId` | UUID | FOREIGN KEY | Reference to Vendor |
| `riskScore` | DECIMAL(5,2) | NOT NULL | Overall risk score (0-100) |
| `riskCategory` | ENUM(RiskCategory) | NOT NULL | Derived category |
| `deliveryScore` | DECIMAL(5,2) | NULLABLE | Delivery performance score |
| `disputeScore` | DECIMAL(5,2) | NULLABLE | Dispute history score |
| `paymentScore` | DECIMAL(5,2) | NULLABLE | Payment behavior score |
| `fulfillmentScore` | DECIMAL(5,2) | NULLABLE | Order fulfillment score |
| `calculatedAt` | TIMESTAMP | DEFAULT NOW() | When score was calculated |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Record creation time |

**Relationships:**
- Many-to-One with `Vendor`

---

#### **Table 10: VendorPerformancePrediction**

**Purpose:** Stores AI-generated predictions about vendor performance. This enables proactive risk management by predicting potential issues.

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid | Unique prediction ID |
| `vendorId` | UUID | FOREIGN KEY | Reference to Vendor |
| `predictionType` | ENUM(PredictionType) | NOT NULL | Type: DELIVERY_DELAY, DISPUTE_RISK, QUALITY_ISSUE |
| `probability` | DECIMAL(5,2) | NOT NULL | Probability percentage (0-100) |
| `predictionPeriod` | VARCHAR(50) | NOT NULL | Time period (e.g., "Next 30 days") |
| `details` | TEXT | NULLABLE | Explanation of prediction |
| `predictedAt` | TIMESTAMP | DEFAULT NOW() | When prediction was made |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Record creation time |

**Relationships:**
- Many-to-One with `Vendor`

---

#### **Table 11: AnomalyAlert**

**Purpose:** Stores AI-detected anomalies and fraud alerts. These alerts notify administrators of suspicious patterns in vendor behavior.

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid | Unique alert ID |
| `vendorId` | UUID | FOREIGN KEY | Related vendor |
| `alertType` | ENUM(AlertType) | NOT NULL | Type: INVOICE_ANOMALY, DELIVERY_PATTERN, etc. |
| `severity` | ENUM(AlertSeverity) | NOT NULL | Level: LOW, MEDIUM, HIGH, CRITICAL |
| `title` | VARCHAR(255) | NOT NULL | Alert title |
| `description` | TEXT | NULLABLE | Detailed alert explanation |
| `status` | ENUM(AlertStatus) | DEFAULT 'NEW' | Investigation status |
| `investigatedById` | UUID | FOREIGN KEY, NULLABLE | Admin investigating |
| `investigatedAt` | TIMESTAMP | NULLABLE | Investigation start time |
| `notes` | TEXT | NULLABLE | Investigation notes |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Alert creation time |
| `updatedAt` | TIMESTAMP | AUTO UPDATE | Last update time |

**Relationships:**
- Many-to-One with `Vendor`
- Many-to-One with `User` (investigator)

---

#### **Table 12: AuditLog**

**Purpose:** Stores system activity logs for security and compliance. Tracks all significant user actions with before/after values.

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid | Unique log entry ID |
| `userId` | UUID | FOREIGN KEY, NULLABLE | User who performed action |
| `action` | VARCHAR(100) | NOT NULL | Action type (CREATE, UPDATE, DELETE, etc.) |
| `entityType` | VARCHAR(100) | NOT NULL | Table/entity affected |
| `entityId` | UUID | NULLABLE | ID of affected record |
| `oldValues` | JSONB | NULLABLE | Previous values (for updates) |
| `newValues` | JSONB | NULLABLE | New values (for creates/updates) |
| `ipAddress` | VARCHAR(45) | NULLABLE | User's IP address |
| `userAgent` | TEXT | NULLABLE | Browser/client information |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | When action occurred |

**Relationships:**
- Many-to-One with `User`

---

### 5.2.4 Enumeration Types

| Enum Name | Values | Purpose |
|-----------|--------|---------|
| **UserRole** | ADMIN, INTERNAL_USER, VENDOR | Role-based access control |
| **UserStatus** | ACTIVE, INACTIVE, SUSPENDED | User account status |
| **BusinessType** | INDIVIDUAL, PARTNERSHIP, PVT_LTD, LLP | Vendor business classification |
| **KYCStatus** | PENDING, SUBMITTED, UNDER_REVIEW, VERIFIED, REJECTED | KYC verification workflow |
| **VendorStatus** | ACTIVE, INACTIVE, BLACKLISTED | Vendor operational status |
| **RiskCategory** | LOW, MEDIUM, HIGH | AI-computed risk level |
| **OrderStatus** | DRAFT, PENDING, APPROVED, IN_PROGRESS, DELIVERED, COMPLETED, CANCELLED | Purchase order lifecycle |
| **DeliveryStatus** | PENDING, PARTIAL, COMPLETED, DELAYED | Delivery tracking |
| **InvoiceStatus** | PENDING, APPROVED, PAID, REJECTED, OVERDUE | Invoice payment workflow |
| **DisputeCategory** | DELIVERY, QUALITY, PAYMENT, PRICING, OTHER | Dispute classification |
| **DisputePriority** | LOW, MEDIUM, HIGH, CRITICAL | Dispute urgency |
| **DisputeStatus** | OPEN, UNDER_REVIEW, ESCALATED, RESOLVED, CLOSED | Dispute resolution workflow |
| **BusinessDocType** | REGISTRATION_CERT, TRADE_LICENSE, UDYAM | KYC document types |
| **PredictionType** | DELIVERY_DELAY, DISPUTE_RISK, QUALITY_ISSUE | AI prediction categories |
| **AlertType** | INVOICE_ANOMALY, DELIVERY_PATTERN, DISPUTE_PATTERN, FRAUD_SUSPECTED | AI alert categories |
| **AlertSeverity** | LOW, MEDIUM, HIGH, CRITICAL | Alert importance level |
| **AlertStatus** | NEW, UNDER_INVESTIGATION, DISMISSED, CONFIRMED | Alert lifecycle |

---

### 5.2.5 Key Relationships Summary

| Relationship | Cardinality | Description |
|--------------|-------------|-------------|
| User → Vendor | 1:1 | Each vendor user has one vendor profile |
| Vendor → VendorContact | 1:1 | Each vendor has one contact record |
| Vendor → VendorKYC | 1:1 | Each vendor has one KYC submission |
| Vendor → PurchaseOrder | 1:N | Vendors can have multiple orders |
| Vendor → Invoice | 1:N | Vendors submit multiple invoices |
| Vendor → Dispute | 1:N | Vendors may have multiple disputes |
| Vendor → VendorRiskScore | 1:N | Historical risk scores |
| Vendor → VendorPerformancePrediction | 1:N | AI predictions |
| Vendor → AnomalyAlert | 1:N | AI-detected alerts |
| PurchaseOrder → PurchaseOrderItem | 1:N | Order line items |
| PurchaseOrder → Invoice | 1:N | Orders can have multiple invoices |
| PurchaseOrder → Dispute | 1:N | Orders can have multiple disputes |
| Invoice → Dispute | 1:N | Invoices can have disputes |
| User → PurchaseOrder | 1:N | User creates orders |
| User → Dispute (Raiser) | 1:N | Users can raise multiple disputes |
| User → Dispute (Resolver) | 1:N | Users can resolve multiple disputes |
| User → VendorKYC (Reviewer) | 1:N | Admins review KYC submissions |
| User → AuditLog | 1:N | User activity logs |

---

## 5.3 User Manual with Screenshots

### 5.3.1 System Access

#### Login Process
1. Navigate to the application URL
2. Enter your registered email address
3. Enter your password
4. Click "Sign in" button
5. System redirects to role-appropriate dashboard:
   - **Admin** → `/dashboard/admin`
   - **Internal User** → `/dashboard/internal`
   - **Vendor** → `/dashboard/vendor`

#### Registration (Signup)
1. Click "Create one" link on login page
2. Fill in required details:
   - Full Name
   - Email Address
   - Password (minimum 8 characters)
   - Select Role (Admin/Internal User/Vendor)
3. Click "Create account"
4. Login with new credentials

---

### 5.3.2 Admin Dashboard

#### Dashboard Overview
The Admin Dashboard provides a comprehensive view of the entire vendor management system.

**KPI Cards:**
- **Total Vendors** - Count of all registered vendors
- **Pending KYC** - Vendors awaiting verification
- **High-Risk Vendors** - AI-flagged risky vendors
- **Open Disputes** - Active dispute count

**Charts:**
- Risk Distribution Chart (Pie chart showing LOW/MEDIUM/HIGH distribution)
- Vendor Status Breakdown (Active, Inactive, Blacklisted, etc.)

**Recent Vendors Table:**
Displays latest vendor registrations with:
- Business Name
- Industry Category
- Risk Score
- Status
- Action buttons

---

#### Vendor Management (Admin)
**Path:** `/dashboard/admin/vendors`

**Features:**
1. View all registered vendors in a table format
2. Filter vendors by:
   - Status (Active, Inactive, Blacklisted)
   - Risk Category (Low, Medium, High)
   - KYC Status
3. Search vendors by name
4. View vendor details
5. Update vendor status

---

#### KYC Management
**Path:** `/dashboard/admin/kyc`

**Features:**
1. View pending KYC submissions
2. Review submitted documents:
   - GST Number
   - PAN Number
   - Business Registration Certificate
3. Approve or Reject KYC with reason
4. Track review history

---

#### Dispute Management (Admin)
**Path:** `/dashboard/admin/disputes`

**Features:**
1. View all system disputes
2. Filter by:
   - Category (Delivery, Quality, Payment, Pricing)
   - Priority (Low, Medium, High, Critical)
   - Status (Open, Under Review, Resolved, Closed)
3. View dispute details including vendor response
4. Update dispute status
5. Add resolution notes
6. Assign disputes to team members

---

#### Purchase Orders
**Path:** `/dashboard/admin/orders`

**Features:**
1. View all purchase orders
2. Filter by status and vendor
3. Track delivery status
4. View order details and items

---

#### AI Risk Analytics
**Path:** `/dashboard/admin/risk`

**Features:**
1. AI-generated risk insights
2. Vendor risk score history
3. Performance predictions
4. Anomaly alerts dashboard

---

#### Reports
**Path:** `/dashboard/admin/reports`

**Features:**
1. Generate custom reports
2. Export data (CSV, PDF)
3. Analytics dashboards
4. Trend analysis

---

#### Audit Logs
**Path:** `/dashboard/admin/audit`

**Features:**
1. View system activity logs
2. Filter by:
   - User
   - Action Type
   - Date Range
3. Track all CRUD operations
4. IP address and user agent logging

---

#### Settings
**Path:** `/dashboard/admin/settings`

**Features:**
1. Update profile information
2. Change password
3. Configure AI preferences
4. System configuration

---

### 5.3.3 Internal User Dashboard

#### Dashboard Overview
**Path:** `/dashboard/internal`

The Internal User dashboard provides operational oversight with:

**KPI Cards:**
- Total Vendors
- Active Orders
- Pending Invoices
- Open Disputes

**Alerts Section:**
- Pending KYC notifications
- High-risk vendor warnings

**Recent Activity Table:**
- Order/Invoice ID
- Vendor Name
- Transaction Type
- Amount
- Status
- Date

---

#### Vendor Management
**Path:** `/dashboard/internal/vendors`

**Features:**
1. View vendor list with key metrics
2. Add new vendor via modal form:
   - Business Name
   - Business Type
   - Industry Category
   - Contact Information
3. Search and filter vendors
4. Access vendor detail page

---

#### Vendor Details Page
**Path:** `/dashboard/internal/vendors/[id]`

**Tabbed Interface:**

**Tab 1: Overview (Read-only)**
- Business information
- Contact details
- KYC status

**Tab 2: Operational Details (Editable)**
- Update vendor information
- Modify contact details

**Tab 3: Orders History**
- List of all orders for this vendor
- Order status tracking

**Tab 4: Risk Summary**
- Risk score display
- Risk category badge
- Historical risk data

---

#### Purchase Orders
**Path:** `/dashboard/internal/orders`

**Features:**
1. View all orders table
2. Create new order via modal:
   - Select vendor (shows risk level)
   - Order details
   - Expected delivery date
3. Filter by status
4. Track delivery progress

---

#### Invoices
**Path:** `/dashboard/internal/invoices`

**Features:**
1. View invoice list
2. Filter by status (Pending, Approved, Paid, Overdue)
3. Approve/Reject invoices
4. Process payments

---

#### Disputes
**Path:** `/dashboard/internal/disputes`

**Features:**
1. View and manage disputes
2. Escalate to admin
3. Add investigation notes

---

### 5.3.4 Vendor Portal

#### Dashboard Overview
**Path:** `/dashboard/vendor`

**Welcome Banner:**
- Personalized greeting
- KYC completion CTA (if not verified)
- KYC status badge

**KPI Cards:**
- Active Orders
- Pending Invoices (with amount)
- Risk Score
- Disputes

**Recent Activity:**
- Latest orders and notifications

---

#### KYC Submission
**Path:** `/dashboard/vendor/kyc`

**Multi-Section Form:**

**Section 1: Business Details**
- Business Name (read-only)
- Business Type (read-only)
- Industry Category (read-only)
- Business Description

**Section 2: Tax & Registration**
- GST Number
- PAN Number
- Business Document Type (dropdown)
- Document Number
- Issuing Authority
- Issue Date

**Section 3: Contact & Address**
- Contact Person Name
- Designation
- Email
- Phone
- Address
- City, State, PIN Code

**Actions:**
- Save Draft
- Submit for Verification

---

#### Orders
**Path:** `/dashboard/vendor/orders`

**Features:**
1. View assigned purchase orders
2. Track order status
3. View order details and items
4. Update delivery status

---

#### Invoices
**Path:** `/dashboard/vendor/invoices`

**Features:**
1. View submitted invoices
2. Create new invoice:
   - Select order (optional)
   - Invoice amount
   - Tax details
   - Due date
3. Track payment status

---

#### Disputes
**Path:** `/dashboard/vendor/disputes`

**Features:**
1. View disputes raised against vendor
2. Respond to disputes (one-time response)
3. Track dispute resolution status

---

#### Performance
**Path:** `/dashboard/vendor/performance`

**Features:**
1. View risk score
2. Performance metrics
3. Historical trends

---

#### Settings
**Path:** `/dashboard/vendor/settings`

**Features:**
1. Update profile information
2. Change password
3. Notification preferences

---

## 5.4 Test Cases Design

### 5.4.1 Authentication Module Test Cases

| Test ID | Test Case | Input | Expected Output | Status |
|---------|-----------|-------|-----------------|--------|
| AUTH-001 | Valid login with correct credentials | email: "admin@test.com", password: "password123" | Redirect to /dashboard/admin | ✅ Pass |
| AUTH-002 | Invalid login with wrong password | email: "admin@test.com", password: "wrongpass" | Error: "Invalid email or password" | ✅ Pass |
| AUTH-003 | Login with non-existent email | email: "nouser@test.com", password: "any" | Error: "Invalid email or password" | ✅ Pass |
| AUTH-004 | Signup with valid data | All fields valid | Account created, redirect to login | ✅ Pass |
| AUTH-005 | Signup with duplicate email | Existing email | Error: "Email already exists" | ✅ Pass |
| AUTH-006 | Signup with weak password | password: "123" | Error: "Password too weak" | ✅ Pass |
| AUTH-007 | Protected route without auth | Access /dashboard/* without login | Redirect to /login | ✅ Pass |
| AUTH-008 | Admin route with vendor role | Vendor accesses /dashboard/admin | Redirect to /dashboard/vendor | ✅ Pass |

### 5.4.2 Vendor Management Test Cases

| Test ID | Test Case | Input | Expected Output | Status |
|---------|-----------|-------|-----------------|--------|
| VND-001 | Create new vendor | Valid vendor data | Vendor created with PENDING KYC | ✅ Pass |
| VND-002 | Get all vendors (Admin) | GET /api/vendors | List of all vendors | ✅ Pass |
| VND-003 | Get vendor by ID | GET /api/vendors/:id | Vendor details with relations | ✅ Pass |
| VND-004 | Update vendor status | PUT /api/vendors/:id {status: "INACTIVE"} | Status updated | ✅ Pass |
| VND-005 | Delete vendor | DELETE /api/vendors/:id | Vendor and relations deleted | ✅ Pass |
| VND-006 | Vendor search by name | query: "Tech Corp" | Filtered vendor list | ✅ Pass |
| VND-007 | Filter by risk category | filter: HIGH | Only high-risk vendors | ✅ Pass |

### 5.4.3 KYC Module Test Cases

| Test ID | Test Case | Input | Expected Output | Status |
|---------|-----------|-------|-----------------|--------|
| KYC-001 | Submit KYC (Vendor) | Valid KYC data | KYC status changed to SUBMITTED | ✅ Pass |
| KYC-002 | Get KYC details | GET /api/vendor/kyc | KYC data for logged vendor | ✅ Pass |
| KYC-003 | Update KYC (Admin) | Approve KYC | Status: VERIFIED, reviewedAt set | ✅ Pass |
| KYC-004 | Reject KYC with reason | Reject with reason | Status: REJECTED, reason saved | ✅ Pass |
| KYC-005 | Submit KYC without GST | Missing GST | Validation error | ✅ Pass |
| KYC-006 | Invalid PAN format | PAN: "INVALID" | Format validation error | ✅ Pass |

### 5.4.4 Purchase Order Test Cases

| Test ID | Test Case | Input | Expected Output | Status |
|---------|-----------|-------|-----------------|--------|
| ORD-001 | Create purchase order | Valid order data | Order created with DRAFT status | ✅ Pass |
| ORD-002 | Get orders (Admin) | GET /api/orders | All orders list | ✅ Pass |
| ORD-003 | Get vendor orders | GET /api/vendor/orders | Only vendor's orders | ✅ Pass |
| ORD-004 | Update order status | PUT /api/orders/:id {status: "APPROVED"} | Status updated | ✅ Pass |
| ORD-005 | Create order for inactive vendor | vendorId: inactive vendor | Error: Vendor not active | ✅ Pass |
| ORD-006 | Calculate order total | Items with quantities | Correct total amount | ✅ Pass |

### 5.4.5 Invoice Test Cases

| Test ID | Test Case | Input | Expected Output | Status |
|---------|-----------|-------|-----------------|--------|
| INV-001 | Create invoice | Valid invoice data | Invoice created, PENDING status | ✅ Pass |
| INV-002 | Link invoice to order | orderId provided | Invoice linked to order | ✅ Pass |
| INV-003 | Approve invoice | PUT {status: "APPROVED"} | Status: APPROVED | ✅ Pass |
| INV-004 | Mark invoice paid | PUT {status: "PAID"} | Status: PAID, paidDate set | ✅ Pass |
| INV-005 | Reject invoice | PUT {status: "REJECTED"} | Status: REJECTED | ✅ Pass |
| INV-006 | Calculate tax amount | amount: 10000 | Correct tax calculation | ✅ Pass |

### 5.4.6 Dispute Module Test Cases

| Test ID | Test Case | Input | Expected Output | Status |
|---------|-----------|-------|-----------------|--------|
| DSP-001 | Create dispute | Valid dispute data | Dispute created, OPEN status | ✅ Pass |
| DSP-002 | Get all disputes (Admin) | GET /api/disputes | All disputes list | ✅ Pass |
| DSP-003 | Get vendor disputes | GET /api/vendor/disputes | Only vendor's disputes | ✅ Pass |
| DSP-004 | Update dispute status | PUT {status: "UNDER_REVIEW"} | Status updated | ✅ Pass |
| DSP-005 | Vendor respond to dispute | PUT {vendorResponse: "..."} | Response saved | ✅ Pass |
| DSP-006 | Prevent duplicate response | Second response attempt | Error: Already responded | ✅ Pass |
| DSP-007 | Resolve dispute | PUT {status: "RESOLVED", resolution: "..."} | Dispute resolved | ✅ Pass |
| DSP-008 | Create dispute with order | orderId provided | Dispute linked to order | ✅ Pass |

### 5.4.7 User Settings Test Cases

| Test ID | Test Case | Input | Expected Output | Status |
|---------|-----------|-------|-----------------|--------|
| SET-001 | Get user profile | GET /api/user/settings | User profile data | ✅ Pass |
| SET-002 | Update profile | PUT {name: "New Name"} | Profile updated | ✅ Pass |
| SET-003 | Change password | PUT {currentPassword, newPassword} | Password changed | ✅ Pass |
| SET-004 | Wrong current password | Incorrect current password | Error: Invalid password | ✅ Pass |
| SET-005 | Update phone number | PUT {phone: "+91...."} | Phone updated | ✅ Pass |

### 5.4.8 Reports & Analytics Test Cases

| Test ID | Test Case | Input | Expected Output | Status |
|---------|-----------|-------|-----------------|--------|
| RPT-001 | Get admin stats | GET /api/admin/stats | Dashboard statistics | ✅ Pass |
| RPT-002 | Get internal stats | GET /api/internal/stats | Internal dashboard data | ✅ Pass |
| RPT-003 | Get vendor stats | GET /api/vendor/stats | Vendor-specific stats | ✅ Pass |
| RPT-004 | Generate report | GET /api/reports | Report data | ✅ Pass |
| RPT-005 | Get audit logs | GET /api/admin/audit-logs | Activity logs | ✅ Pass |

### 5.4.9 UI/UX Test Cases

| Test ID | Test Case | Expected Behavior | Status |
|---------|-----------|-------------------|--------|
| UI-001 | Responsive sidebar | Collapses on mobile, expands on desktop | ✅ Pass |
| UI-002 | Dark mode toggle | Theme changes across all pages | ✅ Pass |
| UI-003 | Form validation | Real-time validation feedback | ✅ Pass |
| UI-004 | Loading states | Skeleton loaders displayed | ✅ Pass |
| UI-005 | Toast notifications | Success/error toasts appear | ✅ Pass |
| UI-006 | Modal functionality | Opens/closes correctly | ✅ Pass |
| UI-007 | Pagination | Navigates pages correctly | ✅ Pass |
| UI-008 | Table sorting | Columns sort correctly | ✅ Pass |
| UI-009 | Search functionality | Filters results in real-time | ✅ Pass |

### 5.4.10 Security Test Cases

| Test ID | Test Case | Expected Behavior | Status |
|---------|-----------|-------------------|--------|
| SEC-001 | SQL Injection prevention | Parameterized queries block injection | ✅ Pass |
| SEC-002 | XSS prevention | User input is sanitized | ✅ Pass |
| SEC-003 | CSRF protection | Tokens validated on POST requests | ✅ Pass |
| SEC-004 | Password hashing | Passwords stored as bcrypt hashes | ✅ Pass |
| SEC-005 | Role-based access | Users can only access permitted routes | ✅ Pass |
| SEC-006 | Session timeout | Sessions expire after inactivity | ✅ Pass |
| SEC-007 | API rate limiting | Excessive requests are blocked | ⏳ Pending |

---

## Appendix: Technology Stack Summary

| Category | Technology | Version |
|----------|------------|---------|
| Frontend Framework | Next.js | 16.1.1 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Database | PostgreSQL | Latest |
| ORM | Prisma | 6.19.1 |
| Authentication | NextAuth.js | 5.0.0-beta.30 |
| Password Hashing | bcryptjs | 3.0.3 |

---

---

## Chapter 6: Conclusion

---

### 6.1 Conclusion

The VendorGuard project has been successfully designed and developed as an AI-powered Vendor Risk Management System aimed at modernizing how organizations manage, monitor, and mitigate vendor-related risks. The system addresses critical challenges faced by enterprises in vendor onboarding, compliance verification, performance tracking, and fraud detection.

Key Achievements:

1. Comprehensive Role-Based Access Control: The system implements three distinct user roles (Admin, Internal User, Vendor) with tailored dashboards and permissions, ensuring secure and appropriate access to system functionalities.

2. Streamlined KYC Process: The vendor onboarding workflow includes a complete Know Your Customer (KYC) module with document verification, status tracking, and admin review capabilities, reducing manual paperwork and improving compliance.

3. End-to-End Order Management: The platform facilitates the complete purchase order lifecycle from creation to delivery tracking, with invoice submission and payment processing capabilities.

4. Dispute Resolution Workflow: A structured dispute management system enables systematic handling of vendor-related issues with vendor response mechanisms and admin resolution tracking.

5. Modern Technology Stack: Built using Next.js 16, React 19, TypeScript, PostgreSQL, and Prisma ORM, the application leverages cutting-edge technologies to deliver a responsive, type-safe, and maintainable codebase.

6. User-Centric Design: The interface features responsive design, dark mode support, real-time validation, and intuitive navigation, ensuring excellent user experience across all roles.

7. Audit Trail & Compliance: Comprehensive logging of all system activities supports regulatory compliance and enables forensic analysis when required.

The project demonstrates the practical application of modern web development practices, database design principles, and software engineering methodologies in creating an enterprise-grade application.

---

### 6.2 Limitations of the System

While VendorGuard delivers significant value, the current implementation has certain inherent limitations:

1. Offline Functionality: The application requires an active internet connection to function. Progressive Web App (PWA) features for offline access are not implemented, limiting usability in low-connectivity environments.

2. Multi-Language Support: The system currently supports English only. Internationalization (i18n) for multiple languages is not available, which may restrict adoption in non-English speaking regions.

3. Mobile Application: The system is web-based only. While the responsive design works on mobile browsers, native mobile applications for iOS and Android with push notifications and device-specific optimizations are not available.

4. API Rate Limiting: While basic security measures are in place, advanced API rate limiting to prevent abuse and DDoS attacks is pending implementation, which could be a concern for high-traffic deployments.

5. Third-Party ERP Integration: Direct integration with enterprise resource planning (ERP) systems such as SAP, Oracle, or Microsoft Dynamics is not available, requiring manual data synchronization for organizations using these platforms.

6. Scalability Constraints: The current single-tenant architecture limits deployment to individual organizations. Multi-tenancy support for SaaS-based deployments is not yet implemented.

7. Legacy Browser Support: The application uses modern JavaScript features and may not function correctly on older browsers (e.g., Internet Explorer). Users must use updated versions of Chrome, Firefox, Safari, or Edge.

8. Backup & Disaster Recovery: While the database supports standard backup mechanisms, automated backup scheduling and disaster recovery procedures are dependent on the hosting infrastructure configuration.

---

### 6.3 Future Scope of the Project

The VendorGuard system has been developed as a comprehensive vendor risk management solution with AI-powered analytics, document management, integrated communication, and payment processing capabilities. Building upon this solid foundation, the system has significant potential for further enhancement and expansion:

Mobile Application Development:

1. Native Mobile Apps
   - Develop native iOS application using Swift/SwiftUI for Apple devices
   - Develop native Android application using Kotlin for Android devices
   - Implement push notifications for real-time alerts on mobile devices
   - Enable offline data caching for improved mobile performance

Enterprise Integration:

2. ERP System Connectivity
   - Create standardized APIs for integration with SAP, Oracle, and Microsoft Dynamics
   - Implement SSO with enterprise identity providers (Azure AD, Okta, LDAP)
   - Develop webhook system for real-time bidirectional data synchronization
   - Build data import/export connectors for legacy system migration

Blockchain & Advanced Security:

3. Blockchain for Compliance
   - Implement blockchain-based audit trails for immutable and tamper-proof record-keeping
   - Create smart contracts for automated vendor agreements and milestone-based payments
   - Develop decentralized document verification using distributed ledger technology
   - Establish cryptographic proof of document authenticity

Advanced AI Capabilities:

4. Natural Language Processing
   - Add AI chatbot for automated vendor support and query resolution
   - Implement automated contract analysis using NLP for risk clause identification
   - Create intelligent semantic search across all system data and documents
   - Develop sentiment analysis for vendor communication monitoring

Platform Expansion:

5. Multi-Tenancy & SaaS Deployment
   - Convert to multi-tenant architecture for cloud-based SaaS deployment
   - Implement organization-level customization and white-labeling
   - Create flexible subscription-based pricing models
   - Enable tenant-specific data isolation and compliance boundaries

Regulatory & Compliance Automation:

6. Government API Integration
   - Integrate with government databases for real-time GST/PAN verification
   - Add automated tax compliance checking against regulatory APIs
   - Implement automated compliance reporting aligned with industry standards
   - Develop audit trail exports meeting legal and regulatory requirements

Internationalization:

7. Global Deployment Support
   - Implement multi-language support (i18n) for global adoption
   - Add multi-currency support with real-time exchange rate integration
   - Adapt compliance modules for international regulatory frameworks
   - Enable region-specific tax and documentation requirements

The continued development of VendorGuard will focus on extending its reach to mobile platforms, enhancing security through blockchain technology, and enabling seamless enterprise integration to serve organizations of all sizes across multiple industries.

---

## Chapter 7: Bibliography

---

Books

1. Pressman, R. S., & Maxim, B. R. (2020). Software Engineering: A Practitioner's Approach (9th ed.). McGraw-Hill Education.

2. Sommerville, I. (2019). Software Engineering (10th ed.). Pearson Education.

3. Martin, R. C. (2017). Clean Architecture: A Craftsman's Guide to Software Structure and Design. Prentice Hall.

4. Fowler, M. (2018). Refactoring: Improving the Design of Existing Code (2nd ed.). Addison-Wesley Professional.

5. Elmasri, R., & Navathe, S. B. (2021). Fundamentals of Database Systems (7th ed.). Pearson.

---

Web Resources & Documentation

6. Next.js Documentation. (2024). Next.js by Vercel - The React Framework.
   URL: https://nextjs.org/docs

7. React Documentation. (2024). React – A JavaScript library for building user interfaces.
   URL: https://react.dev

8. TypeScript Documentation. (2024). TypeScript: JavaScript With Syntax For Types.
   URL: https://www.typescriptlang.org/docs

9. Prisma Documentation. (2024). Prisma | Next-generation ORM for Node.js and TypeScript.
   URL: https://www.prisma.io/docs

10. PostgreSQL Documentation. (2024). PostgreSQL: The World's Most Advanced Open Source Relational Database.
    URL: https://www.postgresql.org/docs

11. Tailwind CSS Documentation. (2024). Tailwind CSS - Rapidly build modern websites without ever leaving your HTML.
    URL: https://tailwindcss.com/docs

12. NextAuth.js Documentation. (2024). NextAuth.js - Authentication for Next.js.
    URL: https://authjs.dev

13. Vercel Documentation. (2024). Vercel: Develop. Preview. Ship.
    URL: https://vercel.com/docs

---

Research Papers & Articles

14. Lambert, D. M., & Schwieterman, M. A. (2012). Supplier relationship management as a macro business process. Supply Chain Management: An International Journal, 17(3), 337-352.

15. Ho, W., Xu, X., & Dey, P. K. (2010). Multi-criteria decision making approaches for supplier evaluation and selection: A literature review. European Journal of Operational Research, 202(1), 16-24.

16. Talluri, S., & Narasimhan, R. (2004). A methodology for strategic sourcing. European Journal of Operational Research, 154(1), 236-250.

17. Chen, I. J., Paulraj, A., & Lado, A. A. (2004). Strategic purchasing, supply management, and firm performance. Journal of Operations Management, 22(5), 505-523.

---

Technical Standards

18. OWASP Foundation. (2024). OWASP Top Ten - Web Application Security Risks.
    URL: https://owasp.org/www-project-top-ten

19. W3C. (2024). Web Content Accessibility Guidelines (WCAG) 2.1.
    URL: https://www.w3.org/WAI/WCAG21/quickref

20. ISO/IEC. (2017). ISO/IEC 27001:2013 - Information Security Management Systems. International Organization for Standardization.

---

Online Tutorials & Courses

21. Academind. (2024). Next.js & React - The Complete Guide. Udemy.

22. Traversy Media. (2024). Full Stack Development with Next.js. YouTube.

23. The Net Ninja. (2024). Prisma ORM Crash Course. YouTube.

---

Software Tools & Libraries Used

| Tool/Library | Version | Purpose | Website |
|--------------|---------|---------|---------|
| Next.js | 16.1.1 | React Framework | https://nextjs.org |
| React | 19.2.3 | UI Library | https://react.dev |
| TypeScript | 5.x | Type-safe JavaScript | https://typescriptlang.org |
| Tailwind CSS | 4.x | CSS Framework | https://tailwindcss.com |
| PostgreSQL | 16.x | Database | https://postgresql.org |
| Prisma | 6.19.1 | ORM | https://prisma.io |
| NextAuth.js | 5.0.0-beta.30 | Authentication | https://authjs.dev |
| bcryptjs | 3.0.3 | Password Hashing | https://npmjs.com/package/bcryptjs |
| recharts | 2.x | Charts Library | https://recharts.org |

---

Document Generated: January 2026
Project: VendorGuard - AI-Powered Vendor Risk Management System

