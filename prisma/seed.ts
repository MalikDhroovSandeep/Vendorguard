import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('Starting database seed...');
    console.log('Testing database connection...');

    try {
        // Test connection first
        await prisma.$connect();
        console.log('Connected to database successfully!');
    } catch (connError) {
        console.error('Database connection failed:', connError);
        throw connError;
    }

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const internalPassword = await bcrypt.hash('internal123', 10);
    const vendorPassword = await bcrypt.hash('vendor123', 10);

    console.log('Creating admin user...');
    // Create default admin user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@vendorguard.com' },
        update: {},
        create: {
            email: 'admin@vendorguard.com',
            name: 'Admin User',
            password: adminPassword,
            role: 'ADMIN',
            status: 'ACTIVE',
        },
    });
    console.log(`Created admin user: ${admin.email}`);

    console.log('Creating internal user...');
    // Create default internal user
    const internal = await prisma.user.upsert({
        where: { email: 'internal@vendorguard.com' },
        update: {},
        create: {
            email: 'internal@vendorguard.com',
            name: 'Internal User',
            password: internalPassword,
            role: 'INTERNAL_USER',
            status: 'ACTIVE',
        },
    });
    console.log(`Created internal user: ${internal.email}`);

    console.log('Creating vendor user...');
    // Create default vendor user
    const vendor = await prisma.user.upsert({
        where: { email: 'vendor@vendorguard.com' },
        update: {},
        create: {
            email: 'vendor@vendorguard.com',
            name: 'Vendor User',
            password: vendorPassword,
            role: 'VENDOR',
            status: 'ACTIVE',
        },
    });
    console.log(`Created vendor user: ${vendor.email}`);

    console.log('Database seeding completed!');
    console.log('\nDefault user credentials:');
    console.log('  Admin: admin@vendorguard.com / admin123');
    console.log('  Internal: internal@vendorguard.com / internal123');
    console.log('  Vendor: vendor@vendorguard.com / vendor123');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('Seed error:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
