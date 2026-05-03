3.7 System Coding

This section presents the key code implementations across the core functional modules of VendorGuard. Each subsection includes a brief explanation of the module's purpose and role within the system, followed by representative code snippets demonstrating the critical logic and API design.


3.7.1 Authentication Module

The Authentication Module handles user registration, login, session management, and role-based access control. It is built using NextAuth with the Credentials provider for email/password authentication, along with support for social logins via Google and Facebook. Passwords are securely hashed using bcryptjs, and sessions are managed through JSON Web Tokens (JWT). Each user is assigned a role (Admin, Internal User, or Vendor) at registration, which is embedded in the session token and enforced across all protected routes.

Code Snippet – NextAuth Configuration with Credentials and JWT Callbacks (src/auth.ts)

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import { getUserByEmail, verifyPassword } from '@/lib/users';

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                const email = credentials.email as string;
                const password = credentials.password as string;

                const user = await getUserByEmail(email);
                if (!user) return null;

                const isValid = await verifyPassword(password, user.password);
                if (!isValid) return null;

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
        Facebook({
            clientId: process.env.FACEBOOK_CLIENT_ID || '',
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
        }),
    ],
    pages: { signIn: '/login' },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.role = user.role || 'vendor';
                token.id = user.id;
            }
            if (account) {
                token.provider = account.provider;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    session: { strategy: 'jwt' },
    secret: process.env.NEXTAUTH_SECRET,
});

The authorize function validates user credentials against the database using bcrypt password comparison. The jwt callback embeds the user role and ID into the token on login, while the session callback exposes these values to the client-side session object, enabling role-based rendering and API access control throughout the application.

Code Snippet – User Registration with Password Hashing (src/lib/users.ts)

import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export async function createUser(
    name: string,
    email: string,
    password: string,
    role: UserRole
): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const prismaRole = roleMap[role];

    const newUser = await prisma.user.create({
        data: {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: prismaRole,
        },
    });

    return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: reverseRoleMap[newUser.role] as UserRole,
    };
}

The createUser function hashes the plaintext password with a salt round of 10 using bcryptjs before persisting the user record to the PostgreSQL database via Prisma ORM. The role string is mapped to the corresponding Prisma enum value to maintain type safety between the application layer and the database schema.


3.7.2 Vendor Management Module

The Vendor Management Module handles vendor registration, profile management, and KYC (Know Your Customer) document verification. Vendors submit their business details, contact information, and compliance documents through the KYC workflow. Admins can review, approve, or reject KYC submissions through a dedicated verification workflow, with automated email notifications sent to vendors upon status updates.

Code Snippet – Vendor KYC Submission API (src/app/api/vendor/kyc/route.ts)

export async function PUT(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vendor = await getVendorWithKyc(session);
    if (!vendor) {
        return NextResponse.json(
            { error: 'Vendor profile not found' },
            { status: 404 }
        );
    }

    const body = await request.json();
    const { businessDetails, contact, kyc, documents } = body;

    // Update or create KYC info
    if (kyc) {
        await prisma.vendorKYC.upsert({
            where: { vendorId: vendor.id },
            create: {
                vendorId: vendor.id,
                gstNumber: kyc.gstNumber,
                panNumber: kyc.panNumber,
                businessDocType: kyc.businessDocType || null,
                businessDocNumber: kyc.businessDocNumber,
                businessDocAuthority: kyc.businessDocAuthority,
                businessDocIssueDate: kyc.businessDocIssueDate
                    ? new Date(kyc.businessDocIssueDate)
                    : null,
                submittedAt: new Date(),
            },
            update: {
                gstNumber: kyc.gstNumber,
                panNumber: kyc.panNumber,
                businessDocType: kyc.businessDocType || null,
                businessDocNumber: kyc.businessDocNumber,
                businessDocAuthority: kyc.businessDocAuthority,
                businessDocIssueDate: kyc.businessDocIssueDate
                    ? new Date(kyc.businessDocIssueDate)
                    : null,
                submittedAt: new Date(),
                ...(documents?.gstDocument && {
                    gstDocument: documents.gstDocument,
                }),
                ...(documents?.panDocument && {
                    panDocument: documents.panDocument,
                }),
                ...(documents?.businessDocument && {
                    businessDocument: documents.businessDocument,
                }),
            },
        });

        // Update KYC status to SUBMITTED if it was PENDING
        if (vendor.kycStatus === 'PENDING') {
            await prisma.vendor.update({
                where: { id: vendor.id },
                data: { kycStatus: 'SUBMITTED' },
            });
        }
    }

    return NextResponse.json({ message: 'KYC data saved successfully' });
}

