3.4 Software and Hardware Requirements

Hardware Requirements

•	Standard PC or laptop
•	Minimum 8 GB RAM
•	Dual-core processor or higher
•	Stable internet connection for cloud database and external service integration

Software Requirements

Frontend
•	Next.js – React-based framework for server-side rendering and routing
•	React – Component-driven UI library for building interactive dashboards
•	Tailwind CSS – Utility-first CSS framework for responsive styling
•	TypeScript – Statically typed language for type-safe frontend development
•	Chart.js / Built-in Analytics Components – For data visualization and KPI charts

Backend
•	Node.js – JavaScript runtime for server-side execution
•	Next.js API Routes – RESTful API endpoints for all functional modules
•	NextAuth – Authentication and session management with role-based access control
•	Prisma ORM – Type-safe database access and schema management
•	bcryptjs – Secure password hashing and verification
•	Nodemailer – Email delivery for password resets and notifications
•	Cloudinary – Cloud-based document and image storage
•	jsPDF / xlsx – PDF and Excel report generation and export

AI/ML
•	Python – Programming language for machine learning module development
•	scikit-learn – ML library for risk classification and performance analysis
•	NumPy – Numerical computation and feature processing

Database
•	PostgreSQL – Relational database for all application data
•	Prisma Schema – Declarative database modelling with migration support

Tools
•	VS Code – Primary IDE for development
•	Postman – API testing and debugging
•	Browser Developer Tools – UI debugging and performance analysis
•	Git – Version control


3.5 Preliminary Product Description

Module 1: Authentication and Role Management
•	Provides secure login and registration for all user types.
•	Implements role-based access control with three roles: Admin, Internal User, and Vendor.
•	Manages user sessions using NextAuth with token-based authentication.
•	Supports password reset workflow via email with secure token generation.
•	Enforces role-specific access to dashboards, APIs, and functional modules.

Module 2: Vendor Registration and KYC Management
•	Allows vendors to register and maintain their business profiles.
•	Enables vendors to upload KYC documents for identity and compliance verification.
•	Provides Admin users with a KYC verification workflow to approve or reject submissions.
•	Stores KYC documents securely using cloud-based storage (Cloudinary).
•	Tracks KYC status across the vendor lifecycle (Pending, Verified, Rejected).

Module 3: Purchase Order and Delivery Management
•	Enables Internal Users to create and manage purchase orders for registered vendors.
•	Tracks order status across the fulfilment lifecycle (Pending, Confirmed, Shipped, Delivered).
•	Allows vendors to view assigned purchase orders and update delivery status.
•	Displays vendor risk level during purchase order creation to support informed decisions.
•	Maintains a complete order history for audit and analytics purposes.

Module 4: Invoice and Payment Management
•	Allows vendors to submit invoices linked to purchase orders.
•	Tracks invoice status and payment progress (Pending, Approved, Paid, Rejected).
•	Supports credit note generation for billing adjustments and corrections.
•	Enables PDF and Excel export of invoice records for reporting.
•	Provides Internal Users with invoice review and approval workflows.

Module 5: Dispute and Returns Management
•	Enables Internal Users and Admins to raise disputes against vendors.
•	Allows vendors to view and respond to disputes with a single response submission.
•	Provides Admins with dispute resolution workflows including status updates and resolution notes.
•	Supports returns request initiation linked to specific orders.
•	Tracks dispute and return status across the resolution lifecycle.

Module 6: AI Risk Scoring Engine
•	Computes a composite risk score for each vendor based on weighted historical factors.
•	Analyses delivery performance, dispute frequency, order fulfilment rate, and payment reliability.
•	The weighted scoring model acts as a baseline risk computation before ML refinement.
•	Classifies vendors into Low, Medium, or High risk categories using supervised learning algorithms such as Logistic Regression and Random Forest.
•	Displays risk scores and classifications on vendor profiles and dashboards.

Module 7: Performance Insight and Anomaly Detection
•	Generates performance insights using statistical trend analysis and ML classification on historical vendor data.
•	Provides early warning indicators for vendors likely to experience future issues.
•	Applies threshold-based and statistical deviation analysis (e.g., z-score comparison and moving average deviation) to detect abnormal vendor behaviour.
•	Flags anomalies such as sudden delivery failures, irregular invoicing patterns, and abnormal dispute frequencies.
•	Presents anomaly alerts for Admin review and investigation.

Module 8: Dashboard, Analytics, and Notification System
•	Presents role-based dashboards with KPI cards, summary statistics, and analytics visualizations.
•	Visualizes vendor risk distribution, performance trends, and operational metrics through interactive charts.
•	Supports filtering, sorting, and export of data across all modules.
•	Implements a notification centre for real-time event-driven alerts across all user roles.
•	Maintains an audit trail log for all vendor-related actions and system events.
•	Generates alerts for high-risk vendors and critical operational events.
