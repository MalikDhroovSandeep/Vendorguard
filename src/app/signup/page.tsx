'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { RoleSelector, UserRole } from '@/components/ui/RoleSelector';

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) return;

        setError('');
        setIsLoading(true);

        try {
            // First, create the user account
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create account');
                setIsLoading(false);
                return;
            }

            // Auto-login after successful signup
            const signInResult = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (signInResult?.error) {
                // Account created but login failed - redirect to login page
                router.push('/login');
                return;
            }

            // Redirect to dashboard
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
            <div className="animate-in" style={{ width: '100%', maxWidth: '520px' }}>
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
                        Create your account to get started.
                    </p>
                </div>

                {/* Signup Card */}
                <div className="card" style={{ padding: '2rem' }}>
                    {/* Social Login Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1rem',
                                backgroundColor: 'var(--color-surface)',
                                border: '1.5px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: 'var(--color-text-primary)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSocialLogin('facebook')}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1rem',
                                backgroundColor: '#1877F2',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: 'white',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSocialLogin('apple')}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1rem',
                                backgroundColor: 'var(--color-text-primary)',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: 'var(--color-bg)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                            </svg>
                            Apple
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="divider">or sign up with email</div>

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
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <Input
                                label="Full Name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                            <Input
                                label="Email"
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <Input
                            label="Password"
                            type="password"
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <RoleSelector selectedRole={role} onSelect={setRole} />

                        <Button type="submit" isLoading={isLoading} disabled={!role}>
                            Create account
                        </Button>

                        <p className="text-center text-muted text-sm" style={{ marginTop: '1rem' }}>
                            By signing up, you agree to our{' '}
                            <Link href="#" className="link">Terms</Link>
                            {' '}and{' '}
                            <Link href="#" className="link">Privacy Policy</Link>
                        </p>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-secondary text-sm" style={{ marginTop: '2rem' }}>
                    Already have an account?{' '}
                    <Link href="/login" className="link">
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    );
}