This endpoint handles vendor KYC data submission using the Prisma upsert operation, which either creates a new KYC record or updates an existing one. It processes business compliance documents (GST, PAN, and business registration), stores uploaded document URLs from Cloudinary, and transitions the KYC status from PENDING to SUBMITTED when the vendor completes their first submission.

Code Snippet – Admin KYC Approval/Rejection with Email Notification (src/app/api/admin/kyc/route.ts)

export async function PUT(request: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { vendorId, action, rejectionReason } = body;

    if (!vendorId || !['APPROVE', 'REJECT'].includes(action)) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Update vendor status using database transaction
    const result = await prisma.$transaction(async (tx) => {
        if (action === 'APPROVE') {
            const updatedVendor = await tx.vendor.update({
                where: { id: vendorId },
                data: {
                    kycStatus: 'VERIFIED',
                    status: 'ACTIVE',
                },
            });

            await tx.vendorKYC.upsert({
                where: { vendorId },
                update: { reviewedAt: new Date() },
                create: { vendorId, reviewedAt: new Date() },
            });

            return updatedVendor;
        } else {
            const updatedVendor = await tx.vendor.update({
                where: { id: vendorId },
                data: { kycStatus: 'REJECTED' },
            });

            await tx.vendorKYC.upsert({
                where: { vendorId },
                update: {
                    reviewedAt: new Date(),
                    rejectionReason: rejectionReason,
                },
                create: {
                    vendorId,
                    reviewedAt: new Date(),
                    rejectionReason: rejectionReason,
                },
            });

            return updatedVendor;
        }
    });

    // Send email notification
    if (vendorWithUser?.user?.email) {
        if (action === 'APPROVE') {
            await sendEmail({
                to: emailTo,
                subject: 'Your KYC has been approved - VendorGuard',
                html: kycApprovedTemplate(vendorName),
            });
        } else {
            await sendEmail({
                to: emailTo,
                subject: 'KYC Verification Update - VendorGuard',
                html: kycRejectedTemplate(vendorName, rejectionReason),
            });
        }
    }

    return NextResponse.json({
        message: `Vendor KYC ${action === 'APPROVE' ? 'approved' : 'rejected'}`,
        vendor: result,
    });
}

The Admin KYC verification endpoint uses a Prisma database transaction to ensure atomic updates when approving or rejecting vendor submissions. On approval, the vendor status is set to ACTIVE and KYC status to VERIFIED. On rejection, a reason is recorded. After the transaction completes successfully, an automated email notification is sent to the vendor using Nodemailer with HTML email templates.


3.7.3 Purchase Order Module

The Purchase Order Module enables Internal Users to create, manage, and track purchase orders for registered vendors. Each order follows a status lifecycle (Pending, Approved, In Progress, Shipped, Delivered, Completed, Cancelled) and is linked to a specific vendor and the user who created it. The module enforces role-based access control so that Internal Users only view their own orders while Admins have visibility over all orders. Vendor risk levels are displayed during order creation to support risk-informed procurement decisions.

