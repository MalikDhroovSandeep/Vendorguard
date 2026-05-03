'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || 'Check your email for a reset link!');
            } else {
                setError(data.error || 'Something went wrong');
            }
        } catch {
            setError('Failed to send reset link. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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
                        Reset your password
                    </p>
                </div>

                {/* Card */}
                <div className="card" style={{ padding: '2rem' }}>
                    {message ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '1rem'
                        }}>
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
                                    mark_email_read
                                </span>
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                Check your email
                            </h2>
                            <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                                {message}
                            </p>
                            <Link href="/login" className="link">
                                Back to login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <p className="text-secondary" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                                Enter your email address and we&apos;ll send you a link to reset your password.
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
                                label="Email"
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <div style={{ marginTop: '1.5rem' }}>
                                <Button type="submit" isLoading={isLoading}>
                                    Send Reset Link
                                </Button>
                            </div>
                        </form>
                    )}
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
