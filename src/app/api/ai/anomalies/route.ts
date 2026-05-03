import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { runPythonPrediction, checkModelsAvailable } from '@/lib/python-runner';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/ai/anomalies
 * Get anomaly alerts from ML model
 * 
 * Query params:
 * - vendorId: specific vendor ID (optional)
 * - severity: filter by severity (LOW, MEDIUM, HIGH, CRITICAL)
 * - status: filter by status (NEW, UNDER_INVESTIGATION, DISMISSED, CONFIRMED)
 */
export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const vendorId = searchParams.get('vendorId');
        const severity = searchParams.get('severity');
        const status = searchParams.get('status');

        // Build where clause
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (vendorId) where.vendorId = vendorId;
        if (severity) where.severity = severity;
        if (status) where.status = status;

        // Get anomaly alerts from database
        const alerts = await prisma.anomalyAlert.findMany({
            where,
            include: {
                vendor: {
                    select: {
                        businessName: true,
                        riskCategory: true,
                    },
                },
                investigatedBy: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: [
                { severity: 'desc' },
                { createdAt: 'desc' },
            ],
            take: 50,
        });

        // If specific vendor requested and no DB alerts, run live detection
        if (vendorId && alerts.length === 0) {
            const modelsReady = await checkModelsAvailable();
            if (modelsReady) {
                const prediction = await runPythonPrediction(vendorId, 'anomaly');
                if (prediction.anomaly) {
                    return NextResponse.json({
                        alerts: prediction.anomaly.is_anomaly ? [{
                            id: 'live-detection',
                            vendorId,
                            isAnomaly: prediction.anomaly.is_anomaly,
                            anomalyScore: prediction.anomaly.anomaly_score,
                            details: prediction.anomaly.details,
                            createdAt: new Date().toISOString(),
                        }] : [],
                        source: 'live',
                    });
                }
            }
        }

        // Calculate stats
        const stats = {
            total: alerts.length,
            bySeverity: {
                CRITICAL: alerts.filter(a => a.severity === 'CRITICAL').length,
                HIGH: alerts.filter(a => a.severity === 'HIGH').length,
                MEDIUM: alerts.filter(a => a.severity === 'MEDIUM').length,
                LOW: alerts.filter(a => a.severity === 'LOW').length,
            },
            newAlerts: alerts.filter(a => a.status === 'NEW').length,
        };

        return NextResponse.json({
            alerts,
            stats,
            source: 'database',
        });
    } catch (error) {
        console.error('Anomaly API error:', error);
        return NextResponse.json(
            { error: 'Failed to get anomaly alerts' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/ai/anomalies
 * Run anomaly detection for a vendor
 */
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { vendorId } = await request.json();

        if (!vendorId) {
            return NextResponse.json({ error: 'vendorId is required' }, { status: 400 });
        }

        const modelsReady = await checkModelsAvailable();
        if (!modelsReady) {
            return NextResponse.json(
                { error: 'ML models not available' },
                { status: 503 }
            );
        }

        // Run anomaly detection
        const prediction = await runPythonPrediction(vendorId, 'anomaly');

        if (prediction.error) {
            return NextResponse.json({ error: prediction.error }, { status: 400 });
        }

        // If anomaly detected, save to database
        if (prediction.anomaly?.is_anomaly && prediction.anomaly.details.length > 0) {
            const vendor = await prisma.vendor.findFirst({
                where: { id: vendorId },
            });

            if (vendor) {
                for (const detail of prediction.anomaly.details) {
                    await prisma.anomalyAlert.create({
                        data: {
                            vendorId: vendor.id,
                            alertType: detail.type as 'INVOICE_ANOMALY' | 'DELIVERY_PATTERN' | 'DISPUTE_PATTERN' | 'FRAUD_SUSPECTED',
                            severity: detail.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
                            title: `${detail.type.replace('_', ' ')} Detected`,
                            description: detail.message,
                            status: 'NEW',
                        },
                    });
                }
            }
        }

        return NextResponse.json({
            vendorId,
            ...prediction.anomaly,
        });
    } catch (error) {
        console.error('Anomaly detection error:', error);
        return NextResponse.json(
            { error: 'Failed to run anomaly detection' },
            { status: 500 }
        );
    }
}
