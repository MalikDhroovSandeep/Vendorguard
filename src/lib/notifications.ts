import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

interface CreateNotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
}

/**
 * Helper function to create notifications from anywhere in the app
 */
export async function createNotification({
    userId,
    type,
    title,
    message,
    link,
}: CreateNotificationParams) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                link: link || null,
            },
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

/**
 * Create notifications for all users with a specific role
 */
export async function createNotificationForRole(
    role: 'ADMIN' | 'INTERNAL_USER' | 'VENDOR',
    type: NotificationType,
    title: string,
    message: string,
    link?: string
) {
    try {
        const users = await prisma.user.findMany({
            where: { role, status: 'ACTIVE' },
            select: { id: true },
        });

        const notifications = await prisma.notification.createMany({
            data: users.map(user => ({
                userId: user.id,
                type,
                title,
                message,
                link: link || null,
            })),
        });

        return notifications;
    } catch (error) {
        console.error('Error creating notifications for role:', error);
        return null;
    }
}

/**
 * Get notification title and message templates
 */
export function getNotificationContent(type: NotificationType, data?: Record<string, string>) {
    const templates: Record<NotificationType, { title: string; message: string }> = {
        KYC_SUBMITTED: {
            title: 'New KYC Submission',
            message: `${data?.vendorName || 'A vendor'} has submitted their KYC documents for review.`,
        },
        KYC_APPROVED: {
            title: 'KYC Approved!',
            message: 'Your KYC documents have been verified successfully. You can now access all features.',
        },
        KYC_REJECTED: {
            title: 'KYC Rejected',
            message: `Your KYC submission was rejected. Reason: ${data?.reason || 'Please contact support.'}`,
        },
        ORDER_CREATED: {
            title: 'New Purchase Order',
            message: `A new purchase order #${data?.orderNumber || ''} has been assigned to you.`,
        },
        ORDER_APPROVED: {
            title: 'Order Approved',
            message: `Purchase order #${data?.orderNumber || ''} has been approved.`,
        },
        ORDER_DELIVERED: {
            title: 'Order Delivered',
            message: `Purchase order #${data?.orderNumber || ''} has been marked as delivered.`,
        },
        INVOICE_SUBMITTED: {
            title: 'New Invoice Received',
            message: `${data?.vendorName || 'A vendor'} has submitted invoice #${data?.invoiceNumber || ''} for review.`,
        },
        INVOICE_APPROVED: {
            title: 'Invoice Approved',
            message: `Your invoice #${data?.invoiceNumber || ''} has been approved for payment.`,
        },
        INVOICE_PAID: {
            title: 'Payment Processed',
            message: `Payment for invoice #${data?.invoiceNumber || ''} has been processed.`,
        },
        INVOICE_REJECTED: {
            title: 'Invoice Rejected',
            message: `Your invoice #${data?.invoiceNumber || ''} was rejected. ${data?.reason || ''}`,
        },
        DISPUTE_CREATED: {
            title: 'New Dispute Filed',
            message: `A dispute #${data?.disputeNumber || ''} has been filed regarding your order.`,
        },
        DISPUTE_RESOLVED: {
            title: 'Dispute Resolved',
            message: `Dispute #${data?.disputeNumber || ''} has been resolved.`,
        },
        SYSTEM_ALERT: {
            title: data?.title || 'System Alert',
            message: data?.message || 'You have a new system notification.',
        },
        RETURN_CREATED: {
            title: 'New Return Request',
            message: `Return #${data?.returnNumber || ''} has been created for your order.`,
        },
        RETURN_APPROVED: {
            title: 'Return Approved',
            message: `Return #${data?.returnNumber || ''} has been approved.`,
        },
        RETURN_REJECTED: {
            title: 'Return Rejected',
            message: `Return #${data?.returnNumber || ''} was rejected. ${data?.reason || ''}`,
        },
        CREDIT_NOTE_ISSUED: {
            title: 'Credit Note Issued',
            message: `Credit note #${data?.creditNumber || ''} has been issued for ₹${data?.amount || '0'}.`,
        },
    };

    return templates[type];
}
