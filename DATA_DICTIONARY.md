Data Dictionary


1. Users

Collection: users

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | UUID | User ID | PK |
| email | String | Email address | Required, Unique |
| password | String | Hashed password | Required |
| name | String | Full name | Required |
| role | Enum | ADMIN / INTERNAL_USER / VENDOR | Required |
| status | Enum | ACTIVE / INACTIVE / SUSPENDED | Required, Default: ACTIVE |
| phone | String | Phone number | Nullable |
| department | String | Department name | Nullable |
| preferences | JSON | Notification preferences | Nullable |
| createdAt | Date | Account creation time | Required |
| updatedAt | Date | Last update time | Required |


2. Vendors

Collection: vendors

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | UUID | Vendor ID | PK |
| userId | UUID | User reference | Required, Unique, FK → users |
| businessName | String | Registered business name | Required |
| businessType | Enum | INDIVIDUAL / PARTNERSHIP / PVT_LTD / LLP | Required |
| industryCategory | String | Industry sector | Required |
| businessDescription | String | Business details | Nullable |
| yearEstablished | Int | Year established | Nullable |
| kycStatus | Enum | PENDING / SUBMITTED / UNDER_REVIEW / VERIFIED / REJECTED | Required, Default: PENDING |
| riskScore | Decimal(5,2) | AI risk score (0–100) | Nullable |
| riskCategory | Enum | LOW / MEDIUM / HIGH | Nullable |
| status | Enum | ACTIVE / INACTIVE / BLACKLISTED | Required, Default: ACTIVE |
| createdAt | Date | Creation time | Required |
| updatedAt | Date | Last update time | Required |


3. Vendor KYC

Collection: vendor_kyc

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | UUID | KYC record ID | PK |
| vendorId | UUID | Vendor reference | Required, Unique, FK → vendors |
| gstNumber | String | GST registration number | Nullable |
| panNumber | String | PAN card number | Nullable |
| businessDocType | Enum | REGISTRATION_CERT / TRADE_LICENSE / UDYAM | Nullable |
| businessDocNumber | String | Document number | Nullable |
| businessDocAuthority | String | Issuing authority | Nullable |
| businessDocIssueDate | Date | Issue date | Nullable |
| submittedAt | Date | Submission time | Nullable |
| reviewedAt | Date | Admin review time | Nullable |
| reviewedById | UUID | Reviewer reference | Nullable, FK → users |
| rejectionReason | String | Rejection reason | Nullable |
| gstDocument | String | GST certificate URL | Nullable |
| panDocument | String | PAN card URL | Nullable |
| businessDocument | String | Business proof URL | Nullable |


4. Purchase Orders

Collection: purchase_orders

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | UUID | Order ID | PK |
| orderNumber | String | Order number (PO-YYYY-NNNN) | Required, Unique |
| vendorId | UUID | Vendor reference | Required, FK → vendors |
| createdById | UUID | Creator reference | Required, FK → users |
| title | String | Order title | Required |
| description | String | Order description | Nullable |
| amount | Decimal(15,2) | Order value | Required |
| currency | String | Currency code | Required, Default: INR |
| status | Enum | DRAFT / PENDING / APPROVED / IN_PROGRESS / DELIVERED / COMPLETED / CANCELLED | Required, Default: DRAFT |
| expectedDelivery | Date | Expected delivery date | Nullable |
| actualDelivery | Date | Actual delivery date | Nullable |
| deliveryStatus | Enum | PENDING / PARTIAL / COMPLETED / DELAYED | Required, Default: PENDING |


5. Invoices

Collection: invoices

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | UUID | Invoice ID | PK |
| invoiceNumber | String | Invoice number | Required, Unique |
| orderId | UUID | Order reference | Nullable, FK → purchase_orders |
| vendorId | UUID | Vendor reference | Required, FK → vendors |
| amount | Decimal(15,2) | Base amount | Required |
| taxAmount | Decimal(15,2) | Tax amount | Required, Default: 0 |
| totalAmount | Decimal(15,2) | Total amount | Required |
| status | Enum | PENDING / APPROVED / PAID / REJECTED / OVERDUE | Required, Default: PENDING |
| dueDate | Date | Payment due date | Nullable |
| paidDate | Date | Actual payment date | Nullable |


6. Disputes

