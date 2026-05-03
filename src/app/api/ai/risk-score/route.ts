import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { runPythonPrediction, checkModelsAvailable } from '@/lib/python-runner';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/ai/risk-score
 * Get vendor risk scores from ML model
 * 
 * Query params:
 * - vendorId: specific vendor ID (optional, returns all if not provided)
 */
export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const vendorId = searchParams.get('vendorId');

        // Check if models are available
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
                return NextResponse.json({ error: prediction.error }, { status: 400 });
            }

            // Fetch latest sub-scores from DB
            const latestScore = await prisma.vendorRiskScore.findFirst({
                where: { vendorId },
                orderBy: { calculatedAt: 'desc' },
                select: {
                    deliveryScore: true,
                    disputeScore: true,
                    paymentScore: true,
                    fulfillmentScore: true,
                },
            });

            // Normalize snake_case from Python to camelCase for frontend
            const risk = prediction.risk;
            return NextResponse.json({
                vendorId,
                riskScore: risk?.risk_score ?? 0,
                riskLevel: risk?.risk_level ?? 'MEDIUM',
                riskCategory: risk?.risk_level ?? 'MEDIUM',
                probabilities: risk?.probabilities ?? {},
                // Sub-scores from DB
                deliveryScore: latestScore?.deliveryScore ? Number(latestScore.deliveryScore) : 0,
                qualityScore: latestScore?.fulfillmentScore ? Number(latestScore.fulfillmentScore) : 0,
                disputeScore: latestScore?.disputeScore ? Number(latestScore.disputeScore) : 0,
                paymentScore: latestScore?.paymentScore ? Number(latestScore.paymentScore) : 0,
            });
        } else {
            // Get aggregated risk stats
            const vendors = await prisma.vendor.findMany({
                select: {
                    id: true,
                    businessName: true,
                    riskScore: true,
                    riskCategory: true,
                },
            });

            // Calculate distribution
            const distribution = {
                LOW: vendors.filter(v => v.riskCategory === 'LOW').length,
                MEDIUM: vendors.filter(v => v.riskCategory === 'MEDIUM').length,
                HIGH: vendors.filter(v => v.riskCategory === 'HIGH').length,
            };

            // Calculate average risk score
            const avgScore = vendors.reduce((sum, v) => sum + (Number(v.riskScore) || 50), 0) / vendors.length;

            return NextResponse.json({
                totalVendors: vendors.length,
                distribution,
                averageRiskScore: Math.round(avgScore),
                highRiskVendors: vendors.filter(v => v.riskCategory === 'HIGH'),
            });
        }
    } catch (error) {
        console.error('Risk score API error:', error);
        return NextResponse.json(
            { error: 'Failed to get risk scores' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/ai/risk-score
 * Calculate risk score for vendor with custom data
 */
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendorData = await request.json();

        // Run prediction
        const prediction = await runPythonPrediction(vendorData.vendorId, 'risk');

        if (prediction.error) {
            return NextResponse.json({ error: prediction.error }, { status: 400 });
        }

        return NextResponse.json(prediction);
    } catch (error) {
        console.error('Risk score calculation error:', error);
        return NextResponse.json(
            { error: 'Failed to calculate risk score' },
            { status: 500 }
        );
    }
}
