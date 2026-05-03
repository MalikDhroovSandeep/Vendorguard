2. Survey of Technologies

2.1.1 User Interface Frameworks

•	Next.js: React-based framework used for server-side rendering, file-based routing, and building a modular, component-driven frontend architecture.
•	React: Core library for building reusable UI components, managing state, and handling dynamic content rendering across role-based dashboards.
•	Tailwind CSS: Utility-first CSS framework used for responsive styling, consistent design tokens, and rapid UI development without writing custom CSS.
•	TypeScript: Statically typed superset of JavaScript used across the entire frontend for type-safe component development and reduced runtime errors.
•	Chart.js / Built-in Analytics Components: Used to visualize vendor risk scores, performance trends, anomaly distributions, and KPI summaries through interactive charts and cards.

2.1.2 Front-End Design Tools

•	Visual Studio Code: Primary IDE for frontend development with support for TypeScript, React, Tailwind CSS IntelliSense, and integrated terminal.
•	Browser Developer Tools: Used for UI debugging, DOM inspection, network request monitoring, and responsive design testing across multiple viewports.

2.2 Back-End Technologies

2.2.1 Programming Languages

•	TypeScript (Node.js): Primary language for backend API development using Next.js API routes, providing type-safe request handling, data validation, and business logic implementation.
•	Python (v3.9+): Used for developing the AI/ML layer including risk scoring models, performance prediction, and anomaly detection modules.

2.2.2 Backend Framework and Libraries

•	Next.js API Routes: Server-side API endpoints built within the Next.js framework, providing RESTful services for all functional modules including vendors, orders, invoices, disputes, returns, notifications, and reports.
•	NextAuth (v5 Beta): Authentication and session management library used for secure login, role-based access control, and session token handling across Admin, Internal User, and Vendor roles.
•	Prisma ORM: Type-safe Object-Relational Mapping tool used for database schema definition, migrations, query building, and data access layer abstraction.
•	bcryptjs: Cryptographic library used for secure password hashing and verification during user authentication.
•	Nodemailer: Email sending library used for password reset workflows, notification delivery, and transactional email communication.
•	Cloudinary: Cloud-based media management service used for secure document and image storage including KYC documents and invoice attachments.
•	jsPDF & jsPDF-AutoTable: Client-side PDF generation libraries used for exporting reports, invoices, and audit logs in downloadable PDF format.
•	xlsx: Library used for exporting data in Excel spreadsheet format for report generation and data export functionality.

2.2.3 Machine Learning Libraries

•	scikit-learn: Used to implement machine learning models for vendor risk scoring, severity classification, and performance prediction.
•	NumPy: Used for numerical computations, feature processing, and statistical calculations within the ML pipeline.
•	Data Preprocessing Pipelines: Custom scripts for data cleaning, feature engineering, and model evaluation within the ML service layer.

2.2.4 Database Systems

•	PostgreSQL: Relational database system used as the primary data store for all application data including users, vendors, orders, invoices, disputes, returns, notifications, and audit logs.
•	Prisma Schema: Declarative schema definition language used to define database models, relationships, enumerations, and constraints with automatic migration support.

2.3 AI/ML Technologies

VendorGuard integrates AI/ML techniques to enhance vendor risk assessment accuracy, predict performance trends, detect anomalous behaviour, and provide actionable insights for procurement decision-making.

2.3.1 Data Collection Methods

Data is collected from the application's operational modules including vendor profiles, purchase orders, invoice records, dispute history, delivery performance, and KYC verification status.

Sources Used:
•	Vendor profile and registration data
•	Purchase order fulfilment and delivery tracking records
•	Invoice submission and payment history
•	Dispute frequency, response times, and resolution outcomes
•	KYC verification status and compliance records
•	Historical performance metrics across all vendor interactions

2.3.2 Data Pre-processing Methods

•	Feature extraction from vendor operational data (delivery rates, dispute counts, fulfilment ratios)
•	Data normalization and scaling for consistent model input
•	Handling of missing values and incomplete vendor records
•	Temporal feature engineering for trend analysis across time periods
•	Aggregation of multi-dimensional vendor metrics into composite feature vectors
•	Data splitting for training, validation, and testing of ML models

2.3.3 Algorithms / Models Used

•	Weighted Risk Scoring Algorithm: Composite risk score calculation based on weighted factors including delivery performance, dispute frequency, order fulfilment rate, and payment reliability. The weighted scoring model acts as a baseline risk computation before ML refinement.
•	Risk Classification Model: Implemented using supervised learning algorithms such as Logistic Regression and Random Forest for vendor risk categorization into Low, Medium, and High risk categories using historical performance data.
•	Performance Insight Generation: Statistical trend analysis and ML classification applied on historical vendor data to generate performance insights and early warning indicators for proactive decision-making.
•	Anomaly Detection Module: Threshold-based and statistical deviation analysis (e.g., z-score comparison and moving average deviation) to identify abnormal vendor behaviour including sudden delivery failures, irregular invoicing patterns, and abnormal dispute frequencies.
•	Rule-Based Validation: Heuristic rules for KYC compliance checking, threshold-based alerting, and business rule enforcement.
