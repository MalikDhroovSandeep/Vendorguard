'use client';

export type UserRole = 'admin' | 'internal' | 'vendor';

interface RoleSelectorProps {
    selectedRole: UserRole | null;
    onSelect: (role: UserRole) => void;
}

const roles: { value: UserRole; label: string; description: string; icon: string }[] = [
    {
        value: 'internal',
        label: 'Internal User',
        description: 'Procurement and operations',
        icon: '📋'
    },
    {
        value: 'vendor',
        label: 'Vendor',
        description: 'Supplier or service provider',
        icon: '🏢'
    }
];

export function RoleSelector({ selectedRole, onSelect }: RoleSelectorProps) {
    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <label className="label">Select your role</label>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem'
            }}>
                {roles.map((role) => {
                    const isSelected = selectedRole === role.value;
                    return (
                        <button
                            key={role.value}
                            type="button"
                            onClick={() => onSelect(role.value)}
                            className={`role-card ${role.value} ${isSelected ? 'selected' : ''}`}
                        >
                            <div className="role-icon">
                                {role.icon}
                            </div>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
                                {role.label}
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                opacity: isSelected ? 0.8 : 0.6,
                                lineHeight: 1.4
                            }}>
                                {role.description}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
