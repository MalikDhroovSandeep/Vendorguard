import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { UserRole as PrismaUserRole } from '@prisma/client';

// Map string roles to Prisma enum
const roleMap: Record<string, PrismaUserRole> = {
    'admin': 'ADMIN',
    'internal': 'INTERNAL_USER',
    'vendor': 'VENDOR',
};

const reverseRoleMap: Record<PrismaUserRole, string> = {
    'ADMIN': 'admin',
    'INTERNAL_USER': 'internal',
    'VENDOR': 'vendor',
};

export type UserRole = 'admin' | 'internal' | 'vendor';

export interface User {
    id: string;
    name: string;
    email: string;
    password: string; // hashed
    role: UserRole;
}

// Find user by email - now uses Prisma
export async function getUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (!user) return null;

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: reverseRoleMap[user.role as PrismaUserRole] as UserRole,
    };
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

// Hash password (for registration)
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

// Add new user (for registration) - now saves to database
export async function createUser(name: string, email: string, password: string, role: UserRole): Promise<User> {
    const hashedPassword = await hashPassword(password);

    const prismaRole = roleMap[role];

    const newUser = await prisma.user.create({
        data: {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: prismaRole,
        },
    });

    return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: reverseRoleMap[newUser.role as PrismaUserRole] as UserRole,
    };
}

// Check if email already exists
export async function emailExists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });
    return !!user;
}
