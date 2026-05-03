
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const vendors = await prisma.vendor.findMany({
        select: { id: true, businessName: true, riskScore: true, riskCategory: true }
    });
    console.log('Vendor Count:', vendors.length);
    console.log('Vendors:', JSON.stringify(vendors, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
