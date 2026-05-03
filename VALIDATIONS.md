4.5 Validations

1. Input Validations

These validations are applied on user input fields across all forms and API request bodies.

| Input Field | Validation Rule | Example (Correct / Wrong) |
|-------------|-----------------|---------------------------|
| Email address | Must be a non-empty string in valid email format; value is normalised to lowercase before storage. | ✅ Correct: user@example.com | ❌ Wrong: empty string, user@, plaintext |
| Password (registration) | Must be a non-empty string with a minimum length of 6 characters. | ✅ Correct: MyPass@123 | ❌ Wrong: abc, empty string |
| User role | Must be one of the valid enum values: admin, internal, vendor; invalid roles are rejected. | ✅ Correct: vendor | ❌ Wrong: superadmin, manager |
| Name | Must be a non-empty string; required for all user registrations. | ✅ Correct: Dhroov Sharma | ❌ Wrong: empty string |
| Order amount | Must be a positive numeric value greater than 0; non-numeric or negative values are rejected. | ✅ Correct: 25000.50 | ❌ Wrong: -100, 0, abc |
| Vendor ID | Must be a valid UUID referencing an existing vendor record; non-existent IDs return 404. | ✅ Correct: 507f1f77-bcf8-6cd7-9943-9011abcd1234 | ❌ Wrong: invalid-id, 123 |
| Order status | Must be one of the valid enum values: APPROVED, IN_PROGRESS, DELIVERED, COMPLETED, CANCELLED. | ✅ Correct: DELIVERED | ❌ Wrong: SHIPPED, done, random |
| Invoice status | Must be one of: PENDING, APPROVED, PAID, REJECTED; invalid status values return 400 error. | ✅ Correct: APPROVED | ❌ Wrong: PROCESSED, paid_out |
| Dispute fields | Subject, vendorId, and category are mandatory; missing required fields return 400 error. | ✅ Correct: {vendorId, subject, category} | ❌ Wrong: {subject} only |
| KYC action | Must be either APPROVE or REJECT; rejection requires a non-empty rejectionReason string. | ✅ Correct: {action: "APPROVE"} | ❌ Wrong: {action: "HOLD"} |
| File upload type | Must be one of: application/pdf, image/jpeg, image/png, image/jpg; other types are rejected. | ✅ Correct: document.pdf, photo.jpg | ❌ Wrong: script.exe, data.csv |
| File upload size | Must not exceed 5 MB (5,242,880 bytes); larger files are rejected with a 400 error. | ✅ Correct: 2 MB PDF | ❌ Wrong: 10 MB image |
| Password reset token | Must be a non-empty string; password must be at least 6 characters. | ✅ Correct: {token: "abc123...", password: "NewPass1"} | ❌ Wrong: {token: "", password: "ab"} |
| Pagination parameters | Page and limit must be positive integers; defaults are page=1, limit=10. | ✅ Correct: ?page=2&limit=20 | ❌ Wrong: ?page=-1&limit=abc |


2. Backend Validations

These validations act as a second layer of protection on the server side. Even if a user bypasses frontend checks, backend rules ensure data consistency.

