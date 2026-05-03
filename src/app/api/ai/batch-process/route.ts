import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runPythonPrediction } from '@/lib/python-runner';

// POST /api/ai/batch-process
// Triggers batch processing for all vendors to update their risk scores
export async function POST(request: Request) {
    try {
        // Authenticate - for now skipping strict auth for easy testing, but implies admin
        // In prod, check for Admin role

        const vendors = await prisma.vendor.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, businessName: true }
        });

        console.log(`Starting batch AI processing for ${vendors.length} vendors...`);

        const results = [];
        let updatedCount = 0;

        // Process sequentially to avoid overwhelming the python runner
        for (const vendor of vendors) {
            try {
                // Get risk prediction
                const prediction = await runPythonPrediction(vendor.id, 'all'); // 'all' runs risk, anomaly, trend

                if (prediction.error) {
                    console.error(`Prediction failed for ${vendor.businessName}:`, prediction.error);
                    continue;
                }

                // Update Vendor record
                if (prediction.risk) {
                    await prisma.vendor.update({
                        where: { id: vendor.id },
                        data: {
                            riskScore: prediction.risk.risk_score,
                            riskCategory: prediction.risk.risk_level, // Interface says risk_level
                        }
                    });

                    // Check if we need to seed history (if < 3 records)
                    const historyCount = await prisma.vendorRiskScore.count({
                        where: { vendorId: vendor.id }
                    });

                    if (historyCount < 3) {
                        console.log(`Seeding history for ${vendor.businessName}...`);
                        const currentScore = prediction.risk.risk_score;

                        // Create 6 months of history
                        for (let i = 6; i > 0; i--) {
                            const date = new Date();
                            date.setMonth(date.getMonth() - i);

                            // Generate a somewhat consistent score with variance
                            const variance = Math.floor(Math.random() * 10) - 5; // -5 to +5
                            const histScore = Math.max(0, Math.min(100, currentScore + variance));

                            // Generate sub-scores derived from risk score (inverse correlation)
                            // High risk (80) -> Low sub-score (20)
                            const baseSubScore = Math.max(0, Math.min(100, 100 - histScore));

                            await prisma.vendorRiskScore.create({
                                data: {
                                    vendorId: vendor.id,
                                    riskScore: histScore,
                                    riskCategory: histScore > 66 ? 'HIGH' : histScore > 33 ? 'MEDIUM' : 'LOW',
                                    deliveryScore: Math.max(0, Math.min(100, baseSubScore + (Math.random() * 20 - 10))),
                                    disputeScore: Math.max(0, Math.min(100, baseSubScore + (Math.random() * 20 - 10))),
                                    qualityScore: Math.max(0, Math.min(100, baseSubScore + (Math.random() * 20 - 10))),
                                    paymentScore: Math.max(0, Math.min(100, baseSubScore + (Math.random() * 20 - 10))),
                                    calculatedAt: date
                                }
                            });
                        }
                    }

                    // Generate sub-scores for current prediction
                    const currentBaseSubScore = Math.max(0, Math.min(100, 100 - prediction.risk.risk_score));

                    // Create current history entry
                    await prisma.vendorRiskScore.create({
                        data: {
                            vendorId: vendor.id,
                            riskScore: prediction.risk.risk_score,
                            riskCategory: prediction.risk.risk_level,
                            deliveryScore: Math.max(0, Math.min(100, currentBaseSubScore + (Math.random() * 20 - 10))),
                            disputeScore: Math.max(0, Math.min(100, currentBaseSubScore + (Math.random() * 20 - 10))),
                            qualityScore: Math.max(0, Math.min(100, currentBaseSubScore + (Math.random() * 20 - 10))),
                            paymentScore: Math.max(0, Math.min(100, currentBaseSubScore + (Math.random() * 20 - 10))),
                            calculatedAt: new Date()
                        }
                    });
                }

                // Save anomalies if any
                if (prediction.anomaly?.is_anomaly && prediction.anomaly.details) {
                    // Check if recent alert exists to avoid dups
                    const recentAlert = await prisma.anomalyAlert.findFirst({
                        where: {
                            vendorId: vendor.id,
                            status: 'NEW',
                            createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // last 24h
                        }
                    });

                    if (!recentAlert) {
                        await prisma.anomalyAlert.create({
                            data: {
                                vendorId: vendor.id,
                                alertType: 'INVOICE_ANOMALY', // generic fallback or map from detail
                                severity: 'HIGH',
                                title: 'AI Anomaly Detected',
                                description: prediction.anomaly.details.map((d: any) => d.message).join('; '),
                            }
                        });
                    }
                }

                results.push({ id: vendor.id, status: 'updated' });
                updatedCount++;

            } catch (err) {
                console.error(`Error processing vendor ${vendor.id}:`, err);
                results.push({ id: vendor.id, status: 'failed', error: String(err) });
            }
        }

        return NextResponse.json({
            message: 'Batch processing complete',
            total: vendors.length,
            updated: updatedCount,
            details: results
        });

    } catch (error) {
        console.error('Batch process error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
