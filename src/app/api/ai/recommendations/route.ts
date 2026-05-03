import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { runPythonPrediction, checkModelsAvailable } from '@/lib/python-runner';

/**
 * GET /api/ai/recommendations
 * Get smart recommendations for a vendor
 * 
 * Query params:
 * - vendorId: specific vendor ID (required)
 */
export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const vendorId = searchParams.get('vendorId');

        if (!vendorId) {
            return NextResponse.json(
                { error: 'vendorId is required' },
                { status: 400 }
            );
        }

        const modelsReady = await checkModelsAvailable();
        if (!modelsReady) {
            // Return default recommendations when models not available
            return NextResponse.json({
                vendorId,
                recommendations: [
                    {
                        type: 'INFO',
                        priority: 'LOW',
                        title: 'ML Models Not Available',
                        message: 'AI recommendations are not available. Please ensure ML models are trained.',
                        action: 'TRAIN_MODELS',
                    },
                ],
                source: 'fallback',
            });
        }

        // Run full prediction to get all data for recommendations
        const prediction = await runPythonPrediction(vendorId, 'all');

        if (prediction.error) {
            return NextResponse.json({ error: prediction.error }, { status: 400 });
        }

        return NextResponse.json({
            vendorId,
            recommendations: prediction.recommendations || [],
            riskSummary: prediction.risk,
            performanceSummary: prediction.performance,
            source: 'live',
        });
    } catch (error) {
        console.error('Recommendations API error:', error);
        return NextResponse.json(
            { error: 'Failed to get recommendations' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/ai/recommendations
 * Get recommendations for vendor with custom data
 */
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendorData = await request.json();

        if (!vendorData.vendorId) {
            return NextResponse.json(
                { error: 'vendorId is required' },
                { status: 400 }
            );
        }

        const modelsReady = await checkModelsAvailable();
        if (!modelsReady) {
            return NextResponse.json(
                { error: 'ML models not available' },
                { status: 503 }
            );
        }

        // Run full prediction
        const prediction = await runPythonPrediction(vendorData.vendorId, 'all');

        if (prediction.error) {
            return NextResponse.json({ error: prediction.error }, { status: 400 });
        }

        // Priority-based sorting
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        const sortedRecommendations = (prediction.recommendations || []).sort(
            (a, b) => (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) -
                (priorityOrder[b.priority as keyof typeof priorityOrder] || 2)
        );

        return NextResponse.json({
            vendorId: vendorData.vendorId,
            recommendations: sortedRecommendations,
            fullPrediction: prediction,
        });
    } catch (error) {
        console.error('Recommendations error:', error);
        return NextResponse.json(
            { error: 'Failed to generate recommendations' },
            { status: 500 }
        );
    }
}
