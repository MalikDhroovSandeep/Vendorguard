import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    // Redirect to the appropriate dashboard based on user role
    const role = session.user.role;

    switch (role) {
        case 'admin':
            redirect('/dashboard/admin');
        case 'internal':
            redirect('/dashboard/internal');
        case 'vendor':
            redirect('/dashboard/vendor');
        default:
            redirect('/login');
    }
}
