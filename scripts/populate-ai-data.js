const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function populateSyntheticAIData() {
    console.log('=== Populating Synthetic AI Data for Admin Dashboard ===\n');

    // Get all vendors
    const vendors = await prisma.vendor.findMany({
        select: { id: true, businessName: true, riskScore: true }
    });

    if (vendors.length === 0) {
        console.log('No vendors found!');
        return;
    }

    console.log(`Found ${vendors.length} vendors\n`);

    // 1. POPULATE ANOMALY ALERTS
    console.log('--- Creating Anomaly Alerts ---');

    // Clear existing alerts (optional)
    await prisma.anomalyAlert.deleteMany();
    console.log('Cleared existing anomaly alerts');

    const alertTypes = ['INVOICE_ANOMALY', 'DELIVERY_PATTERN', 'DISPUTE_PATTERN', 'FRAUD_SUSPECTED'];
    const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const statuses = ['NEW', 'UNDER_INVESTIGATION', 'DISMISSED', 'CONFIRMED'];

    const alertTemplates = [
        { type: 'INVOICE_ANOMALY', title: 'Unusual Invoice Amount', desc: 'Invoice amount 50% higher than typical transactions' },
        { type: 'INVOICE_ANOMALY', title: 'Duplicate Invoice Detected', desc: 'Potential duplicate invoice submitted within 24 hours' },
        { type: 'DELIVERY_PATTERN', title: 'Delivery Delays Increasing', desc: 'Recent deliveries show 30% increase in delays' },
        { type: 'DELIVERY_PATTERN', title: 'Inconsistent Delivery Times', desc: 'Delivery times vary significantly from historical patterns' },
        { type: 'DISPUTE_PATTERN', title: 'Rising Dispute Rate', desc: 'Dispute rate increased by 25% this month' },
        { type: 'DISPUTE_PATTERN', title: 'Quality Complaints Pattern', desc: 'Multiple quality-related disputes in short period' },
        { type: 'FRAUD_SUSPECTED', title: 'Suspicious Activity Detected', desc: 'Unusual pattern of transaction modifications detected' },
        { type: 'FRAUD_SUSPECTED', title: 'Identity Verification Issue', desc: 'Contact information changes require verification' },
    ];

    const anomaliesToCreate = [];

    // Create 5-8 anomalies spread across vendors
    for (let i = 0; i < Math.min(8, vendors.length * 2); i++) {
        const vendor = vendors[i % vendors.length];
        const template = alertTemplates[i % alertTemplates.length];
        const severity = severities[Math.floor(Math.random() * severities.length)];
        const status = i < 5 ? 'NEW' : statuses[Math.floor(Math.random() * statuses.length)];

        const daysAgo = Math.floor(Math.random() * 30);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);

        anomaliesToCreate.push({
            vendorId: vendor.id,
            alertType: template.type,
            severity: severity,
            title: template.title,
            description: `${template.desc} - Vendor: ${vendor.businessName}`,
            status: status,
            createdAt: createdAt,
        });
    }

    await prisma.anomalyAlert.createMany({ data: anomaliesToCreate });
    console.log(`Created ${anomaliesToCreate.length} anomaly alerts\n`);

    // 2. POPULATE PERFORMANCE PREDICTIONS
    console.log('--- Creating Performance Predictions ---');

    // Clear existing predictions
    await prisma.vendorPerformancePrediction.deleteMany();
    console.log('Cleared existing predictions');

    const predictionTypes = ['DELIVERY_DELAY', 'DISPUTE_RISK', 'QUALITY_ISSUE'];
    const periods = ['NEXT_30_DAYS', 'NEXT_60_DAYS', 'NEXT_90_DAYS'];

    const predictionsToCreate = [];

    for (const vendor of vendors) {
        const riskScore = Number(vendor.riskScore) || 50;

        // Higher risk vendors get more predictions
        const numPredictions = riskScore > 70 ? 3 : riskScore > 40 ? 2 : 1;

        for (let i = 0; i < numPredictions; i++) {
            const type = predictionTypes[i % predictionTypes.length];
            const baseProb = (riskScore / 100) * 0.7 + Math.random() * 0.3;

            const daysAgo = Math.floor(Math.random() * 7);
            const predictedAt = new Date();
            predictedAt.setDate(predictedAt.getDate() - daysAgo);

            predictionsToCreate.push({
                vendorId: vendor.id,
                predictionType: type,
                probability: Math.min(baseProb, 0.95),
                predictionPeriod: periods[Math.floor(Math.random() * periods.length)],
                details: `AI predicts ${type.toLowerCase().replace('_', ' ')} risk based on historical patterns`,
                predictedAt: predictedAt,
            });
        }
    }

    await prisma.vendorPerformancePrediction.createMany({ data: predictionsToCreate });
    console.log(`Created ${predictionsToCreate.length} performance predictions\n`);

    // 3. VERIFY RISK SCORES EXIST
    console.log('--- Verifying VendorRiskScore Data ---');
    const riskScoreCount = await prisma.vendorRiskScore.count();
    console.log(`VendorRiskScore entries: ${riskScoreCount}`);

    if (riskScoreCount === 0) {
        console.log('  ⚠ No VendorRiskScore entries - run populate-risk-scores.js first!');
    } else {
        console.log('  ✓ VendorRiskScore data exists');
    }

    console.log('\n=== Done! ===');
    console.log('Summary:');
    console.log(`  - Anomaly Alerts: ${anomaliesToCreate.length}`);
    console.log(`  - Performance Predictions: ${predictionsToCreate.length}`);
    console.log(`  - VendorRiskScores: ${riskScoreCount}`);
}

populateSyntheticAIData()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
