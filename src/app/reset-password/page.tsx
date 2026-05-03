'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setIsValidating(false);
                return;
            }

            try {
                const res = await fetch(`/api/auth/reset-password?token=${token}`);
                const data = await res.json();
                setIsValidToken(data.valid);
            } catch {
                setIsValidToken(false);
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message);
                setTimeout(() => router.push('/login'), 2000);
            } else {
                setError(data.error || 'Failed to reset password');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isValidating) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="animate-spin" style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid var(--color-border)',
                    borderTopColor: 'var(--color-accent)',
                    borderRadius: '50%',
                    margin: '0 auto'
                }} />
                <p className="text-secondary" style={{ marginTop: '1rem' }}>Validating reset link...</p>
            </div>
        );
    }

    if (!token || !isValidToken) {
        return (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                }}>
                    <span className="material-icons-round" style={{ color: '#ef4444', fontSize: '32px' }}>
                        error_outline
                    </span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Invalid or Expired Link
                </h2>
                <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                    This password reset link is invalid or has expired.
                </p>
                <Link href="/forgot-password" className="link">
                    Request a new reset link
                </Link>
            </div>
        );
    }

    if (message) {
        return (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                }}>
                    <span className="material-icons-round" style={{ color: '#22c55e', fontSize: '32px' }}>
                        check_circle
                    </span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Password Reset!
                </h2>
                <p className="text-secondary">
                    {message} Redirecting to login...
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <p className="text-secondary" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                Enter your new password below.
            </p>

            {error && (
                <div style={{
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#ef4444',
                    fontSize: '0.875rem'
                }}>
                    {error}
                </div>
            )}

            <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />

            <div style={{ marginTop: '1.5rem' }}>
                <Button type="submit" isLoading={isLoading}>
                    Reset Password
                </Button>
            </div>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
        }}>
            <div className="animate-in" style={{ width: '100%', maxWidth: '420px' }}>
                {/* Header */}
                <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                    <div style={{ marginBottom: '0.75rem' }}>
                        <span style={{
                            fontSize: '2.5rem',
                            fontWeight: 700,
                            letterSpacing: '-0.03em'
                        }}>
                            Vendor<span style={{ color: 'var(--color-accent)' }}>Guard</span>
                        </span>
                    </div>
                    <p className="text-secondary" style={{ fontSize: '1rem' }}>
                        Create a new password
                    </p>
                </div>

                {/* Card */}
                <div className="card" style={{ padding: '2rem' }}>
                    <Suspense fallback={<div>Loading...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>

                {/* Footer */}
                <p className="text-center text-secondary text-sm" style={{ marginTop: '2rem' }}>
                    Remember your password?{' '}
                    <Link href="/login" className="link">
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    );
}
