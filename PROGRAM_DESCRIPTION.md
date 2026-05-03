4.3 Program Description

1. Project Overview
VendorGuard is a web-based AI-powered vendor risk management platform designed to automate vendor onboarding, compliance verification, procurement workflows, and risk assessment. The system provides a centralized dashboard for managing the complete vendor lifecycle — from registration and KYC verification to purchase order tracking, invoice processing, dispute resolution, and returns management. An integrated AI Risk Engine computes vendor risk scores using machine learning classification, anomaly detection, and performance prediction. The platform supports three user roles (Admin, Internal User, Vendor) with role-based access control across all modules. The application is implemented using Next.js (React) with TypeScript for the frontend and backend API routes, PostgreSQL with Prisma ORM for data persistence, and Python with scikit-learn for the machine learning pipeline.

2. Main Features
•	Authentication and Role Management – Provides secure login and registration using NextAuth with Credentials, Google, and Facebook providers. Manages JWT-based sessions with role-specific access control for Admin, Internal User, and Vendor roles.
•	Vendor Registration and KYC Verification – Enables vendors to register, submit business profiles, and upload compliance documents (GST, PAN, Business Registration). Admins can review, approve, or reject KYC submissions with automated email notifications.
•	Purchase Order and Delivery Management – Allows Internal Users to create and manage purchase orders for registered vendors. Tracks order status across the fulfilment lifecycle and displays vendor risk levels during order creation.
•	Invoice and Payment Management – Enables vendors to submit invoices linked to purchase orders. Supports invoice review, approval, and payment tracking with PDF and Excel export capabilities.
•	Dispute and Returns Management – Provides dispute creation, vendor response, and admin resolution workflows. Supports returns initiation linked to specific orders with credit note generation.
•	AI Risk Scoring Engine – Computes composite risk scores using a Random Forest classifier trained on vendor performance features. Classifies vendors into LOW, MEDIUM, and HIGH risk categories.
•	Performance Insight and Anomaly Detection – Applies Logistic Regression for performance prediction and Isolation Forest for anomaly detection. Forecasts risk trends using Linear Regression on historical score data.
•	Dashboard, Analytics, and Notification System – Presents role-based dashboards with KPI cards, risk distribution charts, and analytics visualisation. Implements a notification centre for event-driven alerts and maintains an audit trail for all system actions.

3. System Architecture
•	Frontend – Next.js with React and TypeScript for component-driven, server-rendered UI. Tailwind CSS for responsive styling.
•	Backend – Next.js API Routes providing RESTful endpoints for all functional modules. NextAuth for authentication and session management.
•	Database – PostgreSQL with Prisma ORM for type-safe database access, schema management, and migrations.
•	AI/ML Pipeline – Python with scikit-learn for model training and prediction. Models invoked from the Next.js backend via child process execution.
•	Cloud Services – Cloudinary for KYC document storage. Nodemailer for email delivery (password resets, KYC notifications).

4. Module and File Description

a)	Application Bootstrap
•	File: src/app/layout.tsx
•	Initialises the Next.js application, configures global styles, sets up meta tags, and wraps pages with the session provider.

b)	Authentication Configuration
•	File: src/auth.ts
•	Configures NextAuth with Credentials, Google, and Facebook providers. Defines JWT and session callbacks for embedding user role and ID into the session token.

c)	User Management Library
•	File: src/lib/users.ts
•	Provides functions for user creation with password hashing, email lookup, and password verification using bcryptjs and Prisma ORM.

d)	Registration API
•	File: src/app/api/signup/route.ts
•	Handles user registration with input validation, duplicate email detection, role assignment, and secure password storage.

e)	Vendor KYC API
•	File: src/app/api/vendor/kyc/route.ts
•	Manages vendor KYC data submission and retrieval. Performs upsert operations for business details, contact information, and compliance documents.

f)	Admin KYC Verification API
•	File: src/app/api/admin/kyc/route.ts
•	Enables Admins to approve or reject vendor KYC submissions using database transactions. Sends automated email notifications using Nodemailer with HTML templates.

g)	Purchase Order API
•	File: src/app/api/orders/route.ts
•	Handles purchase order creation with sequential order number generation and listing with role-based filtering, pagination, and vendor details.

h)	Order Status Update API
•	File: src/app/api/orders/[id]/route.ts
•	Provides status update functionality for purchase orders with status whitelist validation and role-based access control.

i)	AI Risk Score API
•	File: src/app/api/ai/risk-score/route.ts
•	Serves as the bridge between the Next.js backend and Python ML models. Returns individual vendor risk predictions or aggregated risk distribution statistics.

j)	Python ML Runner
•	File: src/lib/python-runner.ts
•	Executes Python prediction scripts as child processes and parses JSON results. Provides functions for risk, anomaly, performance, and trend predictions.

k)	ML Model Training Script
•	File: ml/scripts/train_models.py
•	Trains four ML models (Random Forest, Isolation Forest, Logistic Regression, Linear Regression) on vendor feature data and serialises them using joblib.

l)	ML Prediction Script
•	File: ml/scripts/predict.py
•	Loads trained models and generates predictions for individual vendors. Returns risk classification, anomaly detection, performance prediction, and trend forecasting results as JSON.

m)	Database Schema
•	File: prisma/schema.prisma
•	Defines all 17 database models and 21 enumerations using Prisma schema language. Manages entity relationships, constraints, and default values.

n)	Dashboard Layout and UI
•	Files: src/app/dashboard/layout.tsx, src/app/dashboard/admin/*, src/app/dashboard/internal/*, src/app/dashboard/vendor/*
•	Renders role-based dashboard pages with KPI cards, data tables, forms, modals, and Chart.js visualisations for each user role.

o)	Notification System
•	Files: src/lib/notifications.ts, src/app/api/notifications/route.ts
•	Creates event-driven notifications for key system actions and provides API endpoints for listing, marking as read, and managing notifications.

p)	Email Service
•	Files: src/lib/email.ts, src/lib/email-templates.ts
•	Configures Nodemailer for transactional email delivery. Provides HTML email templates for KYC approval, rejection, and password reset workflows.

5. Execution Flow
1.	The user accesses the VendorGuard web application through their browser.
2.	NextAuth authenticates the user via email/password or social login and issues a JWT session token with embedded role information.
3.	The frontend renders the role-appropriate dashboard (Admin, Internal User, or Vendor) with navigation, KPI cards, and analytics charts.
4.	Vendors submit their business profile and KYC compliance documents through the KYC form, which uploads documents to Cloudinary and stores records via Prisma ORM.
5.	Admins review KYC submissions and approve or reject them through the verification workflow, triggering automated email notifications to the vendor.
6.	Internal Users create purchase orders for active vendors, with the system displaying vendor risk levels during vendor selection to support informed procurement.
7.	Vendors view assigned purchase orders and submit invoices linked to those orders through the vendor portal.
8.	Disputes can be raised against vendors by Internal Users or Admins, and vendors respond through a single-response submission workflow. Admins resolve disputes with status updates and resolution notes.
9.	The AI Risk Engine is triggered to compute vendor risk scores by executing Python ML scripts via child processes, which load trained scikit-learn models and return JSON predictions.
10.	Risk scores, anomaly alerts, performance predictions, and trend forecasts are stored in the database and displayed on the admin and internal dashboards for review and decision-making.
