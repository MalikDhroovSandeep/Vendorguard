# VendorGuard

**AI-Driven Vendor Reliability & Risk Scoring System**

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

VendorGuard is a web-based procurement and vendor management platform designed to help organizations manage the complete vendor lifecycle while proactively identifying vendor-related risks using Artificial Intelligence.

The system centralizes vendor onboarding, KYC verification, purchase order management, invoicing, dispute handling, and multiple AI-driven analytics modules. VendorGuard aims to improve transparency, reduce operational risk, and support data-driven procurement decisions.

---

## Objectives

- Provide a centralized platform for end-to-end vendor lifecycle management
- Automate vendor onboarding and KYC verification workflows
- Enable efficient purchase order and invoice management
- Implement AI-driven risk assessment and performance prediction
- Detect anomalies and potential fraud patterns in vendor activities
- Support data-driven decision making through analytics dashboards
- Ensure secure role-based access control for different user types

---

## Key Features

### Core Functional Modules

| Module | Description |
|--------|-------------|
| **Authentication & Authorization** | Secure login with role-based access control |
| **Vendor Registration & Profile Management** | Complete vendor onboarding and profile maintenance |
| **KYC Verification Workflow** | Document upload, verification, and approval process |
| **Purchase Order & Delivery Tracking** | Create, manage, and track purchase orders |
| **Invoice & Payment Management** | Invoice upload and payment status tracking |
| **Dispute Management** | Raise, monitor, and resolve vendor disputes |
| **Analytics Dashboard** | Role-based reporting and analytics views |

### Additional Features

- Automated alerts for high-risk vendors
- AI-generated recommendations for vendor monitoring
- Audit trail for all vendor-related actions
- Secure document storage for KYC and invoices
- Scalable modular architecture

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

VendorGuard follows a layered architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                        │
│              (Next.js + Tailwind CSS Frontend)              │
├─────────────────────────────────────────────────────────────┤
│                  BUSINESS LOGIC LAYER                       │
│            (Node.js + Express.js REST APIs)                 │
├─────────────────────────────────────────────────────────────┤
│                     AI/ML LAYER                             │
│         (Python + Scikit-learn ML Services)                 │
├─────────────────────────────────────────────────────────────┤
│                      DATA LAYER                             │
│              (PostgreSQL / MongoDB Database)                │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Principles

- **Modular Services:** Each functional module operates independently with well-defined interfaces
- **Separation of Concerns:** Clear boundaries between presentation, business logic, AI/ML, and data layers
- **Secure Access Control:** Role-based permissions enforced at the API level
- **Scalability:** Modular design supports horizontal scaling of individual components

---

## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js | React framework for server-side rendering and routing |
| Tailwind CSS | Utility-first CSS framework for styling |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime environment |
| Express.js | Web application framework for REST APIs |
| REST APIs | API architecture for client-server communication |

### Database
| Technology | Purpose |
|------------|---------|
| PostgreSQL / MongoDB | Primary database for data persistence |

### AI/ML
| Technology | Purpose |
|------------|---------|
| Python | Programming language for ML development |
| Scikit-learn | Machine learning library for model implementation |
| Data Preprocessing Pipelines | Data cleaning and feature engineering |
| Model Evaluation | Scoring logic and performance metrics |

---

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)
- PostgreSQL or MongoDB
- npm or yarn package manager

### Frontend Setup

```bash
# Navigate to project directory
cd vendorguard

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run development server
npm run dev
```

### AI/ML Service Setup

```bash
# Navigate to AI/ML directory
cd ml-services

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run ML service
python app.py
```

### Database Setup

1. Create a new database instance (PostgreSQL or MongoDB)
2. Update the database connection string in the backend `.env` file
3. Run database migrations (if applicable)

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
