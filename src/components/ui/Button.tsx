interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    isLoading?: boolean;
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    isLoading = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseClass = 'btn';
    const variantClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

    return (
        <button
            className={`${baseClass} ${variantClass} ${className}`}
            disabled={disabled || isLoading}
            style={{
                width: '100%',
                opacity: disabled || isLoading ? 0.5 : 1,
                cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
                transform: disabled || isLoading ? 'none' : undefined
            }}
            {...props}
        >
            {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ animation: 'spin 1s linear infinite' }}
                    >
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                    </svg>
                    Loading...
                </span>
            ) : children}
            <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </button>
    );
}