Code Snippet – Purchase Order Creation API (src/app/api/orders/route.ts)

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    if (userRole !== 'admin' && userRole !== 'internal') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { vendorId, title, amount, expectedDelivery, description } = body;

    // Validate required fields
    if (!vendorId || !title || !amount) {
        return NextResponse.json(
            { error: 'Missing required fields: vendorId, title, amount' },
            { status: 400 }
        );
    }

    // Check vendor exists
    const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
    });

    if (!vendor) {
        return NextResponse.json(
            { error: 'Vendor not found' },
            { status: 404 }
        );
    }

    // Generate unique order number
    const orderCount = await prisma.purchaseOrder.count();
    const orderNumber = `PO-${new Date().getFullYear()}-${String(
        orderCount + 1
    ).padStart(4, '0')}`;

    const order = await prisma.purchaseOrder.create({
        data: {
            orderNumber,
            vendorId,
            createdById: session.user.id as string,
            title,
            description,
            amount: new Prisma.Decimal(amount),
            expectedDelivery: expectedDelivery
                ? new Date(expectedDelivery)
                : null,
            status: 'APPROVED',
        },
        include: {
            vendor: { select: { businessName: true } },
        },
    });

    return NextResponse.json(
        { message: 'Order created successfully', order },
        { status: 201 }
    );
}

The order creation endpoint validates required fields, verifies vendor existence, and generates a unique sequential order number in the format PO-YYYY-NNNN. The monetary amount is stored using Prisma Decimal type for financial precision. The order is linked to both the vendor and the creating user via foreign key relationships.

Code Snippet – Order Status Update with Validation (src/app/api/orders/[id]/route.ts)

export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    if (userRole !== 'admin' && userRole !== 'internal') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    const validStatuses = [
        'APPROVED',
        'IN_PROGRESS',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED',
    ];

    if (!status || !validStatuses.includes(status)) {
        return NextResponse.json(
            { error: 'Invalid status' },
            { status: 400 }
        );
    }

    const order = await prisma.purchaseOrder.update({
        where: { id: params.id },
        data: { status },
    });

    return NextResponse.json({
        message: 'Order updated successfully',
        order,
    });
}

The status update endpoint enforces a whitelist of valid status values to ensure that orders can only transition to permitted states within the fulfilment lifecycle. The dynamic route parameter [id] is used to target the specific purchase order record. Role-based access restricts this operation to Admin and Internal User roles only.


3.7.4 AI Risk Engine

The AI Risk Engine computes a composite risk score for each vendor using a combination of a weighted baseline scoring model and machine learning classification. The system trains four ML models using scikit-learn: a Random Forest Classifier for risk level classification, an Isolation Forest for anomaly detection, a Logistic Regression model for performance prediction, and a Linear Regression model for risk trend forecasting. These Python-based models are invoked from the Next.js backend through a child process runner that executes the prediction scripts and returns results as JSON.

Code Snippet – Random Forest Risk Classifier Training (ml/scripts/train_models.py)

def train_risk_classifier(df: pd.DataFrame) -> dict:
    """
    Train Random Forest Classifier for vendor risk scoring.
    Target: risk_level (LOW/MEDIUM/HIGH)
    """
    features = [
        'industry_risk_factor',
        'years_in_business',
        'on_time_delivery_rate',
        'avg_delivery_delay_days',
        'total_disputes',
        'quality_issues_count',
        'dispute_resolution_time_avg',
        'manual_reliability_rating',
        'total_orders',
        'avg_monthly_disputes',
    ]

    X = df[features]
    y = df['risk_level']

    # Encode labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    # Train model
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    # Feature importance
    importance = dict(zip(features, model.feature_importances_))

    # Save model and encoder
    joblib.dump(model, os.path.join(MODELS_DIR, 'risk_classifier.pkl'))
    joblib.dump(label_encoder, os.path.join(MODELS_DIR, 'risk_label_encoder.pkl'))

    return {
        'model': 'risk_classifier',
        'algorithm': 'RandomForest',
        'accuracy': round(accuracy, 4),
        'features': features,
    }

