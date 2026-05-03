const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Populate VendorRiskScore table with historical entries for all vendors.
 * Creates 6 months of historical data based on current vendor risk scores.
 */
async function populateVendorRiskScores() {
    console.log('🚀 Starting VendorRiskScore population...\n');

    // Get all vendors
    const vendors = await prisma.vendor.findMany({
        select: {
            id: true,
            businessName: true,
            riskScore: true,
            riskCategory: true,
        }
    });

    console.log(`Found ${vendors.length} vendors to process.\n`);

    // Clear existing risk scores (optional - comment out if you want to keep existing)
    const deleted = await prisma.vendorRiskScore.deleteMany({});
    console.log(`Cleared ${deleted.count} existing VendorRiskScore entries.\n`);

    const months = 6; // Generate 6 months of history
    let totalCreated = 0;

    for (const vendor of vendors) {
        const baseScore = Number(vendor.riskScore) || 50;
        const category = vendor.riskCategory || 'MEDIUM';

        console.log(`Processing: ${vendor.businessName} (Base Score: ${baseScore}, Category: ${category})`);

        const entries = [];
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            date.setDate(1); // Set to first of month

            // Add some realistic variation to scores
            const variation = (Math.random() - 0.5) * 15; // ±7.5 points
            const riskScore = Math.max(0, Math.min(100, baseScore + variation));

            // Generate component scores with similar logic
            const deliveryScore = Math.max(0, Math.min(100, 75 + (Math.random() - 0.5) * 30));
            const disputeScore = Math.max(0, Math.min(100, 70 + (Math.random() - 0.5) * 25));
            const paymentScore = Math.max(0, Math.min(100, 80 + (Math.random() - 0.5) * 20));
            const fulfillmentScore = Math.max(0, Math.min(100, 78 + (Math.random() - 0.5) * 22));

            entries.push({
                vendorId: vendor.id,
                riskScore: Math.round(riskScore * 100) / 100,
                riskCategory: getRiskCategory(riskScore),
                deliveryScore: Math.round(deliveryScore * 100) / 100,
                disputeScore: Math.round(disputeScore * 100) / 100,
                paymentScore: Math.round(paymentScore * 100) / 100,
                fulfillmentScore: Math.round(fulfillmentScore * 100) / 100,
                calculatedAt: date,
            });
        }

        // Create all entries for this vendor
        await prisma.vendorRiskScore.createMany({
            data: entries
        });

        totalCreated += entries.length;
        console.log(`  ✓ Created ${entries.length} historical entries\n`);
    }

    console.log('='.repeat(50));
    console.log(`✅ Done! Created ${totalCreated} VendorRiskScore entries total.`);

    // Verify
    const count = await prisma.vendorRiskScore.count();
    console.log(`📊 Total entries in VendorRiskScore table: ${count}`);
}

function getRiskCategory(score) {
    if (score <= 33) return 'LOW';
    if (score <= 66) return 'MEDIUM';
    return 'HIGH';
}

populateVendorRiskScores()
    .catch(e => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
