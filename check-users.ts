import { prisma } from './src/lib/prisma';

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true
        }
    });

    console.log('---------------------------------------------------------------------------------');
    console.log('Found ' + users.length + ' users in the database:');
    console.log('---------------------------------------------------------------------------------');

    users.forEach(user => {
        console.log(`Name:  ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role:  ${user.role}`);
        console.log(`ID:    ${user.id}`);
        console.log('---------------------------------------------------------------------------------');
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