The risk classifier uses a Random Forest ensemble with 100 decision trees, trained on 10 vendor performance features including delivery rates, dispute frequency, and reliability ratings. The dataset is split with stratification to preserve class balance across LOW, MEDIUM, and HIGH risk categories. The trained model and label encoder are serialised using joblib for deployment.

Code Snippet – Risk Score Prediction from Trained Model (ml/scripts/predict.py)

def predict_risk(models: dict, vendor_data: dict) -> dict:
    """Predict risk level for a vendor."""
    features = [
        'industry_risk_factor',
        'years_in_business',
        'on_time_delivery_rate',
        'avg_delivery_delay_days',
        'total_disputes',
        'quality_issues_count',
        'dispute_resolution_time_avg',
        'manual_reliability_rating',
        'total_orders',
        'avg_monthly_disputes',
    ]

    # Prepare input
    X = np.array([[vendor_data.get(f, 0) for f in features]])

    # Predict
    model = models['risk_classifier']
    encoder = models['risk_label_encoder']

    prediction = model.predict(X)[0]
    probabilities = model.predict_proba(X)[0]

    risk_level = encoder.inverse_transform([prediction])[0]

    # Calculate risk score (0-100) based on probabilities
    risk_score = int(
        probabilities[0] * 0
        + probabilities[1] * 50
        + probabilities[2] * 100
    )

    return {
        'risk_level': risk_level,
        'risk_score': risk_score,
        'probabilities': {
            'LOW': round(probabilities[0], 4),
            'MEDIUM': round(probabilities[1], 4),
            'HIGH': round(probabilities[2], 4),
        }
    }

The prediction function loads the trained Random Forest model and constructs a feature vector from the vendor's operational data. It returns the predicted risk level (LOW, MEDIUM, or HIGH), a numerical risk score computed as a weighted sum of class probabilities (0 for LOW, 50 for MEDIUM, 100 for HIGH), and the individual class probabilities for transparency.

Code Snippet – AI Risk Score API Endpoint (src/app/api/ai/risk-score/route.ts)

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');

    // Check if ML models are available
    const modelsReady = await checkModelsAvailable();
    if (!modelsReady) {
        return NextResponse.json(
            { error: 'ML models not available. Please run model training first.' },
            { status: 503 }
        );
    }

    if (vendorId) {
        // Get risk score for specific vendor
        const prediction = await runPythonPrediction(vendorId, 'risk');
        if (prediction.error) {
            return NextResponse.json(
                { error: prediction.error },
                { status: 400 }
            );
        }
        return NextResponse.json({ vendorId, ...prediction.risk });
    } else {
        // Get aggregated risk statistics
        const vendors = await prisma.vendor.findMany({
            select: {
                id: true,
                businessName: true,
                riskScore: true,
                riskCategory: true,
            },
        });

        const distribution = {
            LOW: vendors.filter((v) => v.riskCategory === 'LOW').length,
            MEDIUM: vendors.filter((v) => v.riskCategory === 'MEDIUM').length,
            HIGH: vendors.filter((v) => v.riskCategory === 'HIGH').length,
        };

        const avgScore =
            vendors.reduce((sum, v) => sum + (Number(v.riskScore) || 50), 0) /
            vendors.length;

        return NextResponse.json({
            totalVendors: vendors.length,
            distribution,
            averageRiskScore: Math.round(avgScore),
            highRiskVendors: vendors.filter(
                (v) => v.riskCategory === 'HIGH'
            ),
        });
    }
}

The risk score API serves as the bridge between the Next.js backend and the Python ML models. It first verifies that trained models are available on the server. For individual vendor queries, it invokes the Python prediction script via a child process and returns the ML-generated risk score. For aggregate queries, it computes a risk distribution summary across all vendors directly from the database, providing the data for dashboard analytics and risk visualisation charts.
