4.4 Naming Conventions

| Component | Naming Convention | Example |
|-----------|-------------------|---------|
| React components | PascalCase | Sidebar.tsx, KPICard.tsx |
| Next.js pages | kebab-case directories, page.tsx | dashboard/admin/page.tsx, forgot-password/page.tsx |
| Next.js API routes | kebab-case directories, route.ts | api/orders/route.ts, api/ai/risk-score/route.ts |
| Dynamic API routes | bracket notation, camelCase | api/orders/[id]/route.ts, api/disputes/[id]/route.ts |
| TypeScript interfaces / types | PascalCase | PredictionResult, UserRole, PurchaseOrder |
| TypeScript functions | camelCase | getUserByEmail(), verifyPassword(), runPythonPrediction() |
| TypeScript constants | UPPER_SNAKE_CASE | NEXTAUTH_SECRET, DATABASE_URL |
| TypeScript variables | camelCase | vendorId, riskScore, orderNumber |
| CSS files | kebab-case | globals.css |
| Tailwind CSS classes | kebab-case, utility-first | bg-gray-800, text-white, rounded-lg |
| Prisma models | PascalCase, singular | User, Vendor, PurchaseOrder, VendorKYC |
| PostgreSQL tables | snake_case, plural | users, vendors, purchase_orders, vendor_kyc |
| Database fields | camelCase (Prisma) / snake_case (SQL) | createdAt, riskScore, businessName |
| Prisma enums | PascalCase | UserRole, OrderStatus, RiskCategory |
| Prisma enum values | UPPER_SNAKE_CASE | ADMIN, INTERNAL_USER, IN_PROGRESS |
| Python modules / scripts | snake_case | train_models.py, predict.py, generate_data.py |
| Python functions | snake_case | train_risk_classifier(), predict_risk(), load_models() |
| Python classes | PascalCase | LabelEncoder, RandomForestClassifier |
| Python constants | UPPER_SNAKE_CASE | MODELS_DIR, SCRIPT_DIR, DATA_DIR |
| ML model files | snake_case, .pkl extension | risk_classifier.pkl, anomaly_detector.pkl |
| Environment variables | UPPER_SNAKE_CASE | DATABASE_URL, GOOGLE_CLIENT_ID, NEXTAUTH_SECRET |
| API endpoints | kebab-case, REST-style | /api/ai/risk-score, /api/vendor/kyc, /api/admin/kyc |
| Utility library files | camelCase or kebab-case | python-runner.ts, email-templates.ts, api-auth.ts |
| Email template functions | camelCase | kycApprovedTemplate(), kycRejectedTemplate() |
| Order number format | PREFIX-YEAR-SEQUENCE | PO-2026-0001, PO-2026-0002 |
| Git branches | kebab-case | feature-returns-module, bugfix-ai-score-display |
| Configuration files | kebab-case | package.json, tsconfig.json, tailwind.config.ts |
| Prisma schema file | kebab-case | schema.prisma |
