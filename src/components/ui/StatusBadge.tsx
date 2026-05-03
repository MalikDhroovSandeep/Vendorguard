type StatusType = 'approved' | 'pending' | 'rejected' | 'suspended' | 'inactive';

interface StatusBadgeProps {
    status: StatusType;
    label?: string;
}

const statusStyles: Record<StatusType, string> = {
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
    suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
};

const statusLabels: Record<StatusType, string> = {
    approved: 'Approved',
    pending: 'Pending KYC',
    rejected: 'Rejected',
    suspended: 'Suspended',
    inactive: 'Inactive',
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
    return (
        <span
            className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusStyles[status]}`}
        >
            {label || statusLabels[status]}
        </span>
    );
}
