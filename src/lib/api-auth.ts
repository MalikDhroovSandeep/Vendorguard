'use server';

import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export type UserRole = 'admin' | 'internal' | 'vendor';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

/**
 * Get the authenticated user from the session
 * Returns null if not authenticated
 */
export async function getAuthUser(): Promise<AuthUser | null> {
    const session = await auth();

    if (!session?.user) {
        return null;
    }

    return {
        id: session.user.id as string,
        name: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role as UserRole,
    };
}

/**
 * Require authentication - returns user or throws error response
 */
export async function requireAuth(): Promise<AuthUser> {
    const user = await getAuthUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    return user;
}

/**
 * Check if user has one of the required roles
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
    const user = await requireAuth();

    if (!allowedRoles.includes(user.role)) {
        throw new Error('Forbidden');
    }

    return user;
}

/**
 * Create an error response
 */
export function errorResponse(message: string, status: number = 400) {
    return NextResponse.json({ error: message }, { status });
}

/**
 * Create a success response
 */
export function successResponse<T>(data: T, status: number = 200) {
    return NextResponse.json(data, { status });
}
