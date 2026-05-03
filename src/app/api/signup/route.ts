import { NextResponse } from 'next/server';
import { createUser, getUserByEmail, UserRole } from '@/lib/users';
import { signIn } from '@/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password, role } = body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Validate role
        const validRoles: UserRole[] = ['admin', 'internal', 'vendor'];
        if (!validRoles.includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Create new user
        const newUser = await createUser(name, email, password, role as UserRole);

        return NextResponse.json(
            {
                message: 'User created successfully',
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                }
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
