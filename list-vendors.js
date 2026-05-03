const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const vendors = await prisma.user.findMany({
        where: { role: 'VENDOR' },
        select: { email: true, name: true }
    });
    console.log('Vendor Users:');
    console.log(JSON.stringify(vendors, null, 2));
}

main().finally(() => prisma.$disconnect());