Collection: disputes

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | UUID | Dispute ID | PK |
| disputeNumber | String | Dispute number | Required, Unique |
| orderId | UUID | Order reference | Nullable, FK → purchase_orders |
| invoiceId | UUID | Invoice reference | Nullable, FK → invoices |
| vendorId | UUID | Vendor reference | Required, FK → vendors |
| raisedById | UUID | Raiser reference | Required, FK → users |
| category | Enum | DELIVERY / QUALITY / PAYMENT / PRICING / OTHER | Required |
| priority | Enum | LOW / MEDIUM / HIGH / CRITICAL | Required, Default: MEDIUM |
| subject | String | Dispute subject | Required |
| description | String | Dispute details | Nullable |
| amount | Decimal(15,2) | Disputed amount | Nullable |
| status | Enum | OPEN / UNDER_REVIEW / ESCALATED / RESOLVED / CLOSED | Required, Default: OPEN |
| resolution | String | Resolution notes | Nullable |
| resolvedById | UUID | Resolver reference | Nullable, FK → users |
| vendorResponse | String | Vendor response text | Nullable |


7. Vendor Risk Scores

Collection: vendor_risk_scores

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | UUID | Risk score ID | PK |
| vendorId | UUID | Vendor reference | Required, FK → vendors |
| riskScore | Decimal(5,2) | Composite risk score (0–100) | Required |
| riskCategory | Enum | LOW / MEDIUM / HIGH | Required |
| deliveryScore | Decimal(5,2) | Delivery sub-score | Nullable |
| disputeScore | Decimal(5,2) | Dispute sub-score | Nullable |
| paymentScore | Decimal(5,2) | Payment sub-score | Nullable |
| fulfillmentScore | Decimal(5,2) | Fulfilment sub-score | Nullable |
| calculatedAt | Date | Calculation time | Required |


8. Anomaly Alerts

Collection: anomaly_alerts

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | UUID | Alert ID | PK |
| vendorId | UUID | Vendor reference | Required, FK → vendors |
| alertType | Enum | INVOICE_ANOMALY / DELIVERY_PATTERN / DISPUTE_PATTERN / FRAUD_SUSPECTED | Required |
| severity | Enum | LOW / MEDIUM / HIGH / CRITICAL | Required |
| title | String | Alert title | Required |
| description | String | Alert details | Nullable |
| status | Enum | NEW / UNDER_INVESTIGATION / DISMISSED / CONFIRMED | Required, Default: NEW |
| investigatedById | UUID | Investigator reference | Nullable, FK → users |
| investigatedAt | Date | Investigation time | Nullable |
| notes | String | Investigation notes | Nullable |


9. Returns

Collection: returns

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | UUID | Return ID | PK |
| returnNumber | String | Return number | Required, Unique |
| orderId | UUID | Order reference | Required, FK → purchase_orders |
| vendorId | UUID | Vendor reference | Required, FK → vendors |
| createdById | UUID | Creator reference | Required, FK → users |
| reason | Enum | DEFECTIVE / DAMAGED_IN_TRANSIT / WRONG_ITEM / QUALITY_ISSUE / QUANTITY_MISMATCH / EXPIRED / NOT_AS_DESCRIBED / OTHER | Required |
| status | Enum | PENDING / VENDOR_REVIEW / APPROVED / REJECTED / IN_TRANSIT / RECEIVED / CREDIT_ISSUED / CLOSED | Required, Default: PENDING |
| description | String | Return details | Nullable |
| totalQuantity | Int | Total items returned | Required |
| totalAmount | Decimal(15,2) | Total return value | Required |
| claimType | Enum | REFUND / REPLACEMENT / CREDIT_NOTE / PARTIAL_REFUND | Nullable |
| approvedAmount | Decimal(15,2) | Approved credit amount | Nullable |
| approvedById | UUID | Approver reference | Nullable, FK → users |


10. Notifications

Collection: notifications

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | UUID | Notification ID | PK |
| userId | UUID | Recipient reference | Required, FK → users |
| type | Enum | KYC_SUBMITTED / KYC_APPROVED / KYC_REJECTED / ORDER_CREATED / ORDER_APPROVED / ORDER_DELIVERED / INVOICE_SUBMITTED / INVOICE_APPROVED / INVOICE_PAID / INVOICE_REJECTED / DISPUTE_CREATED / DISPUTE_RESOLVED / SYSTEM_ALERT / RETURN_CREATED / RETURN_APPROVED / RETURN_REJECTED / CREDIT_NOTE_ISSUED | Required |
| title | String | Notification title | Required |
| message | String | Notification body | Required |
| link | String | Redirect URL | Nullable |
| isRead | Boolean | Read status | Required, Default: false |
| createdAt | Date | Notification time | Required |