| Validation Area | Rule Applied | Example (Correct / Wrong) |
|-----------------|-------------|---------------------------|
| Authentication check | Every protected API route verifies the JWT session token via NextAuth auth() before processing. | ✅ Correct: Request with valid session token | ❌ Wrong: Request without token returns 401 |
| Role-based access control | Routes enforce role restrictions (e.g., admin-only, internal-only); unauthorised roles return 403. | ✅ Correct: Admin accessing /api/admin/kyc | ❌ Wrong: Vendor accessing admin route returns 403 |
| Duplicate email prevention | Registration checks for existing email in the database; duplicate emails return 409 Conflict. | ✅ Correct: New email registers successfully | ❌ Wrong: Existing email returns "User already exists" |
| Vendor existence check | Order and dispute creation verify that the referenced vendor exists; non-existent vendors return 404. | ✅ Correct: Order for active vendor | ❌ Wrong: Order for deleted vendor returns 404 |
| Order existence check | Dispute and return creation verify that the referenced order exists; invalid references return 404. | ✅ Correct: Dispute linked to existing order | ❌ Wrong: Dispute with non-existent orderId |
| Status transition validation | Order, invoice, and dispute status updates validate against a whitelist of permitted status values. | ✅ Correct: Order status set to DELIVERED | ❌ Wrong: Order status set to RANDOM returns 400 |
| KYC status transition | KYC status changes from PENDING to SUBMITTED only on first submission; re-submissions update data without status change. | ✅ Correct: PENDING → SUBMITTED on first submit | ❌ Wrong: VERIFIED status cannot revert |
| Password verification | Password change requires the current password to match the stored bcrypt hash before accepting a new password. | ✅ Correct: Current password matches hash | ❌ Wrong: Wrong current password returns 400 |
| Token expiry validation | Password reset tokens are validated for expiry (1-hour window) and single-use; expired or used tokens return 400. | ✅ Correct: Token used within 1 hour | ❌ Wrong: Expired token returns "Reset link has expired" |
| Database transaction integrity | KYC approval/rejection uses Prisma $transaction to atomically update both vendor status and KYC record. | ✅ Correct: Both vendor and KYC updated together | ❌ Wrong: Partial update prevented by transaction rollback |
| Decimal precision enforcement | Monetary amounts use Prisma Decimal(15,2) to prevent floating-point precision errors. | ✅ Correct: 25000.50 stored precisely | ❌ Wrong: Floating-point rounding avoided |
| ML model availability check | AI risk score API verifies that trained ML models exist on the server before invoking predictions. | ✅ Correct: Models loaded, prediction returned | ❌ Wrong: Models missing returns 503 Service Unavailable |
| Vendor response single-use | Vendor dispute response can only be submitted once; subsequent attempts return "Already responded" error. | ✅ Correct: First response accepted | ❌ Wrong: Second response blocked with 400 |


3. Security Validations

Security validations ensure the platform is resistant to malicious inputs and misuse.

| Security Area | Validation / Protection | Example (Allowed / Blocked) |
|---------------|------------------------|------------------------------|
| Password hashing | All passwords hashed using bcryptjs with salt round of 10 before storage; plaintext never persisted. | ✅ Allowed: $2a$10$... stored in database | ❌ Blocked: Plaintext password storage |
| JWT session security | Sessions use signed JWT tokens with a server-side secret; tampered tokens are rejected by NextAuth. | ✅ Allowed: Valid JWT with correct signature | ❌ Blocked: Modified/forged JWT token |
| Email enumeration prevention | Forgot password endpoint returns the same success message regardless of whether the email exists. | ✅ Allowed: "If an account exists, you will receive a reset link." | ❌ Blocked: "Email not found" (never exposed) |
| CSRF protection | NextAuth includes built-in CSRF token verification for all authentication state-changing requests. | ✅ Allowed: Request with valid CSRF token | ❌ Blocked: Cross-site forged request |
| File type restriction | Upload endpoint enforces an allowlist of MIME types (PDF, JPG, PNG); executable and script files blocked. | ✅ Allowed: application/pdf, image/jpeg | ❌ Blocked: application/x-executable, text/html |
| File size limit | Upload endpoint enforces a 5 MB maximum file size; oversized uploads rejected before processing. | ✅ Allowed: 3 MB document | ❌ Blocked: 10 MB file returns 400 |
| Filename sanitisation | Uploaded filenames are sanitised by replacing special characters with underscores to prevent path traversal. | ✅ Allowed: user_id_timestamp_document.pdf | ❌ Blocked: ../../etc/passwd |
| Token single-use enforcement | Password reset tokens are marked as used after consumption; existing tokens are deleted before issuing new ones. | ✅ Allowed: First use of reset token | ❌ Blocked: Reuse of consumed token |
| SQL injection prevention | Prisma ORM uses parameterised queries for all database operations; raw SQL strings never constructed from user input. | ✅ Allowed: prisma.user.findUnique({where: {email}}) | ❌ Blocked: String-concatenated SQL queries |
| Role escalation prevention | User role is set from the JWT token on the server side, not from client request body; role tampering is impossible. | ✅ Allowed: Role read from session.user.role | ❌ Blocked: Client-sent role field ignored |
| Secure token generation | Password reset tokens generated using crypto.randomBytes(32) for cryptographic randomness. | ✅ Allowed: 64-character hex token | ❌ Blocked: Predictable sequential tokens |
| Email case normalisation | All email addresses normalised to lowercase before storage and lookup to prevent case-based duplicate accounts. | ✅ Allowed: User@Example.com stored as user@example.com | ❌ Blocked: Case-sensitive duplicate registration |
| ML process isolation | Python ML scripts executed as isolated child processes with a 30-second timeout to prevent resource exhaustion. | ✅ Allowed: Prediction returns within 30s | ❌ Blocked: Hung process terminated after timeout |
