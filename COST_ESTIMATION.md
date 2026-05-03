5. Program Listing

5.1 Cost Estimation

Function-Point Counting

| Function Type | No of Items in VendorGuard | Weight |
|---------------|---------------------------|--------|
| External Inputs (EI) – POST/PUT endpoints that accept and process data | 20 (/api/signup, /api/orders POST, /api/orders/[id] PUT, /api/disputes POST, /api/disputes/[id] PUT, /api/invoices POST, /api/invoices/[id] PUT, /api/vendor/kyc PUT, /api/admin/kyc PUT, /api/upload POST, /api/returns POST, /api/returns/[id] PUT, /api/vendor/returns/[id] PUT, /api/credit-notes POST, /api/user/settings PUT, /api/user/password PUT, /api/auth/forgot-password POST, /api/auth/reset-password POST, /api/vendor/disputes/[id] PUT, /api/notifications/mark-all-read PUT) | 4 (Average) |
| External Outputs (EO) – GET endpoints that return processed data | 17 (/api/orders GET, /api/vendors GET, /api/vendors/[id] GET, /api/disputes GET, /api/invoices GET, /api/returns GET, /api/credit-notes GET, /api/reports/summary GET, /api/reports/export GET, /api/notifications GET, /api/notifications/unread-count GET, /api/user/settings GET, /api/vendor/kyc GET, /api/vendor/orders GET, /api/vendor/invoices GET, /api/vendor/disputes GET, /api/vendor/returns GET) | 5 (Average) |
| External Enquiries (EQ) – GET endpoints querying a specific resource | 9 (Order detail by ID, Vendor detail by ID, Dispute detail by ID, Invoice detail by ID, Return detail by ID, Credit note detail by ID, KYC status query, Notification by ID, User session query) | 4 (Average) |
| Internal Logical Files (ILF) – PostgreSQL tables managed by the system | 12 (users, vendors, vendor_kyc, vendor_contacts, purchase_orders, purchase_order_items, invoices, disputes, returns, return_items, credit_notes, notifications) | 10 (Average) |
| External Interface Files (EIF) – External systems | 5 (PostgreSQL database server, Cloudinary file storage, Nodemailer SMTP service, NextAuth OAuth providers (Google + Facebook), Python ML subprocess) | 7 (Average) |


Domain Characteristic Table

| Measurement Parameter | Count | Weighting Factor | Total |
|-----------------------|-------|-------------------|-------|
| Number of User Inputs | 20 | 4 (Average) | 80 |
| Number of User Outputs | 17 | 5 (Average) | 85 |
| Number of User Inquiries | 9 | 4 (Average) | 36 |
| Number of Files | 12 | 10 (Average) | 120 |
| Number of External Interfaces | 5 | 7 (Average) | 35 |
| **Unadjusted Function Points (UFP)** | | | **356** |


Complexity Adjustment Table

| Item | Complexity Adjustment Question | Scale (0–5) |
|------|-------------------------------|-------------|
| 1 | Does the system require reliable backup and recovery? | 4 |
| 2 | Are data communications required? | 5 |
| 3 | Are there distributed processing functions? | 3 |
| 4 | Is performance critical? | 4 |
| 5 | Will the system run in an existing, heavily utilised operational environment? | 2 |
| 6 | Does the system require on-line data entry? | 5 |
| 7 | Does the on-line data entry require the input transaction to be built over multiple screens or operations? | 2 |
| 8 | Are the master files updated on-line? | 4 |
| 9 | Are the inputs, outputs, files or inquiries complex? | 4 |
| 10 | Is the internal processing complex? | 4 |
| 11 | Is the code to be designed reusable? | 4 |
| 12 | Are conversion and installation included in the design? | 2 |
| 13 | Is the system designed for multiple installations in different organisations? | 2 |
| 14 | Is the application designed to facilitate change and ease of use by the user? | 4 |
| | **Total Degree of Influence (TDI)** | **49** |

Scale: 0 = No influence, 1 = Incidental, 2 = Moderate, 3 = Average, 4 = Significant, 5 = Essential


FP Calculation

Step 1: Unadjusted Function Points (UFP)
UFP = (20 × 4) + (17 × 5) + (9 × 4) + (12 × 10) + (5 × 7)
UFP = 80 + 85 + 36 + 120 + 35
UFP = 356

Step 2: Total Degree of Influence (TDI)
TDI = 4 + 5 + 3 + 4 + 2 + 5 + 2 + 4 + 4 + 4 + 4 + 2 + 2 + 4
TDI = 49

Step 3: Value Adjustment Factor (VAF)
VAF = 0.65 + (0.01 × TDI)
VAF = 0.65 + (0.01 × 49)
VAF = 0.65 + 0.49
VAF = 1.14

Step 4: Adjusted Function Points (AFP)
AFP = UFP × VAF
AFP = 356 × 1.14
AFP = 405.8

The estimated size of the VendorGuard system is 405.8 Function Points.


COCOMO Estimation (Organic Model)

Using the Basic COCOMO model for an organic project:

Effort (E) = a × (KLOC)^b
where a = 2.4, b = 1.05

Assuming an average of 40 LOC per function point:
Estimated KLOC = 405.8 × 40 / 1000 = 16.23 KLOC

E = 2.4 × (16.23)^1.05
E = 2.4 × 18.13
E = 43.5 Person-Months

Development Time (T) = c × (E)^d
where c = 2.5, d = 0.38

T = 2.5 × (43.5)^0.38
T = 2.5 × 4.07
T ≈ 10.2 Months

Average Staff = E / T
Average Staff = 43.5 / 10.2
Average Staff ≈ 4.3 Persons

| COCOMO Parameter | Value |
|------------------|-------|
| Estimated KLOC | 16.23 |
| Effort (Person-Months) | 43.5 |
| Development Time (Months) | 10.2 |
| Average Staff Required | 4.3 |


Productivity
Productivity = AFP / Effort
Productivity = 405.8 / 43.5
Productivity ≈ 9.3 FP per Person-Month
