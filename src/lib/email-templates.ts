// Email templates for VendorGuard notifications

const baseStyles = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f8fafc;
    padding: 40px 20px;
`;

const containerStyles = `
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

const headerStyles = `
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    padding: 30px;
    text-align: center;
`;

const contentStyles = `
    padding: 30px;
    color: #334155;
    line-height: 1.6;
`;

const buttonStyles = `
    display: inline-block;
    background-color: #3b82f6;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    margin-top: 20px;
`;

const footerStyles = `
    background-color: #f1f5f9;
    padding: 20px;
    text-align: center;
    color: #64748b;
    font-size: 14px;
`;

function wrapTemplate(title: string, content: string, buttonUrl?: string, buttonText?: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="${baseStyles}">
    <div style="${containerStyles}">
        <div style="${headerStyles}">
            <h1 style="margin: 0; font-size: 24px;">VendorGuard</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">${title}</p>
        </div>
        <div style="${contentStyles}">
            ${content}
            ${buttonUrl ? `<p style="text-align: center;"><a href="${buttonUrl}" style="${buttonStyles}">${buttonText || 'View Details'}</a></p>` : ''}
        </div>
        <div style="${footerStyles}">
            <p style="margin: 0;">This is an automated message from VendorGuard.</p>
            <p style="margin: 10px 0 0;">Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
}

// KYC Templates
export function kycApprovedTemplate(vendorName: string): string {
    return wrapTemplate(
        'KYC Approved ✓',
        `
        <h2 style="color: #16a34a; margin-top: 0;">Congratulations, ${vendorName}!</h2>
        <p>Your KYC verification has been <strong style="color: #16a34a;">approved</strong>.</p>
        <p>You now have full access to all VendorGuard features:</p>
        <ul>
            <li>View and manage purchase orders</li>
            <li>Submit and track invoices</li>
            <li>Access performance insights</li>
        </ul>
        `,
        '/dashboard/vendor',
        'Go to Dashboard'
    );
}

export function kycRejectedTemplate(vendorName: string, reason: string): string {
    return wrapTemplate(
        'KYC Requires Attention',
        `
        <h2 style="color: #dc2626; margin-top: 0;">Action Required, ${vendorName}</h2>
        <p>Unfortunately, your KYC verification was <strong style="color: #dc2626;">not approved</strong>.</p>
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <strong>Reason:</strong><br>
            ${reason}
        </div>
        <p>Please update your KYC documents and resubmit for review.</p>
        `,
        '/dashboard/vendor/kyc',
        'Update KYC'
    );
}

// Order Templates
export function orderCreatedTemplate(vendorName: string, orderNumber: string, amount: string): string {
    return wrapTemplate(
        'New Purchase Order',
        `
        <h2 style="margin-top: 0;">New Order Received</h2>
        <p>Hello ${vendorName},</p>
        <p>A new purchase order has been created for your business:</p>
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Order Number:</strong> ${orderNumber}</p>
            <p style="margin: 10px 0 0;"><strong>Amount:</strong> ₹${amount}</p>
        </div>
        `,
        '/dashboard/vendor/orders',
        'View Order'
    );
}

export function orderStatusTemplate(vendorName: string, orderNumber: string, status: string): string {
    const statusColor = status === 'APPROVED' ? '#16a34a' : status === 'CANCELLED' ? '#dc2626' : '#3b82f6';
    return wrapTemplate(
        `Order ${status}`,
        `
        <h2 style="margin-top: 0;">Order Status Update</h2>
        <p>Hello ${vendorName},</p>
        <p>Your order <strong>${orderNumber}</strong> has been updated:</p>
        <div style="text-align: center; padding: 20px;">
            <span style="background-color: ${statusColor}; color: white; padding: 8px 20px; border-radius: 20px; font-weight: 600;">
                ${status}
            </span>
        </div>
        `,
        '/dashboard/vendor/orders',
        'View Details'
    );
}

// Invoice Templates
export function invoiceStatusTemplate(vendorName: string, invoiceNumber: string, status: string, amount?: string): string {
    const statusMessages: Record<string, string> = {
        'APPROVED': 'has been approved and is pending payment.',
        'PAID': 'has been paid. The funds should reflect in your account shortly.',
        'REJECTED': 'was rejected. Please review and resubmit if needed.',
    };
    const statusColor = status === 'PAID' ? '#16a34a' : status === 'REJECTED' ? '#dc2626' : '#3b82f6';

    return wrapTemplate(
        `Invoice ${status}`,
        `
        <h2 style="margin-top: 0;">Invoice Update</h2>
        <p>Hello ${vendorName},</p>
        <p>Your invoice <strong>${invoiceNumber}</strong> ${statusMessages[status] || 'has been updated.'}</p>
        ${amount ? `<p><strong>Amount:</strong> ₹${amount}</p>` : ''}
        <div style="text-align: center; padding: 20px;">
            <span style="background-color: ${statusColor}; color: white; padding: 8px 20px; border-radius: 20px; font-weight: 600;">
                ${status}
            </span>
        </div>
        `,
        '/dashboard/vendor/invoices',
        'View Invoice'
    );
}

// Dispute Templates
export function disputeCreatedTemplate(vendorName: string, disputeNumber: string, subject: string): string {
    return wrapTemplate(
        'New Dispute Filed',
        `
        <h2 style="color: #f59e0b; margin-top: 0;">Dispute Notice</h2>
        <p>Hello ${vendorName},</p>
        <p>A new dispute has been filed regarding your account:</p>
        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Dispute ID:</strong> ${disputeNumber}</p>
            <p style="margin: 10px 0 0;"><strong>Subject:</strong> ${subject}</p>
        </div>
        <p>Please review the dispute and provide your response as soon as possible.</p>
        `,
        '/dashboard/vendor/disputes',
        'View Dispute'
    );
}

export function disputeResolvedTemplate(vendorName: string, disputeNumber: string, resolution: string): string {
    return wrapTemplate(
        'Dispute Resolved',
        `
        <h2 style="color: #16a34a; margin-top: 0;">Dispute Closed</h2>
        <p>Hello ${vendorName},</p>
        <p>The dispute <strong>${disputeNumber}</strong> has been resolved.</p>
        <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
            <strong>Resolution:</strong><br>
            ${resolution}
        </div>
        `,
        '/dashboard/vendor/disputes',
        'View Details'
    );
}

// System Alert
export function systemAlertTemplate(title: string, message: string): string {
    return wrapTemplate(
        'System Notification',
        `
        <h2 style="margin-top: 0;">${title}</h2>
        <p>${message}</p>
        `,
        '/dashboard',
        'Go to Dashboard'
    );
}

// Password Reset Template
export function passwordResetTemplate(userName: string, resetUrl: string): string {
    return wrapTemplate(
        'Password Reset Request',
        `
        <h2 style="margin-top: 0;">Reset Your Password</h2>
        <p>Hello ${userName},</p>
        <p>We received a request to reset your password for your VendorGuard account.</p>
        <p>Click the button below to set a new password. This link will expire in <strong>1 hour</strong>.</p>
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
        `,
        resetUrl,
        'Reset Password'
    );
}

