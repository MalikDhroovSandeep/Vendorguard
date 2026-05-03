const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Get all vendors with their names
    const vendors = await prisma.vendor.findMany({
        select: { id: true, businessName: true, riskScore: true, riskCategory: true }
    });
    console.log('\n=== ALL VENDORS ===');
    console.log('Total Vendors:', vendors.length);
    vendors.forEach(v => console.log(`  - ${v.businessName} (ID: ${v.id}) | Risk Score: ${v.riskScore} | Category: ${v.riskCategory}`));

    // Get VendorRiskScore entries
    const riskScores = await prisma.vendorRiskScore.findMany({
        include: { vendor: { select: { businessName: true } } }
    });
    console.log('\n=== VENDOR RISK SCORES TABLE ===');
    console.log('Total VendorRiskScore entries:', riskScores.length);

    if (riskScores.length > 0) {
        riskScores.forEach(s => console.log(`  - ${s.vendor?.businessName || s.vendorId}: Score=${s.riskScore}, Category=${s.riskCategory}`));
    } else {
        console.log('  *** NO VendorRiskScore entries found! This is why the individual vendor view shows blank data. ***');
    }

    // Check for Dhroov specifically
    const dhroov = vendors.find(v => v.businessName.toLowerCase().includes('dhroov'));
    if (dhroov) {
        console.log('\n=== DHROOV VENDOR ===');
        console.log('ID:', dhroov.id);
        const dhroovScores = await prisma.vendorRiskScore.findMany({
            where: { vendorId: dhroov.id }
        });
        console.log('VendorRiskScore entries for Dhroov:', dhroovScores.length);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
