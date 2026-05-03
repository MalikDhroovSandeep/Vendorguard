'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
                setIsLoading(false);
                return;
            }

            // Redirect will be handled by middleware based on user role
            router.push('/dashboard');
            router.refresh();
        } catch {
            setError('An error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        signIn(provider, { callbackUrl: '/dashboard' });
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
                        Welcome back! Sign in to continue.
                    </p>
                </div>

                {/* Login Card */}
                <div className="card" style={{ padding: '2rem' }}>
                    <form onSubmit={handleSubmit}>
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

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginBottom: '1.5rem',
                            marginTop: '-0.5rem'
                        }}>
                            <Link href="/forgot-password" className="link text-sm">
                                Forgot password?
                            </Link>
                        </div>

                        <Button type="submit" isLoading={isLoading}>
                            Sign in
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="divider">or continue with</div>

                    {/* Social Login Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                width: '100%',
                                padding: '0.75rem 1rem',
                                backgroundColor: 'var(--color-surface)',
                                border: '1.5px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                fontSize: '0.9375rem',
                                fontWeight: 500,
                                color: 'var(--color-text-primary)',
                                transition: 'all 0.2s ease'
                            }}
                            className="hover:border-[var(--color-border-focus)] hover:bg-[var(--color-surface-hover)]"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSocialLogin('facebook')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                width: '100%',
                                padding: '0.75rem 1rem',
                                backgroundColor: '#1877F2',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                fontSize: '0.9375rem',
                                fontWeight: 500,
                                color: 'white',
                                transition: 'all 0.2s ease'
                            }}
                            className="hover:opacity-90"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Continue with Facebook
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-secondary text-sm" style={{ marginTop: '2rem' }}>
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="link">
                        Create one
                    </Link>
                </p>
            </div>
        </main>
    );
}
