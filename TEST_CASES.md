5.5 Test Cases Plan


| # | Test Description | Test Input | Expected Result | Actual Result |
|---|-----------------|------------|-----------------|---------------|
| 1 | Register a new vendor account | POST /api/signup with JSON { "name": "Acme Corp", "email": "acme@test.com", "password": "Pass@1234", "role": "VENDOR", "businessName": "Acme Corp", "businessType": "PVT_LTD", "industryCategory": "Manufacturing" } | 201 Created; user and vendor records created in DB; password hashed; role set to VENDOR | As Expected |
| 2 | Register with duplicate email | POST /api/signup with JSON { "email": "acme@test.com", ... } (already registered) | 400 Bad Request; error "Email already exists"; no duplicate record created | As Expected |
| 3 | Register with missing required fields | POST /api/signup with JSON { "email": "test@test.com" } (no name, password, role) | 400 Bad Request; validation error listing missing fields | As Expected |
| 4 | Login with valid credentials | POST /api/auth/[...nextauth] with email "admin@vendorguard.com" and correct password | 200 OK; session token returned; user redirected to dashboard | As Expected |
| 5 | Login with wrong password | POST /api/auth/[...nextauth] with email "admin@vendorguard.com" and wrong password | 401 Unauthorized; error "Invalid credentials"; no session created | As Expected |
| 6 | Request password reset with valid email | POST /api/auth/forgot-password with JSON { "email": "acme@test.com" } | 200 OK; PasswordResetToken record created; reset email sent via Nodemailer | As Expected |
| 7 | Reset password with valid token | POST /api/auth/reset-password with JSON { "token": "<valid_token>", "password": "NewPass@5678" } | 200 OK; password updated in DB; token marked as used | As Expected |
| 8 | Submit vendor KYC | PUT /api/vendor/kyc with GST number, PAN number, and document uploads | 200 OK; VendorKYC record updated; kycStatus set to SUBMITTED; notification sent to admin | As Expected |
| 9 | Admin approve KYC | PUT /api/admin/kyc with JSON { "vendorId": "<id>", "action": "VERIFIED" } | 200 OK; kycStatus set to VERIFIED; reviewedAt and reviewedById populated; vendor notified | As Expected |
| 10 | Admin reject KYC with reason | PUT /api/admin/kyc with JSON { "vendorId": "<id>", "action": "REJECTED", "rejectionReason": "GST document expired" } | 200 OK; kycStatus set to REJECTED; rejectionReason stored; vendor notified | As Expected |
| 11 | Create a purchase order | POST /api/orders with JSON { "vendorId": "<id>", "title": "Office Supplies Q1", "amount": 50000, "items": [...] } | 201 Created; PurchaseOrder record with auto-generated orderNumber (PO-YYYY-NNNN); PurchaseOrderItem records created; status defaults to DRAFT | As Expected |
| 12 | Create order with invalid vendor ID | POST /api/orders with JSON { "vendorId": "nonexistent-uuid", "title": "Test", "amount": 100 } | 400 Bad Request; error "Vendor not found"; no order created | **Not As Expected – returned 500 Internal Server Error instead of 400** |
| 13 | Update order status to APPROVED | PUT /api/orders/<id> with JSON { "status": "APPROVED" } | 200 OK; status updated; notification sent to vendor | As Expected |
| 14 | Vendor submit invoice | POST /api/vendor/invoices/create with JSON { "orderId": "<id>", "amount": 45000, "taxAmount": 8100, "totalAmount": 53100, "dueDate": "2026-03-15" } | 201 Created; Invoice record with auto-generated invoiceNumber; status defaults to PENDING | As Expected |
| 15 | Submit invoice with amount exceeding order value | POST /api/vendor/invoices/create with JSON { "orderId": "<id>", "amount": 999999, "taxAmount": 0, "totalAmount": 999999 } | 400 Bad Request; error "Invoice amount exceeds order value" | **Not As Expected – invoice created without validation; amount exceeded order total** |
| 16 | Admin approve invoice | PUT /api/invoices/<id> with JSON { "status": "APPROVED" } | 200 OK; status updated to APPROVED; vendor notified | As Expected |
| 17 | Create dispute on an order | POST /api/disputes with JSON { "orderId": "<id>", "vendorId": "<id>", "category": "QUALITY", "priority": "HIGH", "subject": "Defective items received", "amount": 5000 } | 201 Created; Dispute record with auto-generated disputeNumber; status defaults to OPEN; vendor notified | As Expected |
| 18 | Vendor respond to dispute | PUT /api/vendor/disputes/<id> with JSON { "vendorResponse": "We will replace the defective items within 5 days" } | 200 OK; vendorResponse and vendorRespondedAt populated; admin notified | As Expected |
| 19 | Admin resolve dispute | PUT /api/disputes/<id> with JSON { "status": "RESOLVED", "resolution": "Vendor agreed to replace items" } | 200 OK; status set to RESOLVED; resolvedById and resolvedAt populated; both parties notified | As Expected |
| 20 | Create a return request | POST /api/returns with JSON { "orderId": "<id>", "vendorId": "<id>", "reason": "DEFECTIVE", "items": [{ "itemName": "Widget A", "quantity": 10, "unitPrice": 500 }] } | 201 Created; Return record with auto-generated returnNumber; ReturnItem records created; status defaults to PENDING | As Expected |
| 21 | Approve return and issue credit note | PUT /api/returns/<id> with JSON { "status": "CREDIT_ISSUED", "claimType": "CREDIT_NOTE", "approvedAmount": 5000 } | 200 OK; Return status updated; CreditNote record created with auto-generated creditNumber; vendor notified | As Expected |
| 22 | Fetch all vendors | GET /api/vendors | 200 OK; JSON array of vendor objects with businessName, kycStatus, riskScore, and status fields | As Expected |
| 23 | Fetch vendor by ID | GET /api/vendors/<id> | 200 OK; vendor detail with nested contact, KYC, orders, invoices, and disputes | As Expected |
| 24 | Fetch admin dashboard stats | GET /api/admin/stats | 200 OK; JSON with totalVendors, pendingKYC, activeOrders, totalDisputes, revenueTotal, riskDistribution | As Expected |
| 25 | Fetch AI risk score for vendor | GET /api/ai/risk-score?vendorId=<id> | 200 OK; JSON with riskScore, riskCategory, sub-scores (delivery, dispute, payment, fulfilment) | As Expected |
| 26 | Fetch AI anomaly alerts | GET /api/ai/anomalies | 200 OK; JSON array of AnomalyAlert objects with severity, alertType, and status | As Expected |
| 27 | Fetch notifications | GET /api/notifications | 200 OK; JSON array of user notifications sorted by createdAt descending | As Expected |
| 28 | Mark all notifications as read | PUT /api/notifications/mark-all-read | 200 OK; all user notifications updated with isRead = true | As Expected |
| 29 | Fetch unread notification count | GET /api/notifications/unread-count | 200 OK; JSON { "count": <number> } | As Expected |
| 30 | Upload document to Cloudinary | POST /api/upload with multipart form (GST certificate PDF, 2 MB) | 200 OK; Cloudinary URL returned; file accessible via returned URL | As Expected |
| 31 | Upload file exceeding size limit | POST /api/upload with multipart form (50 MB file) | 400 Bad Request; error "File size exceeds limit" | **Not As Expected – request timed out with 504 Gateway Timeout instead of returning validation error** |
| 32 | Export report as JSON | GET /api/reports/export?format=json | 200 OK; JSON file downloaded with summary, vendor list, order data, and dispute data | As Expected |
| 33 | Update user profile settings | PUT /api/user/settings with JSON { "name": "Updated Name", "phone": "9876543210" } | 200 OK; user record updated; response contains updated profile | As Expected |
| 34 | Change password | PUT /api/user/password with JSON { "currentPassword": "Pass@1234", "newPassword": "NewPass@5678" } | 200 OK; password hash updated in DB | As Expected |
| 35 | Change password with wrong current password | PUT /api/user/password with JSON { "currentPassword": "WrongPass", "newPassword": "NewPass@5678" } | 400 Bad Request; error "Current password is incorrect"; password unchanged | As Expected |
| 36 | Access admin route as vendor | GET /api/admin/stats with VENDOR session token | 403 Forbidden; error "Insufficient permissions" | As Expected |
| 37 | Access API without authentication | GET /api/orders without session token | 401 Unauthorized; error "Not authenticated" | As Expected |
| 38 | Fetch audit logs | GET /api/admin/audit-logs | 200 OK; JSON array of AuditLog entries with action, entityType, userId, and timestamps | As Expected |
| 39 | Delete a notification | DELETE /api/notifications/<id> | 200 OK; notification record removed from DB; UI updated | As Expected |
| 40 | Concurrent order creation | POST /api/orders – three simultaneous requests for the same vendor | All three orders created with unique orderNumbers; no duplicate numbers; DB consistent | As Expected |
| 41 | Database connection failure | Stop PostgreSQL, call GET /api/vendors | 500 Internal Server Error; appropriate error message; no unhandled crash | As Expected |
| 42 | Fetch vendor orders (vendor role) | GET /api/vendor/orders | 200 OK; returns only orders belonging to the authenticated vendor | As Expected |
| 43 | Vendor attempts to view another vendor's data | GET /api/vendor/orders with vendorId of a different vendor | 403 Forbidden; error "Access denied"; no data returned | As Expected |
| 44 | AI batch processing | POST /api/ai/batch-process | 200 OK; risk scores, predictions, and anomaly alerts recalculated for all vendors; records updated | As Expected |
| 45 | Fetch performance predictions | GET /api/ai/predictions?vendorId=<id> | 200 OK; JSON array of VendorPerformancePrediction with predictionType, probability, and details | As Expected |


