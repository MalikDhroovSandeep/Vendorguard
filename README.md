# VendorGuard

**AI-assisted vendor management, risk scoring, and procurement workflow platform**

VendorGuard is a full-stack Next.js application for vendor onboarding, KYC handling, invoice and dispute workflows, role-based dashboards, and AI-assisted vendor risk analysis. The project combines a web app, Prisma-backed persistence, Cloudinary file storage, authentication, and Python ML scripts for model training and prediction.

---

## Table of Contents

- [Introduction](#introduction)
- [Objectives](#objectives)
- [Key Features](#key-features)
- [Role-Based Access Control](#role-based-access-control)
- [AI/ML Modules](#aiml-modules)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
- [Academic Disclaimer](#academic-disclaimer)

---

## Introduction

VendorGuard is built to centralize the vendor lifecycle in one place: registration, authentication, KYC review, order and invoice handling, dispute resolution, notifications, reporting, and AI-driven risk insight.

The app is structured for a clean academic-to-production path. The web layer is implemented with Next.js App Router, the database layer uses Prisma, the AI/ML layer is handled through Python scripts in the `ml/` directory, and file uploads are routed through Cloudinary.

---

## Objectives

- Provide a centralized platform for end-to-end vendor lifecycle management
- Support secure authentication and role-based access control
- Automate vendor onboarding, KYC review, and document handling
- Track orders, invoices, disputes, returns, and notifications in one workflow
- Surface AI-driven vendor risk and trend insights for better decisions
- Keep the project easy to run locally and easy to present publicly on GitHub

---

## Key Features

### Core Functional Modules

| Module | Description |
|--------|-------------|
| **Authentication & Authorization** | Auth.js/NextAuth-based login with role-based access control |
| **Vendor Registration & Profile Management** | Complete vendor onboarding and profile maintenance |
| **KYC Verification Workflow** | Document upload, verification, and approval process |
| **Purchase Order & Delivery Tracking** | Create, manage, and track purchase orders |
| **Invoice & Payment Management** | Invoice upload and payment status tracking |
| **Dispute Management** | Raise, monitor, and resolve vendor disputes |
| **Analytics Dashboard** | Role-based reporting and analytics views |
| **AI Insights** | Vendor risk scoring, trend prediction, and anomaly detection |

### Additional Features

- Automated alerts for high-risk vendors
- AI-generated recommendations for vendor monitoring
- Audit trail for key vendor-related actions
- Secure document storage for KYC and invoices
- ML training and prediction scripts under `ml/scripts/`
- Modular route-based architecture that keeps the codebase organized

---

## Role-Based Access Control

VendorGuard implements a comprehensive role-based access control system with three primary user roles:

### 1. Admin

The Admin role has the highest level of access and is responsible for system-wide oversight.

**Capabilities:**
- Approve or reject vendor KYC submissions
- Manage users and vendors across the platform
- View system-wide analytics and dashboards
- Monitor AI-generated vendor risk scores
- Resolve disputes and handle escalations

### 2. Internal User (Procurement / Operations Team)

Internal Users represent the procurement and operations teams within the organization.

**Capabilities:**
- Register and manage vendors
- Create and track purchase orders
- Upload invoices and track payment status
- Raise and monitor disputes
- Utilize AI insights to evaluate vendor reliability

### 3. Vendor

Vendors are external parties who supply goods or services to the organization.

**Capabilities:**
- Maintain vendor profile information
- Upload KYC documents for verification
- Update delivery and order fulfillment status
- View purchase orders and payment updates
- Respond to disputes
- View AI-generated performance feedback

---

## AI/ML Modules

VendorGuard integrates three AI/ML modules designed to enhance vendor management through intelligent analytics.

### AI Module 1: Vendor Risk Scoring Engine

**Purpose:** Calculate an overall risk score for each vendor to support informed procurement decisions.

**Methodology:**
- Analyzes historical data including delivery delays, dispute frequency, order fulfillment rate, and payment issues
- Generates a composite risk score based on weighted factors
- Classifies vendors into risk categories: **Low**, **Medium**, or **High**

**Output:** Numerical risk score with corresponding risk classification displayed on vendor profiles and dashboards.

---

### AI Module 2: Vendor Performance Prediction

**Purpose:** Predict future vendor performance trends to enable proactive decision-making.

**Methodology:**
- Utilizes historical performance data to identify patterns
- Applies predictive modeling to forecast potential issues
- Identifies vendors likely to experience delivery delays or raise disputes

**Output:** Performance trend predictions and early warning indicators for procurement teams.

---

### AI Module 3: Anomaly & Fraud Pattern Detection

**Purpose:** Detect unusual patterns in vendor activities that may indicate fraud or compliance issues.

**Methodology:**
- Monitors patterns in invoices, deliveries, and disputes
- Identifies statistical anomalies and deviations from normal behavior
- Flags abnormal behavior such as sudden delivery failures or frequent disputes

**Output:** Anomaly alerts and flagged activities for Admin review and investigation.

---

## System Architecture

VendorGuard follows a layered architecture with a clear separation between UI, server routes, persistence, file storage, and ML utilities:

```
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                        │
│             (Next.js App Router + CSS/Tailwind)             │
├─────────────────────────────────────────────────────────────┤
│                  APPLICATION LAYER                          │
│           (Next.js API Routes / Server Actions)             │
├─────────────────────────────────────────────────────────────┤
│                     AI/ML LAYER                             │
│         (Python scripts for training and prediction)        │
├─────────────────────────────────────────────────────────────┤
│                      DATA LAYER                             │
│               (PostgreSQL via Prisma ORM)                   │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Principles

- **Modular Services:** Each functional module operates independently with well-defined interfaces
- **Separation of Concerns:** Clear boundaries between presentation, business logic, AI/ML, and data layers
- **Secure Access Control:** Role-based permissions enforced at the API level
- **Scalability:** Modular design supports horizontal scaling of individual components
- **Practical Dev Setup:** Local secrets stay in `.env`, with `.env.example` provided for onboarding

---

## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js | React framework for server-side rendering and routing |
| Tailwind CSS | Utility-first CSS framework for styling |
| TypeScript | Type-safe application code |

### Backend
| Technology | Purpose |
|------------|---------|
| Next.js API Routes | Server-side endpoints for application workflows |
| Prisma | Type-safe ORM and database access layer |
| Auth.js / NextAuth | Authentication and session handling |

### Database
| Technology | Purpose |
|------------|---------|
| PostgreSQL | Primary database for data persistence |

### AI/ML
| Technology | Purpose |
|------------|---------|
| Python | Programming language for ML development |
| Scikit-learn | Machine learning library for model implementation |
| Pandas / NumPy | Data preparation and feature work |
| Model Training Scripts | Training and inference utilities in `ml/scripts/` |

### Storage and Integrations
| Technology | Purpose |
|------------|---------|
| Cloudinary | File storage for uploads and documents |
| Nodemailer | Email delivery for notifications and password reset flows |
| Python subprocess runner | Bridges the web app to ML scripts |

---

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)
- PostgreSQL
- npm or yarn package manager

### Environment Setup

1. Copy the example env file:

```bash
copy .env.example .env
```

2. Fill in your local values for:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` if you enable Google login
- `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET` if you enable Facebook login
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM`

### Application Setup

```bash
# Install dependencies
npm install

# Run database generation and migrations if needed
npx prisma generate
npx prisma migrate dev

# Run development server
npm run dev
```

The app will be available at `http://localhost:3000`

### ML Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r ml/requirements.txt

# Run training or prediction scripts
python ml/scripts/train_models.py
python ml/scripts/predict.py
```

### Data Setup

1. Create a PostgreSQL database
2. Set `DATABASE_URL` in `.env`
3. Run Prisma migrations and seed data as needed
4. Optionally run the ML scripts to refresh generated model artifacts

### Helpful Scripts

- `npm run dev` - start the Next.js app in development mode
- `npm run build` - create a production build
- `npm run lint` - run ESLint
- `npm run db:seed` - seed the database with initial data

---

## Academic Disclaimer

> **Note:** This project is developed as part of a university semester requirement for educational purposes. The AI/ML modules are implemented for educational and analytical purposes to demonstrate the application of machine learning concepts in a vendor management context. The system is designed as a proof-of-concept and may require additional development, testing, and security hardening for production deployment.

---

## License

This project is developed for academic purposes as part of a final-year university project.

---

## Contributors

- [Add team member names here]

---

*VendorGuard – Empowering Procurement with AI-Driven Insights*
