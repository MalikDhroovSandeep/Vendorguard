import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

/**
 * Send an email using configured SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'VendorGuard <noreply@vendorguard.com>',
            to: options.to,
            subject: options.subject,
            text: options.text || options.html.replace(/<[^>]*>/g, ''),
            html: options.html,
        });

        console.log('Email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
}

/**
 * Verify SMTP connection
 */
export async function verifyEmailConnection(): Promise<boolean> {
    try {
        await transporter.verify();
        console.log('SMTP connection verified');
        return true;
    } catch (error) {
        console.error('SMTP connection failed:', error);
        return false;
    }
}

export default transporter;