Test Summary

| Category | Total | Passed | Failed |
|----------|-------|--------|--------|
| Authentication and Signup | 7 | 7 | 0 |
| KYC Management | 3 | 3 | 0 |
| Purchase Orders | 4 | 3 | 1 |
| Invoices | 3 | 2 | 1 |
| Disputes | 3 | 3 | 0 |
| Returns and Credit Notes | 2 | 2 | 0 |
| Data Retrieval (GET) | 10 | 10 | 0 |
| Notifications | 3 | 3 | 0 |
| File Upload | 2 | 1 | 1 |
| User Settings | 3 | 3 | 0 |
| Security and Access Control | 2 | 2 | 0 |
| Edge Cases and Stress | 3 | 3 | 0 |
| **Total** | **45** | **42** | **3** |


Failed Test Case Analysis

Test #12 – Create order with invalid vendor ID
- Expected: 400 Bad Request with "Vendor not found" error
- Actual: 500 Internal Server Error due to unhandled Prisma foreign key constraint violation
- Fix Required: Add vendor existence check before inserting order; return 400 with descriptive message

Test #15 – Submit invoice with amount exceeding order value
- Expected: 400 Bad Request with validation error
- Actual: Invoice created successfully without any amount validation against the parent order
- Fix Required: Add server-side validation to compare invoice totalAmount against the linked PurchaseOrder amount

Test #31 – Upload file exceeding size limit
- Expected: 400 Bad Request with "File size exceeds limit" error
- Actual: 504 Gateway Timeout because the large file upload was processed without early size validation
- Fix Required: Add file size check middleware before forwarding to Cloudinary; reject files above threshold immediately
